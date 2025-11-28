import React, { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import { CartContext } from './context/CartContext';
import { useLanguage } from './context/LanguageContext';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword
} from 'firebase/auth'; 
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// --- Page Components Imports ---
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// --- Header Component Import ---
import Header from './components/Header';

// Ultra Premium Luxury Color Palette
const PremiumColors = {
  DeepMatteBlack: '#000000',
  PureWhite: '#FFFFFF',
  ElectricBlueStart: '#009DFF',
  ElectricBlueEnd: '#00FFE0',
  TextHover: 'rgba(255, 255, 255, 0.7)',
  GlassWhite: 'rgba(255, 255, 255, 0.05)',
  GlassBorder: 'rgba(255, 255, 255, 0.08)',
  BlueGlowIntense: 'rgba(0, 157, 255, 0.4)',
  AmbientMist: 'rgba(0, 157, 255, 0.03)',
  CoolGray: '#B0B0B0',
  Platinum: '#E5E5E5'
};

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  // --- Global State Management ---
  const [itemsToCheckout, setItemsToCheckout] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // React Router Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Firebase instances
  const dbRef = useRef(null);
  const authRef = useRef(null);
  const storageRef = useRef(null);
  const appIdRef = useRef(null);

  // Create refs for navigation to prevent dependency issues
  const navigateRef = useRef(navigate);
  const locationPathnameRef = useRef(location.pathname);

  // Update refs when values change
  useEffect(() => {
    navigateRef.current = navigate;
    locationPathnameRef.current = location.pathname;
  }, [navigate, location.pathname]);

  const { t } = useLanguage();

  // Define the list of allowed admin UIDs - useMemo to prevent recreation
  const ADMIN_UIDS = useMemo(() => [
    '3eHD6AZMLAef5GSZkQgrXt4RgrC2',
  ], []);

  const { addToCart, clearCart } = useContext(CartContext);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // --- Firebase Initialization and Authentication Listener ---
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const firebaseConfigFromGlobal = window.__firebase_config
          ? JSON.parse(window.__firebase_config)
          : {};

        const appIdFromGlobal = window.__app_id || null;

        const firebaseConfig = {
          apiKey: firebaseConfigFromGlobal.apiKey || process.env.REACT_APP_FIREBASE_API_KEY,
          authDomain: firebaseConfigFromGlobal.authDomain || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
          projectId: firebaseConfigFromGlobal.projectId || process.env.REACT_APP_FIREBASE_PROJECT_ID,
          storageBucket: firebaseConfigFromGlobal.storageBucket || process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: firebaseConfigFromGlobal.messagingSenderId || process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_SENDER_ID,
          appId: firebaseConfigFromGlobal.appId || process.env.REACT_APP_FIREBASE_APP_ID,
          measurementId: firebaseConfigFromGlobal.measurementId || process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
        };

        const currentAppId = appIdFromGlobal || firebaseConfig.projectId;

        if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
          console.error("Critical Firebase config values are missing");
          return;
        }

        const app = initializeApp(firebaseConfig);
        const dbInstance = getFirestore(app);
        const authInstance = getAuth(app);
        const storageInstance = getStorage(app);

        dbRef.current = dbInstance;
        authRef.current = authInstance;
        storageRef.current = storageInstance;
        appIdRef.current = currentAppId;

        // Auth State Listener - FIXED: Use refs to prevent dependency issues
        const unsubscribeAuth = onAuthStateChanged(authRef.current, async (user) => {
          if (user) {
            // Batch state updates to prevent multiple re-renders
            const isAdminUser = ADMIN_UIDS.includes(user.uid);
            
            // Use functional updates and batch together
            setCurrentUser(user);
            setIsAdmin(isAdminUser);

            if (isAdminUser && locationPathnameRef.current === '/login') {
              navigateRef.current('/admin');
            }
          } else {
            if (!authRef.current.currentUser) {
              try {
                const anonUserCredential = await signInAnonymously(authRef.current);
                setCurrentUser(anonUserCredential.user);
                setIsAdmin(false);
              } catch (anonError) {
                console.error("Failed to sign in anonymously:", anonError);
                setCurrentUser(null);
                setIsAdmin(false);
              }
            }
          }
        });

        return () => {
          unsubscribeAuth();
        };

      } catch (e) {
        console.error("Firebase initialization error:", e);
      }
    };

    initFirebase();
  }, [ADMIN_UIDS]); // Only depend on ADMIN_UIDS which is memoized

  // Scroll to top handler - memoized
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Handles admin login with email/password
   */
  const handleAdminLogin = useCallback(async (email, password) => {
    if (!authRef.current) {
      console.error('Firebase not initialized');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        authRef.current,
        email,
        password
      );

      const isAdminUser = ADMIN_UIDS.includes(userCredential.user.uid);
      
      // Batch state updates
      setCurrentUser(userCredential.user);
      setIsAdmin(isAdminUser);

      if (isAdminUser) {
        navigateRef.current('/admin');
        console.log('Admin login successful');
      } else {
        console.warn('Permission denied: Admin access only');
        await signOut(authRef.current);
        const anonUserCredential = await signInAnonymously(authRef.current);
        setCurrentUser(anonUserCredential.user);
      }
    } catch (error) {
      console.error("Admin login error:", error);
    }
  }, [ADMIN_UIDS]);

  /**
   * Handles user logout
   */
  const handleLogout = useCallback(async () => {
    if (authRef.current) {
      try {
        await signOut(authRef.current);
        navigateRef.current('/products');
        console.log('Logout successful');
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  }, []);

  /**
   * Handles navigation between pages using React Router's navigate
   */
  const handleNavigate = useCallback((page, param = null) => {
    window.scrollTo(0, 0);

    if (page === 'admin') {
      if (isAdmin) {
        navigateRef.current('/admin');
      } else {
        console.warn('Permission denied: Admin access only');
        navigateRef.current('/products');
      }
    } else if (page === 'products') {
      navigateRef.current('/products');
    } else if (page === 'productDetail' && param) {
      navigateRef.current(`/product/${param}`);
    } else if (page === 'cart') {
      navigateRef.current('/cart');
    } else if (page === 'checkout' && param?.selectedItems) {
      setItemsToCheckout(param.selectedItems);
      navigateRef.current('/checkout');
    } else if (page === 'login') {
      navigateRef.current('/login');
    } else if (page === 'about') {
      navigateRef.current('/about');
    } else if (page === 'contact') {
      navigateRef.current('/contact');
    } else {
      navigateRef.current('/products');
    }
  }, [isAdmin]);

  /**
   * Handles placing an order
   */
  const handlePlaceOrder = useCallback(async (orderDetails) => {
    const currentDb = dbRef.current;
    const currentAuth = authRef.current;
    const currentAppId = appIdRef.current;

    if (!currentDb || !currentAuth?.currentUser?.uid || !currentAppId) {
      console.error('Failed to place order: Ensure Firebase connection');
      return;
    }

    try {
      const ordersCollectionRef = collection(currentDb, `artifacts/${currentAppId}/public/data/orders`);
      await addDoc(ordersCollectionRef, {
        ...orderDetails,
        userId: currentAuth.currentUser.uid,
        placedAt: new Date(),
        orderStatus: 'Pending Call',
      });
      navigateRef.current('/products');
      clearCart();
      console.log('Order placed successfully. Thank you for your order.');
    } catch (e) {
      console.error("Order placement error:", e);
    }
  }, [clearCart]);

  // Memoize the routes configuration to prevent unnecessary re-renders
  const routesConfig = useMemo(() => [
    { path: "/", element: <ProductListingPage onAddToCart={addToCart} onNavigate={handleNavigate} /> },
    { path: "/products", element: <ProductListingPage onAddToCart={addToCart} onNavigate={handleNavigate} /> },
    { path: "/product/:productId", element: <ProductDetailPage onAddToCart={addToCart} onNavigate={handleNavigate} /> },
    { path: "/cart", element: <CartPage onNavigate={handleNavigate} currencySymbol="DZD" /> },
    { 
      path: "/checkout", 
      element: <CheckoutPage
        selectedItems={itemsToCheckout}
        onPlaceOrder={handlePlaceOrder}
        onClearCart={clearCart}
        onNavigate={handleNavigate}
        db={dbRef.current}
        auth={authRef.current}
        appId={appIdRef.current}
        currencySymbol="DZD"
      />
    },
    { 
      path: "/admin", 
      element: <AdminPage
        onNavigate={handleNavigate}
        db={dbRef.current}
        storage={storageRef.current}
        auth={authRef.current}
        appId={appIdRef.current}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onLogout={handleLogout}
        currencySymbol="DZD"
      />
    },
    { 
      path: "/login", 
      element: <LoginPage
        onNavigate={handleNavigate}
        onAdminLogin={handleAdminLogin}
        auth={authRef.current}
      />
    }
  ], [
    addToCart, 
    handleNavigate, 
    itemsToCheckout, 
    handlePlaceOrder, 
    clearCart, 
    isAdmin, 
    currentUser, 
    handleLogout, 
    handleAdminLogin
  ]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{
        backgroundColor: PremiumColors.DeepMatteBlack,
        color: PremiumColors.PureWhite,
        fontFamily: "'Clash Display', 'Satoshi', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Premium Background Effects */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, ${PremiumColors.ElectricBlueStart}05 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${PremiumColors.ElectricBlueEnd}03 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${PremiumColors.BlueGlowIntense}02 0%, transparent 50%)
          `,
          opacity: 0.8
        }}
      ></div>

      {/* Animated Glow Orbs */}
      <div 
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none z-0 animate-pulse-slow"
        style={{
          background: `radial-gradient(circle, ${PremiumColors.ElectricBlueStart}40, transparent 70%)`,
          animation: 'float 6s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="fixed bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none z-0 animate-pulse-slower"
        style={{
          background: `radial-gradient(circle, ${PremiumColors.ElectricBlueEnd}30, transparent 70%)`,
          animation: 'float 8s ease-in-out infinite reverse'
        }}
      ></div>

      {/* Header component */}
      <Header
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onLogout={handleLogout}
        currencySymbol="DZD"
      />

      {/* ScrollToTop Component */}
      <ScrollToTop />

      {/* Main content area */}
      <main className="flex-grow w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex justify-center items-start relative z-10">
        <Routes>
          {routesConfig.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>

      {/* Ultra Premium Footer */}
      <footer
        className="w-full relative overflow-hidden pt-20 pb-12 mt-20"
        style={{
          backgroundColor: PremiumColors.DeepMatteBlack,
          borderTop: `1px solid ${PremiumColors.GlassBorder}`,
          backdropFilter: 'blur(40px)',
          fontFamily: "'Clash Display', 'Satoshi', 'Outfit', sans-serif"
        }}
      >
        {/* Footer Background Effects */}
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{
            background: `radial-gradient(circle, ${PremiumColors.ElectricBlueStart}40, transparent 70%)`
          }}
        ></div>
        <div
          className="absolute top-0 left-0 w-60 h-60 rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{
            background: `radial-gradient(circle, ${PremiumColors.ElectricBlueEnd}30, transparent 70%)`
          }}
        ></div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-16">
            {/* Brand Section */}
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <div
                className="flex items-center justify-center md:justify-start mb-8 cursor-pointer group"
                onClick={() => handleNavigate('products')}
              >
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"
                    style={{
                      background: `radial-gradient(circle at center, ${PremiumColors.ElectricBlueStart}30, ${PremiumColors.ElectricBlueEnd}25, transparent 70%)`,
                    }}
                  ></div>
                  <div
                    className="text-3xl font-black tracking-widest relative z-10 transition-all duration-500 group-hover:scale-110"
                    style={{
                      color: PremiumColors.PureWhite,
                      fontFamily: "'Clash Display', sans-serif",
                      fontWeight: 900,
                      letterSpacing: '0.2em'
                    }}
                  >
                    VIZO
                  </div>
                </div>
              </div>
              <p 
                className="text-base leading-relaxed mt-6 premium-subtitle"
                style={{ 
                  color: PremiumColors.Platinum,
                  lineHeight: '1.8',
                  fontWeight: 300
                }}
              >
                Your premier destination for luxury fashion and exceptional service. 
                Discover elegance and excellence with us.
              </p>

              {/* Premium Social Links */}
              <div className="flex justify-center md:justify-start space-x-4 mt-8">
                {[
                  { platform: 'instagram', iconPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                  { platform: 'tiktok', iconPath: 'M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
                  { platform: 'facebook', iconPath: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                  { platform: 'twitter', iconPath: 'M22.46 6c-.8.36-1.6.6-2.4.7-.8-.8-1.9-1.3-3.2-1.3-2.4 0-4.4 2-4.4 4.4 0 .34.04.67.12.98-3.7-.18-7-1.97-9.2-4.7C3.1 8 2.6 9.5 2.6 11.2c0 1.5.7 2.9 1.8 3.7-.7 0-1.4-.2-2-.5v.06c0 2.2 1.6 4 3.7 4.4-.4.1-.8.14-1.2.14-.3 0-.6 0-.9-.08.6 1.8 2.3 3 4.2 3-1.6 1.2-3.6 1.9-5.8 1.9-.3 0-.6 0-.9-.04C2.8 20.8 5.1 22 7.5 22c9.05 0 14-7.5 14-14 0-.2 0-.4-.02-.6.9-.68 1.7-1.5 2.3-2.5z' }
                ].map((social) => (
                  <a
                    key={social.platform}
                    href={`#${social.platform}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-social-icon group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 transition-all duration-500 group-hover:scale-110"
                      style={{ fill: PremiumColors.PureWhite }}
                    >
                      <path d={social.iconPath} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h3 
                className="text-xl font-bold mb-8 pb-4 tracking-widest uppercase premium-section-title"
                style={{ 
                  color: PremiumColors.PureWhite,
                  borderBottom: `2px solid ${PremiumColors.GlassBorder}`,
                  fontFamily: "'Clash Display', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.1em'
                }}
              >
                QUICK LINKS
              </h3>
              <ul className="space-y-4">
                {[
                  { key: 'products', label: 'PRODUCTS' },
                  { key: 'cart', label: 'SHOPPING CART' },
                  { key: 'admin', label: 'ADMIN PANEL' },
                  { key: 'about', label: 'ABOUT US' },
                  { key: 'contact', label: 'CONTACT' }
                ].map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => handleNavigate(item.key)}
                      className="premium-footer-link group"
                    >
                      <span
                        className="premium-footer-link-bullet"
                        style={{
                          background: `linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd})`
                        }}
                      ></span>
                      {item.label}
                      <span
                        className="premium-footer-link-arrow"
                        style={{ color: PremiumColors.ElectricBlueStart }}
                      >→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h3 
                className="text-xl font-bold mb-8 pb-4 tracking-widest uppercase premium-section-title"
                style={{ 
                  color: PremiumColors.PureWhite,
                  borderBottom: `2px solid ${PremiumColors.GlassBorder}`,
                  fontFamily: "'Clash Display', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.1em'
                }}
              >
                CONTACT US
              </h3>
              <div className="space-y-6">
                {[
                  { 
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-16.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-16.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    ), 
                    text: 'CONTACT@VIZOLUXURY.COM'
                  },
                  { 
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.355c0-.18-.035-.357-.102-.52l-2.094-5.029a1.125 1.125 0 00-1.206-.52c-.381.117-.75.219-1.117.304M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ), 
                    text: '+213 0542 613 454'
                  },
                  { 
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 2.25l-7.5 7.5-6.06 6.06c-1.336 1.336-1.336 3.504 0 4.84l.75.75c1.336 1.336 3.504 1.336 4.84 0l6.06-6.06 7.5-7.5c.66-.66.66-1.728 0-2.388L17.432 2.25c-.66-.66-1.728-.66-2.388 0z" />
                      </svg>
                    ), 
                    text: 'ALGERIA'
                  }
                ].map((item, index) => (
                  <div key={index} className="premium-contact-item">
                    <div
                      className="premium-contact-icon"
                      style={{
                        background: `linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd})`,
                        color: PremiumColors.PureWhite
                      }}
                    >
                      {item.icon}
                    </div>
                    <span 
                      className="premium-contact-text"
                      style={{ color: PremiumColors.Platinum }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="text-center md:text-left">
              <h3 
                className="text-xl font-bold mb-8 pb-4 tracking-widest uppercase premium-section-title"
                style={{ 
                  color: PremiumColors.PureWhite,
                  borderBottom: `2px solid ${PremiumColors.GlassBorder}`,
                  fontFamily: "'Clash Display', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.1em'
                }}
              >
                NEWSLETTER
              </h3>
              <p 
                className="text-base leading-relaxed mb-6 premium-subtitle"
                style={{ 
                  color: PremiumColors.Platinum,
                  lineHeight: '1.8',
                  fontWeight: 300
                }}
              >
                Subscribe to our newsletter to receive exclusive updates and premium offers.
              </p>
              <div className="premium-newsletter-form">
                <input
                  type="email"
                  placeholder="YOUR EMAIL ADDRESS"
                  className="premium-newsletter-input"
                  style={{
                    backgroundColor: PremiumColors.GlassWhite,
                    border: `2px solid ${PremiumColors.GlassBorder}`,
                    color: PremiumColors.PureWhite
                  }}
                />
                <button
                  className="premium-newsletter-button"
                  style={{
                    background: `linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd})`,
                    color: PremiumColors.PureWhite
                  }}
                >
                  SUBSCRIBE
                </button>
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div 
            className="border-t pt-8 mt-12 text-center"
            style={{ 
              borderTop: `2px solid ${PremiumColors.GlassBorder}` 
            }}
          >
            <p 
              className="text-sm tracking-widest uppercase"
              style={{ 
                color: PremiumColors.Platinum,
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 500,
                letterSpacing: '0.1em'
              }}
            >
              &copy; {new Date().getFullYear()} VIZO LUXURY BOUTIQUE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>

        {/* Premium Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="premium-scroll-top"
            style={{
              background: `linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd})`,
              color: PremiumColors.PureWhite
            }}
            aria-label="Back to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </footer>

      {/* Ultra Premium Global Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700,800,900&f[]=satoshi@400,500,600,700,800,900&display=swap');

        /* Premium Animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-25px) translateX(15px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.12;
          }
          50% {
            opacity: 0.2;
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.12;
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0, 157, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(0, 157, 255, 0.6);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 7s ease-in-out infinite;
        }

        /* Premium Typography Classes */
        .premium-section-title {
          font-feature-settings: 'salt' on, 'ss01' on;
          text-shadow: 0 2px 20px rgba(0, 157, 255, 0.3);
        }

        .premium-subtitle {
          font-feature-settings: 'salt' on, 'ss01' on;
          font-weight: 350;
        }

        /* Premium Social Icons */
        .premium-social-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          background: ${PremiumColors.GlassWhite};
          border: 1px solid ${PremiumColors.GlassBorder};
          backdrop-filter: blur(20px);
        }

        .premium-social-icon:hover {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid ${PremiumColors.ElectricBlueStart};
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 12px 40px rgba(0, 157, 255, 0.4);
          animation: glow 2s ease-in-out infinite;
        }

        /* Premium Footer Links */
        .premium-footer-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 0;
          background: transparent;
          border: none;
          color: ${PremiumColors.Platinum};
          position: relative;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          font-family: 'Clash Display', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          width: 100%;
          text-align: left;
        }

        .premium-footer-link:hover {
          color: ${PremiumColors.PureWhite};
          transform: translateX(8px);
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
        }

        .premium-footer-link-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 16px;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: scale(0);
        }

        .premium-footer-link:hover .premium-footer-link-bullet {
          opacity: 1;
          transform: scale(1.2);
        }

        .premium-footer-link-arrow {
          margin-left: 12px;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translateX(-10px);
        }

        .premium-footer-link:hover .premium-footer-link-arrow {
          opacity: 1;
          transform: translateX(5px);
        }

        /* Premium Contact Items */
        .premium-contact-item {
          display: flex;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          padding: 0.5rem;
          border-radius: 8px;
        }

        .premium-contact-item:hover {
          transform: translateX(8px);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .premium-contact-icon {
          padding: 0.75rem;
          border-radius: 10px;
          margin-right: 16px;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 4px 20px rgba(0, 157, 255, 0.3);
        }

        .premium-contact-item:hover .premium-contact-icon {
          transform: scale(1.15) rotate(5deg);
          box-shadow: 0 8px 30px rgba(0, 157, 255, 0.5);
        }

        .premium-contact-text {
          font-size: 0.95rem;
          font-weight: 400;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          letter-spacing: 0.02em;
        }

        .premium-contact-item:hover .premium-contact-text {
          color: ${PremiumColors.PureWhite} !important;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }

        /* Premium Newsletter Form */
        .premium-newsletter-form {
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          border: 2px solid ${PremiumColors.GlassBorder};
          background: rgba(0, 0, 0, 0.3);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .premium-newsletter-form:hover {
          border-color: ${PremiumColors.ElectricBlueStart};
          box-shadow: 0 8px 40px rgba(0, 157, 255, 0.2);
        }

        .premium-newsletter-input {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          outline: none;
          font-family: 'Clash Display', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
          background: transparent;
        }

        .premium-newsletter-input::placeholder {
          color: ${PremiumColors.Platinum};
          font-weight: 300;
          text-transform: uppercase;
        }

        .premium-newsletter-input:focus {
          background: rgba(255, 255, 255, 0.08);
        }

        .premium-newsletter-button {
          padding: 1rem 2rem;
          border: none;
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .premium-newsletter-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 157, 255, 0.4);
        }

        .premium-newsletter-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.7s ease;
        }

        .premium-newsletter-button:hover::before {
          left: 100%;
        }

        /* Premium Scroll to Top Button */
        .premium-scroll-top {
          position: fixed;
          bottom: 3rem;
          right: 3rem;
          padding: 1rem;
          border-radius: 14px;
          border: none;
          backdrop-filter: blur(20px);
          box-shadow: 0 12px 50px rgba(0, 157, 255, 0.4);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: glow 3s ease-in-out infinite;
        }

        .premium-scroll-top:hover {
          transform: translateY(-5px) scale(1.1);
          box-shadow: 0 20px 60px rgba(0, 157, 255, 0.6);
        }

        /* Ultra Smooth transitions for premium feel */
        * {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Premium responsive adjustments */
        @media (max-width: 768px) {
          .premium-newsletter-form {
            flex-direction: column;
          }
          
          .premium-newsletter-input {
            border-radius: 12px 12px 0 0;
            text-align: center;
          }
          
          .premium-newsletter-button {
            border-radius: 0 0 12px 12px;
            width: 100%;
          }

          .premium-scroll-top {
            bottom: 2rem;
            right: 2rem;
            padding: 0.875rem;
          }
        }

        /* Premium selection styles */
        ::selection {
          background: ${PremiumColors.ElectricBlueStart}40;
          color: ${PremiumColors.PureWhite};
        }

        /* Premium scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${PremiumColors.DeepMatteBlack};
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueEnd}, ${PremiumColors.ElectricBlueStart});
        }
      `}</style>
    </div>
  );
}

export default App;