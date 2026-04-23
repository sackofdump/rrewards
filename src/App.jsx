import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import OrderHistory from './pages/OrderHistory';
import Promotions from './pages/Promotions';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDetail from './pages/admin/CustomerDetail';

function CustomerApp() {
  return (
    <div className="relative min-h-svh">
      <Routes>
        <Route path="/"        element={<Dashboard />} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/promos"  element={<Promotions />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function AdminApp() {
  return (
    <div className="min-h-svh">
      <Routes>
        <Route path="/admin"               element={<AdminDashboard />} />
        <Route path="/admin/customers/:id" element={<CustomerDetail />} />
      </Routes>
    </div>
  );
}

function AppRouter() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return isAdmin ? <AdminApp /> : <CustomerApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
