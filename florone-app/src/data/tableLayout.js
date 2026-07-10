// layout مشترک نقشه میزها — viewBox: 400 × 620

export const ZONE = {
  top:    { y1: 12,  y2: 132 },
  mid:    { y1: 136, y2: 378 },
  bottom: { y1: 382, y2: 608 },
};

export const faNum = (n) =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

export const TABLE_LAYOUT = [
  { id: 18, key: "18",  x: 52,  y: 28,  w: 50, h: 46, cap: 2 },
  { id: 20, key: "20",  x: 278, y: 24,  w: 50, h: 46, cap: 2 },
  { id: 17, key: "17",  x: 108, y: 84,  w: 50, h: 46, cap: 2 },
  { id: 19, key: "19",  x: 228, y: 84,  w: 50, h: 46, cap: 2 },

  { id: 16, key: "16", x: 26, y: 148, w: 54, h: 50, cap: 4 },
  { id: 15, key: "15", x: 26, y: 208, w: 54, h: 50, cap: 4 },
  { id: 14, key: "14", x: 26, y: 268, w: 54, h: 50, cap: 4 },
  { id: 13, key: "13", x: 26, y: 328, w: 54, h: 50, cap: 4 },

  { id: 12, key: "12", x: 20,  y: 404, w: 52, h: 52, cap: 2 },
  { id: 11, key: "11", x: 20,  y: 466, w: 52, h: 52, cap: 2 },
  { id: 10, key: "10", x: 20,  y: 528, w: 52, h: 52, cap: 2 },
  { id: 9,  key: "9",  x: 86,  y: 400, w: 52, h: 52, cap: 2 },

  { id: 6, key: "6", x: 152, y: 392, w: 52, h: 52, cap: 2 },
  { id: 8, key: "8", x: 152, y: 456, w: 52, h: 52, cap: 2 },
  { id: 7, key: "7", x: 152, y: 518, w: 52, h: 96, cap: 6 },
  { id: 5, key: "5", x: 216, y: 456, w: 52, h: 96, cap: 6 },
  { id: 4, key: "3b", x: 216, y: 562, w: 52, h: 48, cap: 2 },

  { id: 3, key: "3a", x: 312, y: 404, w: 52, h: 52, cap: 2 },
  { id: 2, key: "2",  x: 312, y: 466, w: 52, h: 52, cap: 2 },
  { id: 1, key: "1",  x: 312, y: 528, w: 52, h: 52, cap: 2 },
];

export const CUSTOMER_COLORS = {
  busy: {
    stroke: "rgba(255,245,230,0.5)",
    fill:   "rgba(255,94,40,0.22)",
  },
  free: {
    stroke: "rgba(255,252,242,0.3)",
    fill:   "rgba(255,252,242,0.06)",
  },
  reserved: {
    stroke: "#f0b429",
    fill:   "rgba(240,180,41,0.20)",
  },
  full: {
    stroke: "#eb5e28",
    fill:   "rgba(235,94,40,0.28)",
  },
  selected: {
    stroke: "#85B7EB",
    fill:   "rgba(133,183,235,0.22)",
  },
};

export const CASHIER_COLORS = {
  empty: {
    stroke: "rgba(255,252,242,0.3)",
    fill:   "rgba(255,252,242,0.05)",
  },
  active: {
    stroke: "#eb5e28",
    fill:   "rgba(235,94,40,0.18)",
  },
  cleaning: {
    stroke: "#f0b429",
    fill:   "rgba(240,180,41,0.15)",
  },
  selected: {
    stroke: "#85B7EB",
    fill:   "rgba(133,183,235,0.2)",
  },
};
