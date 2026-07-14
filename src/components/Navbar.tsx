import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Home, LogOut, Menu, User, X, Shield } from "lucide-react";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BookOpen className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold">LearnHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                <Shield className="w-4 h-4 text-accent" />
                Admin Panel
              </Link>
            )}

            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light rounded-btn">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-accent transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary-light border-t border-gray-700 px-4 py-3 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
            >
              <Shield className="w-4 h-4 text-accent" />
              Admin Panel
            </Link>
          )}
          {user && (
            <>
              <div className="flex items-center gap-2 text-gray-300 py-2">
                <User className="w-4 h-4 text-accent" />
                <span className="text-sm">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-300 hover:text-accent py-2 w-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
