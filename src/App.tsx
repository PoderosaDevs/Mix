import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Produtos from "./pages/Produtos";
import Marcas from "./pages/Marcas";
import Lojas from "./pages/Lojas";
import Mix from "./pages/Mix";
import MixUsuario from "./pages/MixUsuario";
import MinhaLoja from "./pages/MinhaLoja";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { signed, usuario, loading } = useAuth();

  if (loading) return null; 

  if (!signed) {
    return <Navigate to="/" />;
  }

  if (roles && !roles.includes(usuario?.cargo || "")) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/marcas" element={<Marcas />} />
              <Route path="/lojas" element={<Lojas />} />
              <Route path="/mix" element={<Mix />} />
              <Route path="/meu-mix" element={<MixUsuario />} />
              
              <Route 
                path="/usuarios" 
                element={
                  <ProtectedRoute roles={["ADMIN", "GERENTE"]}>
                    <Usuarios />
                  </ProtectedRoute>
                } 
              />
            </Route>

            <Route path="/loja/:token" element={<MinhaLoja />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;