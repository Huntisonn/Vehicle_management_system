// src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute, RoleRoute } from '@/routes/ProtectedRoute';

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VehicleListPage = lazy(() => import('@/pages/vehicles/VehicleListPage'));
const VehicleDetailPage = lazy(() => import('@/pages/vehicles/VehicleDetailPage'));
const CustomerDashboard = lazy(() => import('@/pages/dashboard/CustomerDashboard'));
const OwnerDashboard = lazy(() => import('@/pages/dashboard/OwnerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/dashboard/AdminDashboard'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 min
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <p className="text-zinc-400 text-sm">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/vehicles" element={<VehicleListPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

            {/* Customer protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } />

            {/* Owner protected */}
            <Route path="/owner/*" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } />

            {/* Admin protected */}
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } />

            {/* Shared protected */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f4f4f5' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f4f4f5' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
