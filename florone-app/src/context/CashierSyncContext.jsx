import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TABLE_LAYOUT } from "../data/tableLayout";
import { buildInitialTableState } from "../data/sampleCashierData";
import { DEFAULT_SECTION } from "../admin/adminConfig";
import { authHeaders } from "../utils/cashierAuth";
import notifSound from "../assets/sound/notif.mp3";

const API_BASE = "http://localhost:5000";
const POLL_MS = 10_000;
const ALARM_DURATION_MS = 3000; // loop the notification sound for ~3s per the spec

const CashierSyncContext = createContext(null);

export function useCashierSync() {
  const ctx = useContext(CashierSyncContext);
  if (!ctx) {
    throw new Error("useCashierSync must be used within a CashierSyncProvider");
  }
  return ctx;
}

/* ── normalize the /api/orders payload to be keyed by the layout table key ──
   Supports both backends: florone-app/server keys by table.code (== layout key),
   while the standalone backend keys by the numeric table id. */
function normalizeOrders(data) {
  const out = {};
  for (const [rawKey, entry] of Object.entries(data ?? {})) {
    let layout = TABLE_LAYOUT.find((t) => t.key === rawKey);
    if (!layout) {
      const idNum = entry?.tableId ?? Number(rawKey);
      layout = TABLE_LAYOUT.find((t) => String(t.id) === String(idNum));
    }
    const key = layout ? layout.key : rawKey;
    out[key] = { status: entry?.status ?? "active", orders: entry?.orders ?? [] };
  }
  return out;
}

/* ── derive the UI status of a single table from its orders ── */
function computeUi(entry) {
  const orders = entry?.orders ?? [];
  if (orders.length === 0) return { status: "empty", unread: 0 };
  const unread = orders.filter((o) => !o.acknowledged).length;
  // pending = has orders the cashier hasn't opened yet (stays "simple" + dot)
  // active  = has orders, all already seen (turns orange)
  return { status: unread > 0 ? "pending" : "active", unread };
}

export function CashierSyncProvider({ children }) {
  const queryClient = useQueryClient();

  const [tableStates, setTableStates] = useState(() =>
    buildInitialTableState(TABLE_LAYOUT)
  );
  const [toasts, setToasts] = useState([]); // [{ tableKey, tableId, count }]
  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  // shared panel navigation so a toast can jump to the dashboard + open a table
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);
  const [pendingOpenKey, setPendingOpenKey] = useState(null);

  const serverVersionRef = useRef(null);
  const seenOrderIds = useRef(new Set());
  const dismissedKeys = useRef(new Set());

  /* ── Notification sound (looping the provided file for a few seconds) ── */
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const alarmStopRef = useRef(null);

  const getAudio = useCallback(() => {
    if (typeof Audio === "undefined") return null;
    if (!audioRef.current) {
      const el = new Audio(notifSound);
      el.loop = true;
      el.preload = "auto";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  // Keep an AudioContext alive and resumed. Browsers suspend it when the tab is
  // backgrounded or after long inactivity; resuming it (after a user gesture has
  // happened at least once) keeps subsequent alarm playbacks from being blocked.
  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const stopAlarm = useCallback(() => {
    if (alarmStopRef.current) {
      clearTimeout(alarmStopRef.current);
      alarmStopRef.current = null;
    }
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, []);

  const playAlarm = useCallback(() => {
    const el = getAudio();
    if (!el) return;
    ensureAudioContext();
    if (alarmStopRef.current) clearTimeout(alarmStopRef.current);
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
    const attempt = el.play();
    if (attempt && typeof attempt.catch === "function") {
      // If the browser blocked playback (suspended context / lost activation),
      // resume the context and try one more time.
      attempt.catch(() => {
        ensureAudioContext();
        try {
          el.currentTime = 0;
        } catch {
          /* ignore */
        }
        el.play().catch(() => {});
      });
    }
    alarmStopRef.current = setTimeout(() => stopAlarm(), ALARM_DURATION_MS);
  }, [getAudio, ensureAudioContext, stopAlarm]);

  // Unlock audio on user interaction (browser autoplay policy). We keep the
  // listeners attached (not { once: true }) so every interaction re-primes the
  // element and keeps the autoplay permission fresh — this is what fixes the
  // "plays once then gets blocked" behaviour. We also resume the audio context
  // whenever the tab regains focus/visibility.
  useEffect(() => {
    const unlock = () => {
      ensureAudioContext();
      const el = getAudio();
      if (!el) return;
      const wasMuted = el.muted;
      el.muted = true;
      el.play()
        .then(() => {
          el.pause();
          el.currentTime = 0;
          el.muted = wasMuted;
        })
        .catch(() => {
          el.muted = wasMuted;
        });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") ensureAudioContext();
    };

    const events = ["pointerdown", "keydown", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, unlock));
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, unlock));
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [getAudio, ensureAudioContext]);

  /* ── Phase 1: lightweight version poll (keeps running in background) ── */
  const versionQuery = useQuery({
    queryKey: ["cashier-orders-version"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/orders/version`);
      if (!res.ok) throw new Error("version fetch failed");
      return res.json();
    },
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true, // keep polling when tab hidden/minimized
    refetchOnWindowFocus: true,
    retry: false,
  });

  /* ── Phase 2: heavy full fetch, only triggered when version changes ── */
  const ordersQuery = useQuery({
    queryKey: ["cashier-orders"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (!res.ok) throw new Error("orders fetch failed");
      return res.json();
    },
  });

  useEffect(() => {
    const data = versionQuery.data;
    if (!data) return;
    if (data.version !== serverVersionRef.current) {
      serverVersionRef.current = data.version;
      queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
    }
  }, [versionQuery.data, queryClient]);

  /* ── Reconcile server data → table states, toasts and alarm ── */
  useEffect(() => {
    if (!ordersQuery.data) return;
    const data = normalizeOrders(ordersQuery.data);

    setTableStates({ ...buildInitialTableState(TABLE_LAYOUT), ...data });

    let hasNew = false;
    const perTable = {};
    for (const [code, entry] of Object.entries(data)) {
      for (const o of entry.orders ?? []) {
        if (o.acknowledged) continue;
        perTable[code] = (perTable[code] || 0) + 1;
        if (!seenOrderIds.current.has(o.id)) {
          seenOrderIds.current.add(o.id);
          hasNew = true;
          dismissedKeys.current.delete(code); // a fresh order re-surfaces the toast
        }
      }
    }

    setToasts(
      Object.entries(perTable)
        .filter(([code]) => !dismissedKeys.current.has(code))
        .map(([code, count]) => {
          const layout = TABLE_LAYOUT.find((t) => t.key === code);
          return { tableKey: code, tableId: layout?.id ?? code, count };
        })
    );

    if (hasNew) playAlarm();
  }, [ordersQuery.data, playAlarm]);

  /* ── Online / offline handling + auto-hydration on reconnect ── */
  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      // Do not wait for the 10s cycle — hydrate immediately.
      queryClient.invalidateQueries({ queryKey: ["cashier-orders-version"] });
      queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
    };
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  useEffect(
    () => () => {
      stopAlarm();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    },
    [stopAlarm]
  );

  const isOnline = isBrowserOnline && !versionQuery.isError;

  /* ── Derived views ── */
  const mapTables = useMemo(
    () =>
      TABLE_LAYOUT.map((t) => {
        const ui = computeUi(tableStates[t.key]);
        return { ...t, status: ui.status, hasUnread: ui.unread > 0 };
      }),
    [tableStates]
  );

  const stats = useMemo(() => {
    let active = 0;
    let empty = 0;
    let pending = 0;
    for (const t of TABLE_LAYOUT) {
      const ui = computeUi(tableStates[t.key]);
      if (ui.status === "empty") empty++;
      else active++;
      pending += ui.unread;
    }
    return { active, empty, pending };
  }, [tableStates]);

  /* ── Actions ── */
  const ackOrder = useCallback((tableKey, orderId) => {
    fetch(`${API_BASE}/api/orders/${orderId}/ack`, {
      method: "PATCH",
      headers: authHeaders(),
    }).catch(() => {});
    setTableStates((prev) => {
      const entry = prev[tableKey];
      if (!entry) return prev;
      return {
        ...prev,
        [tableKey]: {
          ...entry,
          orders: entry.orders.map((o) =>
            o.id === orderId
              ? { ...o, acknowledged: true, acknowledgedAt: Date.now() }
              : o
          ),
        },
      };
    });
  }, []);

  const confirmOrder = useCallback((tableKey, orderId) => {
    fetch(`${API_BASE}/api/orders/${orderId}/confirm`, {
      method: "PATCH",
      headers: authHeaders(),
    }).catch(() => {});
    setTableStates((prev) => {
      const entry = prev[tableKey];
      if (!entry) return prev;
      return {
        ...prev,
        [tableKey]: {
          ...entry,
          orders: entry.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "confirmed",
                  acknowledged: true,
                  acknowledgedAt: o.acknowledgedAt ?? Date.now(),
                }
              : o
          ),
        },
      };
    });
  }, []);

  const rejectOrder = useCallback((tableKey, orderId) => {
    fetch(`${API_BASE}/api/orders/${orderId}/reject`, {
      method: "PATCH",
      headers: authHeaders(),
    }).catch(() => {});
    setTableStates((prev) => {
      const entry = prev[tableKey];
      if (!entry) return prev;
      const remaining = entry.orders.filter((o) => o.id !== orderId);
      return {
        ...prev,
        [tableKey]:
          remaining.length === 0
            ? { status: "empty", orders: [] }
            : { ...entry, orders: remaining },
      };
    });
  }, []);

  const openTable = useCallback(
    (tableKey) => {
      // 1) Acknowledge every unseen order of this table (turns it orange, stops alarm)
      const entry = tableStates[tableKey];
      const unacked = (entry?.orders ?? []).filter((o) => !o.acknowledged);
      unacked.forEach((o) => {
        fetch(`${API_BASE}/api/orders/${o.id}/ack`, {
          method: "PATCH",
          headers: authHeaders(),
        }).catch(() => {});
      });

      if (unacked.length > 0) {
        setTableStates((prev) => {
          const cur = prev[tableKey];
          if (!cur) return prev;
          return {
            ...prev,
            [tableKey]: {
              ...cur,
              orders: cur.orders.map((o) =>
                o.acknowledged
                  ? o
                  : { ...o, acknowledged: true, acknowledgedAt: Date.now() }
              ),
            },
          };
        });
      }

      // 2) Clear its toast + stop the alarm
      dismissedKeys.current.add(tableKey);
      setToasts((prev) => prev.filter((t) => t.tableKey !== tableKey));
      stopAlarm();

      // 3) Navigate to the dashboard and request the exact table's modal
      setActiveSection("tables-dashboard");
      setPendingOpenKey(tableKey);
    },
    [tableStates, stopAlarm]
  );

  const closeTable = useCallback(
    (tableKey) => {
      const layout = TABLE_LAYOUT.find((t) => t.key === tableKey);
      fetch(`${API_BASE}/api/orders/close`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ tableKey, tableId: layout?.id }),
      })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
        })
        .catch(() => {});

      setTableStates((prev) => ({
        ...prev,
        [tableKey]: { status: "empty", orders: [] },
      }));
      dismissedKeys.current.add(tableKey);
      setToasts((prev) => prev.filter((t) => t.tableKey !== tableKey));
    },
    [queryClient]
  );

  const dismissToast = useCallback((tableKey) => {
    dismissedKeys.current.add(tableKey);
    setToasts((prev) => prev.filter((t) => t.tableKey !== tableKey));
  }, []);

  const consumePendingOpen = useCallback(() => setPendingOpenKey(null), []);

  const value = useMemo(
    () => ({
      tableStates,
      mapTables,
      stats,
      toasts,
      isOnline,
      activeSection,
      setActiveSection,
      pendingOpenKey,
      consumePendingOpen,
      openTable,
      ackOrder,
      confirmOrder,
      rejectOrder,
      closeTable,
      dismissToast,
    }),
    [
      tableStates,
      mapTables,
      stats,
      toasts,
      isOnline,
      activeSection,
      pendingOpenKey,
      consumePendingOpen,
      openTable,
      ackOrder,
      confirmOrder,
      rejectOrder,
      closeTable,
      dismissToast,
    ]
  );

  return (
    <CashierSyncContext.Provider value={value}>
      {children}
    </CashierSyncContext.Provider>
  );
}
