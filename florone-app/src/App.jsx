import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MenuProvider } from './context/MenuContext';
import { CustomPizzaProvider } from './context/CustomPizzaContext';
import VerticalScrollProgress from './components/VerticalScrollProgress';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CategoryPage from './pages/CategoryPage';
import CustomPizzaPage from './pages/CustomPizzaPage';
import CashierPage from './pages/CashierPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MenuProvider>
        <CustomPizzaProvider>
        <BrowserRouter>
          <VerticalScrollProgress />
          <Routes>
            <Route path="/"                  element={<HomePage />} />
            <Route path="/menu"              element={<MenuPage />} />
            <Route path="/menu/custom-pizza" element={<CustomPizzaPage />} />
            <Route path="/menu/:categoryId"  element={<CategoryPage />} />
            <Route path="/Cashier"            element={<CashierPage />} />
          </Routes>
        </BrowserRouter>
        </CustomPizzaProvider>
      </MenuProvider>
    </QueryClientProvider>
  );
}
