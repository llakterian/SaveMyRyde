import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("smr_admin_jwt"));
    setIsUser(!!localStorage.getItem("smr_user_jwt"));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const logoutAdmin = () => {
    localStorage.removeItem("smr_admin_jwt");
    window.location.href = "/admin/login";
  };

  const logoutUser = () => {
    localStorage.removeItem("smr_user_jwt");
    window.location.href = "/";
  };

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-slate-700/50"
            : "bg-transparent"
        }`}
      >
        <nav className="container-fluid">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-xl">🚗</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold heading-gradient">
                  SaveMyRyde
                </h1>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Kenya's #1 Car Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className={`nav-link ${isActivePath("/") ? "active" : ""}`}
              >
                <span className="mr-2">🏠</span>
                Home
              </Link>
              <Link
                to="/listings"
                className={`nav-link ${isActivePath("/listings") ? "active" : ""}`}
              >
                <span className="mr-2">🔍</span>
                Browse Cars
              </Link>
              <Link
                to="/sell"
                className={`nav-link ${isActivePath("/sell") ? "active" : ""}`}
              >
                <span className="mr-2">💼</span>
                Sell Your Car
              </Link>
              <Link
                to="/advertise"
                className={`nav-link ${isActivePath("/advertise") ? "active" : ""}`}
              >
                <span className="mr-2">📢</span>
                Advertise
              </Link>

              {/* User Menu */}
              {isUser ? (
                <div className="flex items-center space-x-1 ml-4">
                  <Link
                    to="/dashboard"
                    className={`nav-link ${isActivePath("/dashboard") ? "active" : ""}`}
                  >
                    <span className="mr-2">📊</span>
                    Dashboard
                  </Link>
                  <button
                    onClick={logoutUser}
                    className="nav-link text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <span className="mr-2">🚪</span>
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary ml-4">
                  <span className="mr-2">👤</span>
                  Login
                </Link>
              )}

              {/* Admin Menu */}
              {isAdmin && (
                <div className="flex items-center space-x-1 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <Link
                    to="/admin/payments"
                    className={`nav-link text-purple-600 dark:text-purple-400 ${
                      isActivePath("/admin") ? "active" : ""
                    }`}
                  >
                    <span className="mr-2">⚙️</span>
                    Admin
                  </Link>
                  <button
                    onClick={logoutAdmin}
                    className="nav-link text-purple-600 dark:text-purple-400"
                  >
                    <span className="mr-2">🔐</span>
                    Admin Logout
                  </button>
                </div>
              )}

              {/* Theme Toggle */}
              <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`bg-slate-600 dark:bg-slate-300 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen
                      ? "rotate-45 translate-y-1"
                      : "-translate-y-0.5"
                  }`}
                />
                <span
                  className={`bg-slate-600 dark:bg-slate-300 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`bg-slate-600 dark:bg-slate-300 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen
                      ? "-rotate-45 -translate-y-1"
                      : "translate-y-0.5"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen
                ? "max-h-screen opacity-100 pb-6"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl mt-4 p-4 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="space-y-2">
                <Link
                  to="/"
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActivePath("/")
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="mr-3">🏠</span>
                  Home
                </Link>
                <Link
                  to="/listings"
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActivePath("/listings")
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="mr-3">🔍</span>
                  Browse Cars
                </Link>
                <Link
                  to="/sell"
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActivePath("/sell")
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="mr-3">💼</span>
                  Sell Your Car
                </Link>
                <Link
                  to="/advertise"
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActivePath("/advertise")
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="mr-3">📢</span>
                  Advertise
                </Link>

                {/* Mobile User Menu */}
                {isUser ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        isActivePath("/dashboard")
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="mr-3">📊</span>
                      Dashboard
                    </Link>
                    <button
                      onClick={logoutUser}
                      className="block w-full text-left px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <span className="mr-3">🚪</span>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-lg bg-orange-500 text-white text-center font-medium hover:bg-orange-600 transition-colors"
                  >
                    <span className="mr-3">👤</span>
                    Login
                  </Link>
                )}

                {/* Mobile Admin Menu */}
                {isAdmin && (
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                    <Link
                      to="/admin/payments"
                      className="block px-4 py-3 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      <span className="mr-3">⚙️</span>
                      Admin Panel
                    </Link>
                    <button
                      onClick={logoutAdmin}
                      className="block w-full text-left px-4 py-3 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      <span className="mr-3">🔐</span>
                      Admin Logout
                    </button>
                  </div>
                )}

                {/* Mobile Theme Toggle */}
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative container-fluid py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🚗</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold heading-gradient text-white">
                    SaveMyRyde
                  </h3>
                  <span className="text-sm text-slate-400">
                    Kenya's Premier Vehicle Marketplace
                  </span>
                </div>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                Connecting vehicle buyers and sellers across Kenya with a
                secure, modern platform that makes buying and selling cars
                simple and safe.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <span>📘</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <span>🐦</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <span>📷</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <span>💼</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/listings"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Browse Cars
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sell"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Sell Your Car
                  </Link>
                </li>
                <li>
                  <Link
                    to="/advertise"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Advertising
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Car Loans
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Insurance
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Safety Tips
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <p className="text-slate-400">
                  &copy; 2024 SaveMyRyde. All rights reserved.
                </p>
                <p className="text-sm text-slate-500">
                  Helping Kenyans buy and sell vehicles with confidence
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm text-slate-400">
                  Built with ❤️ in Kenya by{" "}
                  <a
                    href="mailto:triolinkl@gmail.com"
                    className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                  >
                    Triolink Ltd.
                  </a>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Need a platform like this? Get in touch!
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Overlay for Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
