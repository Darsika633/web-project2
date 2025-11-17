// Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Heart,
  LogOut,
  UserCircle,
} from "lucide-react";

const Navbar = () => {
  // Wishlist count for badge
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);
    };
    updateWishlistCount();
    window.addEventListener("wishlistChanged", updateWishlistCount);
    return () => window.removeEventListener("wishlistChanged", updateWishlistCount);
  }, []);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const userDropdownRef = useRef(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('userData');
      
      console.log('Checking auth status:', { token: !!token, user: !!user }); // Debug log
      
      if (token) {
        setIsAuthenticated(true);
        if (user) {
          try {
            const parsedUser = JSON.parse(user);
            console.log('Parsed user data:', parsedUser); // Debug log
            setUserData(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUserData(null);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
    };

    checkAuthStatus();
    
    // Listen for storage changes (when user logs in/out in another tab or same tab)
    const handleStorageChange = () => {
      console.log('Storage changed, rechecking auth...'); // Debug log
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for a custom event we can trigger manually
    window.addEventListener('authStateChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserData(null);
    setIsUserDropdownOpen(false);
    
    // Trigger auth state change event
    window.dispatchEvent(new Event('authStateChanged'));
    
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100  transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 lg:h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-50 transition-all duration-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <div className="text-xl lg:text-2xl font-black tracking-[0.15em] text-black">
              TrendBite
              <div className="w-full h-0.5 bg-gradient-to-r from-black via-gray-300 to-transparent mt-1"></div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            <li>
              <a
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 relative group tracking-[0.05em]"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li className="relative group">
              <a
                href="/product"
                className="flex items-center text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 tracking-[0.05em]"
              >
                All Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li>
              <Link
                to="/blog"
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 relative group tracking-[0.05em]"
              >
                Blog
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 relative group tracking-[0.05em]"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li className="relative group">
              <div
                className="relative group"
                onMouseEnter={() => handleDropdown("pages")}
                onMouseLeave={() => handleDropdown("")}
              >
                <span
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 tracking-[0.05em] cursor-pointer"
                >
                  Explore
                  <ChevronDown
                    size={16}
                    className="ml-1 transition-transform duration-200 group-hover:rotate-180"
                  />
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </span>
                {activeDropdown === "pages" && (
                  <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-100 rounded shadow-lg z-20">
                    {!isAuthenticated && (
                      <>
                        <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => handleDropdown("")}>Login</Link>
                        <Link to="/register" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => handleDropdown("")}>Registration</Link>
                      </>
                    )}
                    <Link to="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => handleDropdown("")}>About Us</Link>
                    <Link to="/become-delivery-partner" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => handleDropdown("")}>Become Delivery Partner</Link>
                  </div>
                )}
              </div>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search Button */}
            <button className="p-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-50 transition-all duration-200 transform hover:scale-110">
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Wishlist Button - Hidden on mobile */}
            <a
              href="/wishlist"
              className="hidden sm:block p-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-50 transition-all duration-200 transform hover:scale-110 relative"
              title="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full shadow border-2 border-white animate-pulse">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </a>

            {/* User Account Button */}
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={toggleUserDropdown}
                className="p-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
              >
                <User size={20} strokeWidth={1.5} />
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  {isAuthenticated ? (
                    // Authenticated user menu
                    <>
                      {userData && (
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {userData.firstName} {userData.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{userData.email}</p>
                        </div>
                      )}
                      <a
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <UserCircle size={16} className="mr-2" />
                        Profile
                      </a>
                      <a
                        href="/wishlist"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Heart size={16} className="mr-2" />
                        Wishlist
                      </a>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    // Non-authenticated user menu
                    <>
                      <a
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Login
                      </a>
                      <a
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Sign Up
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <a href="/checkout" className="relative p-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-50 transition-all duration-200 transform hover:scale-110 group">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium transition-all duration-200 group-hover:scale-110">
                0
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden bg-white border-t border-gray-100`}
      >
        <div className="px-4 py-6 space-y-4">
          <a
            href="#"
            className="block text-lg font-medium text-gray-700 hover:text-black transition-colors duration-200 py-2"
          >
            Home
          </a>
          <div className="space-y-2">
          </div>
          <div className="space-y-2">
            <a
              href="/product"
              className="block text-lg font-medium text-gray-700 hover:text-black transition-colors duration-200 py-2"
            >
              All Products
            </a>
          </div>
          <Link
            to="/blog"
            className="block text-lg font-medium text-gray-700 hover:text-black transition-colors duration-200 py-2"
          >
            Blog
          </Link>
          <Link
            to="/contact"
            className="block text-lg font-medium text-gray-700 hover:text-black transition-colors duration-200 py-2"
          >
            Contact
          </Link>
          <div className="space-y-2">
            <button
              onClick={() => handleDropdown("mobile-pages")}
              className="flex items-center justify-between w-full text-lg font-medium text-gray-700 hover:text-black transition-colors duration-200 py-2"
            >
              Explore
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  activeDropdown === "mobile-pages" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeDropdown === "mobile-pages" && (
              <div className="pl-4 space-y-2">
                <Link to="/login" className="block text-gray-600 hover:text-black transition-colors duration-200 py-1" onClick={() => handleDropdown("")}>Login</Link>
                <Link to="/register" className="block text-gray-600 hover:text-black transition-colors duration-200 py-1" onClick={() => handleDropdown("")}>Registration</Link>
                <Link to="/about" className="block text-gray-600 hover:text-black transition-colors duration-200 py-1" onClick={() => handleDropdown("")}>About Us</Link>
              </div>
            )}
          </div>

          {/* Mobile Action Buttons */}
          <div className="pt-4 border-t border-gray-100">
            {isAuthenticated ? (
              // Authenticated mobile menu
              <div className="space-y-3">
                {userData && (
                  <div className="text-center pb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {userData.firstName} {userData.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{userData.email}</p>
                  </div>
                )}
                <a
                  href="/profile"
                  className="flex items-center justify-center px-4 py-2 text-gray-700 hover:text-black transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserCircle size={18} className="mr-2" />
                  Profile
                </a>
                <a
                  href="/wishlist"
                  className="flex items-center justify-center px-4 py-2 text-gray-700 hover:text-black transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart size={18} className="mr-2" />
                  Wishlist
                </a>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center w-full px-4 py-2 text-gray-700 hover:text-black transition-colors duration-200"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              // Non-authenticated mobile menu
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block text-center py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="block text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
