import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppState } from './store';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AnimatePresence } from 'motion/react';

// Pages
import { Login } from './pages/auth/Login';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ContractListPage } from './pages/contracts/ContractListPage';
import { ContractFormPage } from './pages/contracts/ContractFormPage';
import { ContractDetailPage } from './pages/contracts/ContractDetailPage';
import { TemplateListPage } from './pages/templates/TemplateListPage';
import { SignatureQueuePage } from './pages/signatures/SignatureQueuePage';
import { SignaturePublicPage } from './pages/signatures/SignaturePublicPage';
import { ContractManagerPage } from './pages/manager/ContractManagerPage';
import { ObraListPage } from './pages/obras/ObraListPage';
import { ObraDetailPage } from './pages/obras/ObraDetailPage';
import { POListPage } from './pages/purchase-orders/POListPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { UsersPage } from './pages/users/UsersPage';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, token, sidebarOpen } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!user && !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Sidebar */}
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Layout shift based on sidebar state */}
      <div 
        className={`transition-all duration-300 min-h-screen flex flex-col pb-20 md:pb-0 ${
          sidebarOpen ? 'md:pl-64 pl-0' : 'md:pl-20 pl-0'
        }`}
      >
        <Header setMobileMenuOpen={setMobileMenuOpen} />
        
        {/* Dynamic Inner view element */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      {/* Hot toast popup controller */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '13px',
            borderRadius: '8px'
          }
        }} 
      />

      <Routes>
        {/* Public Authentication page */}
        <Route path="/login" element={<Login />} />

        {/* Public Clients signature token collector - unauthenticated route */}
        <Route path="/sign/:token" element={<SignaturePublicPage />} />

        {/* Core Administrative routes wrapped in auth checks */}
        <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
        <Route path="/contracts" element={<ProtectedLayout><ContractListPage /></ProtectedLayout>} />
        <Route path="/contracts/new" element={<ProtectedLayout><ContractFormPage /></ProtectedLayout>} />
        <Route path="/contracts/:id" element={<ProtectedLayout><ContractDetailPage /></ProtectedLayout>} />
        
        <Route path="/templates" element={<ProtectedLayout><TemplateListPage /></ProtectedLayout>} />
        <Route path="/signatures" element={<ProtectedLayout><SignatureQueuePage /></ProtectedLayout>} />
        <Route path="/manager" element={<ProtectedLayout><ContractManagerPage /></ProtectedLayout>} />

        <Route path="/obras" element={<ProtectedLayout><ObraListPage /></ProtectedLayout>} />
        <Route path="/obras/:id" element={<ProtectedLayout><ObraDetailPage /></ProtectedLayout>} />

        <Route path="/purchase-orders" element={<ProtectedLayout><POListPage /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
        
        {/* Supporting both requested flat paths and Sidebar mappings */}
        <Route path="/users" element={<ProtectedLayout><UsersPage /></ProtectedLayout>} />
        <Route path="/settings/users" element={<ProtectedLayout><UsersPage /></ProtectedLayout>} />

        {/* Root fallback redirection checks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
