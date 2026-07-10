// src/data/sampleCashierData.js
// وضعیت اولیه پنل صندوق: همه میزها آزاد (بدون داده‌ی نمونه).

export function buildInitialTableState(layout) {
  const state = {};
  layout.forEach((t) => {
    state[t.key] = { status: "empty", orders: [] };
  });
  return state;
}
