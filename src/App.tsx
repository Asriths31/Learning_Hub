import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import AdminPage from "./pages/AdminPage";

// Create a TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Fetch fresh data on page mount/navigation
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Routes>
              {/* Auth pages (no navbar/footer) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected pages (with navbar/footer) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <main className="flex-1">
                        <HomePage />
                      </main>
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <main className="flex-1">
                        <AdminPage />
                      </main>
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/video/:id"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <main className="flex-1">
                        <VideoPlayerPage />
                      </main>
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
