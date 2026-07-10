import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { menuItems as seedMenuItems } from "../data/menuData";
import {
  buildMenuFromApiItems,
  countMenuStats,
  createEmptyMenuItem,
  dedupeById,
  getDiscountedItems,
  getFloravanSpecials,
  getNextItemId,
  getPopularItems,
  loadMenuFromStorage,
  mapApiItem,
  normalizeMenuItems,
  saveMenuToStorage,
} from "../data/menuItemUtils";
import { authHeaders } from "../utils/cashierAuth";

const MenuContext = createContext(null);
const API_URL = "http://localhost:5000/menu-items";
const MENU_QUERY_KEY = ["menu-items"];
const POLL_MS = 30_000;

export function MenuProvider({ children }) {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((message, type = "success") => {
    setNotice({ message, type });

    window.clearTimeout(window.__floravanNoticeTimeout);
    window.__floravanNoticeTimeout = window.setTimeout(() => {
      setNotice(null);
    }, 3000);
  }, []);

  // ── Read path: the database is the source of truth. localStorage acts only as
  // an instant-paint cache (placeholderData) and is refreshed from the server on
  // every successful fetch, so it can never override fresher server data.
  const menuQuery = useQuery({
    queryKey: MENU_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("menu fetch failed");
      }
      const items = await response.json();
      const menu = buildMenuFromApiItems(items, seedMenuItems);
      saveMenuToStorage(menu);
      return menu;
    },
    placeholderData: () => loadMenuFromStorage(seedMenuItems),
    staleTime: 0,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });

  const menuItems = menuQuery.data ?? loadMenuFromStorage(seedMenuItems);

  // Apply a local update to the cached menu without persisting to localStorage;
  // the follow-up invalidate/refetch pulls server truth and refreshes the cache.
  const updateMenuCache = useCallback(
    (updater) => {
      queryClient.setQueryData(MENU_QUERY_KEY, (prev) =>
        updater(prev ?? loadMenuFromStorage(seedMenuItems))
      );
    },
    [queryClient]
  );

  const refreshMenu = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY });
  }, [queryClient]);

  const getCategory = useCallback(
    (categoryId) => menuItems[categoryId] ?? null,
    [menuItems]
  );

  const buildFormData = (draft) => {
    const formData = new FormData();

    Object.entries(draft).forEach(([key, value]) => {
      if (value === undefined || value === null || key === "imageFile") {
        return;
      }

      if (key === "categoryId") {
        formData.append("category", value);
        return;
      }

      if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
        return;
      }

      formData.append(key, value);
    });

    if (draft.imageFile) {
      formData.append("image", draft.imageFile);
    }

    return formData;
  };

  const addItem = useCallback(
    async (categoryId, draft) => {
      const category = menuItems[categoryId];
      if (!category) return null;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: buildFormData(draft),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotice(data.error || "خطا در افزودن محصول", "error");
        throw new Error(data.error || "خطا در افزودن محصول");
      }

      const item = mapApiItem(
        {
          ...createEmptyMenuItem(categoryId),
          ...draft,
          ...data,
          image: data.image || draft.image,
          id: data.id || getNextItemId(category.items),
          category: categoryId,
        },
        categoryId
      );

      updateMenuCache((prev) => {
        const cat = prev[categoryId];
        if (!cat) return prev;
        return {
          ...prev,
          [categoryId]: {
            ...cat,
            items: dedupeById([...cat.items, item]),
          },
        };
      });

      showNotice("محصول با موفقیت اضافه شد");
      refreshMenu();

      return item;
    },
    [menuItems, updateMenuCache, refreshMenu, showNotice]
  );

  const updateItem = useCallback(
    async (categoryId, itemId, updates) => {
      const category = menuItems[categoryId];
      if (!category) return;

      const response = await fetch(`${API_URL}/${itemId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: buildFormData(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotice(data.error || "خطا در ویرایش محصول", "error");
        throw new Error(data.error || "خطا در ویرایش محصول");
      }

      updateMenuCache((prev) => {
        const cat = prev[categoryId];
        if (!cat) return prev;
        return {
          ...prev,
          [categoryId]: {
            ...cat,
            items: cat.items.map((item) =>
              item.id === itemId
                ? mapApiItem(
                    {
                      ...item,
                      ...updates,
                      ...data,
                      image: data.image || updates.image || item.image,
                      id: item.id,
                      category: categoryId,
                    },
                    categoryId
                  )
                : item
            ),
          },
        };
      });

      showNotice("ویرایش محصول انجام شد");
      refreshMenu();
    },
    [menuItems, updateMenuCache, refreshMenu, showNotice]
  );

  const deleteItem = useCallback(
    async (categoryId, itemId) => {
      const category = menuItems[categoryId];
      if (!category) return;

      const response = await fetch(`${API_URL}/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotice(data.error || "خطا در حذف محصول", "error");
        throw new Error(data.error || "خطا در حذف محصول");
      }

      updateMenuCache((prev) => {
        const cat = prev[categoryId];
        if (!cat) return prev;
        return {
          ...prev,
          [categoryId]: {
            ...cat,
            items: cat.items.filter((item) => item.id !== itemId),
          },
        };
      });

      showNotice("محصول حذف شد");
      refreshMenu();
    },
    [menuItems, updateMenuCache, refreshMenu, showNotice]
  );

  const resetMenu = useCallback(() => {
    const fresh = normalizeMenuItems(seedMenuItems);
    queryClient.setQueryData(MENU_QUERY_KEY, fresh);
    saveMenuToStorage(fresh);
  }, [queryClient]);

  const stats = useMemo(() => countMenuStats(menuItems), [menuItems]);
  const floravanSpecials = useMemo(() => getFloravanSpecials(menuItems), [menuItems]);
  const popularItems = useMemo(() => getPopularItems(menuItems), [menuItems]);
  const discountedItems = useMemo(() => getDiscountedItems(menuItems), [menuItems]);

  const value = useMemo(
    () => ({
      menuItems,
      getCategory,
      addItem,
      updateItem,
      deleteItem,
      resetMenu,
      stats,
      floravanSpecials,
      popularItems,
      discountedItems,
      notice,
    }),
    [
      menuItems,
      getCategory,
      addItem,
      updateItem,
      deleteItem,
      resetMenu,
      stats,
      floravanSpecials,
      popularItems,
      discountedItems,
      notice,
    ]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu must be used within MenuProvider");
  }
  return ctx;
}
