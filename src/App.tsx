
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { loginSuccess } from './store/slices/authSlice';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Components
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import RoutersPage from './pages/RoutersPage';
import AddressListsPage from './pages/AddressListsPage';
import FirewallPage from './pages/FirewallPage';
import SyncPage from './pages/SyncPage';
import BackupPage from './pages/BackupPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';

const AuthChecker = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Verifica se c'è un utente salvato localmente
    const savedUser = localStorage.getItem('mikrotik_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch(loginSuccess(user));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('mikrotik_user');
      }
    }
  }, [dispatch]);
  
  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  return (
    <>
      <AuthChecker />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/routers" element={
            <ProtectedRoute>
              <RoutersPage />
            </ProtectedRoute>
          } />
          <Route path="/address-lists" element={
            <ProtectedRoute>
              <AddressListsPage />
            </ProtectedRoute>
          } />
          <Route path="/firewall" element={
            <ProtectedRoute>
              <FirewallPage />
            </ProtectedRoute>
          } />
          <Route path="/sync" element={
            <ProtectedRoute>
              <SyncPage />
            </ProtectedRoute>
          } />
          <Route path="/backup" element={
            <ProtectedRoute>
              <BackupPage />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </Provider>
  );
};

export default App;
