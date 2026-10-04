import { Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import LoginPage from "./pages/staff/LoginPage";
import KitchenPage from "./pages/staff/KitchenPage";
import WaiterPage from "./pages/staff/WaiterPage";
import CashierPage from "./pages/staff/CashierPage";
import ManagerPage from "./pages/staff/ManagerPage";



function App() {
  return (
    <Routes>
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order/:orderId" element={<OrderStatusPage />} />
      <Route path="/staff/login" element={<LoginPage />} />
      <Route path="/staff/kitchen" element={<KitchenPage />} />
      <Route path="/staff/waiter" element={<WaiterPage />} />
      <Route path="/staff/cashier" element={<CashierPage />} />
      <Route path="/staff/manager" element={<ManagerPage />} />
    </Routes>
  );
}

export default App;