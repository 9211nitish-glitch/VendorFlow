import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { UserRole } from "@shared/schema";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import AuthCallback from "@/pages/auth/AuthCallback";

// Admin Pages
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import TaskManagement from "@/pages/admin/TaskManagement";
import UserManagement from "@/pages/admin/UserManagement";
import ReferralSystem from "@/pages/admin/ReferralSystem";
import PackageManagement from "@/pages/admin/PackageManagement";

// Vendor Pages
import VendorLayout from "@/components/layout/VendorLayout";
import VendorDashboard from "@/pages/vendor/Dashboard";
import VendorTasks from "@/pages/vendor/Tasks";
import VendorPackage from "@/pages/vendor/Package";
import VendorReferrals from "@/pages/vendor/Referrals";
import VendorProfile from "@/pages/vendor/Profile";

import NotFound from "@/pages/not-found";

function AuthPages() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <>
      {showLogin ? (
        <Login onSwitchToRegister={() => setShowLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/auth/error" component={() => <Login />} />
        <Route path="/" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <Switch>
      {user.role === UserRole.ADMIN ? (
        <>
          <Route path="/" component={() => (
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          )} />
          <Route path="/admin" component={() => (
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          )} />
          <Route path="/admin/dashboard" component={() => (
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          )} />
          <Route path="/admin/tasks" component={() => (
            <AdminLayout>
              <TaskManagement />
            </AdminLayout>
          )} />
          <Route path="/admin/users" component={() => (
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          )} />
          <Route path="/admin/referrals" component={() => (
            <AdminLayout>
              <ReferralSystem />
            </AdminLayout>
          )} />
          <Route path="/admin/packages" component={() => (
            <AdminLayout>
              <PackageManagement />
            </AdminLayout>
          )} />
        </>
      ) : (
        <>
          <Route path="/" component={() => (
            <VendorLayout>
              <VendorDashboard />
            </VendorLayout>
          )} />
          <Route path="/vendor" component={() => (
            <VendorLayout>
              <VendorDashboard />
            </VendorLayout>
          )} />
          <Route path="/vendor/dashboard" component={() => (
            <VendorLayout>
              <VendorDashboard />
            </VendorLayout>
          )} />
          <Route path="/vendor/tasks" component={() => (
            <VendorLayout>
              <VendorTasks />
            </VendorLayout>
          )} />
          <Route path="/vendor/packages" component={() => (
            <VendorLayout>
              <VendorPackage />
            </VendorLayout>
          )} />
          <Route path="/vendor/package" component={() => (
            <VendorLayout>
              <VendorPackage />
            </VendorLayout>
          )} />
          <Route path="/vendor/referrals" component={() => (
            <VendorLayout>
              <VendorReferrals />
            </VendorLayout>
          )} />
          <Route path="/vendor/profile" component={() => (
            <VendorLayout>
              <VendorProfile />
            </VendorLayout>
          )} />
        </>
      )}
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppRouter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
