import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import Teachers from "@/pages/Teachers";
import Classes from "@/pages/Classes";
import Attendance from "@/pages/Attendance";
import Gradebook from "@/pages/Gradebook";
import Schedule from "@/pages/Schedule";
import Fees from "@/pages/Fees";
import Salaries from "@/pages/Salaries";
import Announcements from "@/pages/Announcements";
import IDCards from "@/pages/IDCards";
import ReportCard from "@/pages/ReportCard";
import BusManagement from "@/pages/BusManagement";
import Settings from "@/pages/Settings";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return <AppLayout />;
}

function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (session) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/gradebook" element={<Gradebook />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/fees" element={<Fees />} />
              <Route path="/salaries" element={<Salaries />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/id-cards" element={<IDCards />} />
              <Route path="/bus" element={<BusManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminOnlyRoute><AdminPanel /></AdminOnlyRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
