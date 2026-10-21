import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ElectricianDetailPage } from './pages/ElectricianDetailPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ElectricianDashboard } from './pages/ElectricianDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <Router>
                <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#080C14] dark:text-slate-100 transition-colors duration-200">
                  <Navbar />
                  <main className="flex-1 pb-16 md:pb-0">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/electricians/:id" element={<ElectricianDetailPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />

                      {/* Customer Protected Route */}
                      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
                        <Route path="/dashboard" element={<CustomerDashboard />} />
                      </Route>

                      {/* Electrician Protected Route */}
                      <Route element={<ProtectedRoute allowedRoles={['ELECTRICIAN']} />}>
                        <Route path="/electrician/dashboard" element={<ElectricianDashboard />} />
                      </Route>

                      {/* Admin Protected Route */}
                      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                      </Route>

                      {/* Shared Booking Protected Route (Customer, Electrician, Admin) */}
                      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ELECTRICIAN', 'ADMIN']} />}>
                        <Route path="/bookings/:id" element={<BookingDetailPage />} />
                      </Route>

                      {/* 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  <Footer />
                  <MobileBottomBar />
                </div>
              </Router>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
</QueryClientProvider>
  );
};

export default App;
