import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PIZZA_BUILDER_CONFIG,
  PIZZA_TOPPINGS,
  normalizeCustomPizzaConfig,
  calcCustomPizzaPrice,
  getToppingPrice,
} from '../data/customPizzaData';

const API_BASE = 'http://localhost:5000';
const STORAGE_KEY = 'floravan-custom-pizza-config-v4';

const CustomPizzaContext = createContext(null);

function readCachedConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedConfig(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function getFallbackConfig() {
  return normalizeCustomPizzaConfig({
    settings: {
      basePriceMedium: PIZZA_BUILDER_CONFIG.basePrices.medium,
      basePriceFamily: PIZZA_BUILDER_CONFIG.basePrices.family,
      familyToppingMultiplier: PIZZA_BUILDER_CONFIG.familyToppingMultiplier,
      minToppings: PIZZA_BUILDER_CONFIG.minToppings,
      maxToppings: PIZZA_BUILDER_CONFIG.maxToppings,
    },
    toppings: PIZZA_TOPPINGS.map((t, i) => ({
      id: t.id,
      name: t.name,
      emoji: t.emoji,
      group: t.group,
      priceMedium: t.price,
      priceFamily: Math.round(t.price * PIZZA_BUILDER_CONFIG.familyToppingMultiplier),
      available: t.available,
      sortOrder: i,
    })),
  });
}

async function fetchCustomPizzaConfig() {
  const res = await fetch(`${API_BASE}/api/custom-pizza/config`);
  if (!res.ok) throw new Error('config fetch failed');
  const data = await res.json();
  writeCachedConfig(data);
  return data;
}

export function CustomPizzaProvider({ children }) {
  const cached = useMemo(() => readCachedConfig(), []);

  const query = useQuery({
    queryKey: ['custom-pizza-config'],
    queryFn: fetchCustomPizzaConfig,
    staleTime: 30_000,
    placeholderData: cached ?? undefined,
    retry: 1,
  });

  const config = useMemo(() => {
    const normalized = normalizeCustomPizzaConfig(query.data);
    return normalized ?? getFallbackConfig();
  }, [query.data]);

  const apiPayload = query.data ?? cached;

  const value = useMemo(
    () => ({
      config,
      apiPayload,
      toppings: config.toppings,
      settings: config,
      isLoading: query.isLoading && !query.data && !cached,
      isError: query.isError,
      refetch: query.refetch,
      calcPrice: (size, selected) => calcCustomPizzaPrice(size, selected, config),
      getToppingPrice: (topping, size) => getToppingPrice(topping, size, config),
    }),
    [config, apiPayload, query.isLoading, query.data, cached, query.isError, query.refetch]
  );

  return (
    <CustomPizzaContext.Provider value={value}>
      {children}
    </CustomPizzaContext.Provider>
  );
}

export function useCustomPizza() {
  const ctx = useContext(CustomPizzaContext);
  if (!ctx) {
    throw new Error('useCustomPizza must be used within CustomPizzaProvider');
  }
  return ctx;
}

export { STORAGE_KEY as CUSTOM_PIZZA_CONFIG_STORAGE_KEY };
