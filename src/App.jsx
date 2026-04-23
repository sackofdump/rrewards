import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderHistory from './pages/OrderHistory';
import Promotions from './pages/Promotions';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDetail from './pages/admin/CustomerDetail';

function MobileShell({ children }) {
  return (
    <div
      className="flex flex-col bg-[#080a0f]"
      style={{
        position: 'fixed',
        inset: 0,
        maxWidth: 430,
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {children}
    </div>
  );
}

function CustomerApp() {
  return (
    <ProtectedRoute>
      <MobileShell>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/history" element={<OrderHistory />} />
            <Route path="/promos"  element={<Promotions />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <BottomNav />
      </MobileShell>
    </ProtectedRoute>
  );
}

function AdminApp() {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }} className="bg-[#080a0f]">
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
  const isLogin = pathname === '/login';

  if (isLogin) return (
    <MobileShell>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <Routes><Route path="/login" element={<Login />} /></Routes>
      </div>
    </MobileShell>
  );
  if (isAdmin) return <AdminApp />;
  return <CustomerApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
