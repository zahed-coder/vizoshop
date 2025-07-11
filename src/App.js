import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { CartContext } from './context/CartContext';
import { useLanguage } from './context/LanguageContext';

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

// --- Page Components Imports ---
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// --- Header Component Import ---
import Header from './components/Header'; // Correctly imported Header component

// =====================================================================
// --- App Component (Main Application Structure) ---
// =====================================================================
function App() {
  // --- Global State Management ---
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemsToCheckout, setItemsToCheckout] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Firebase instances (initialized in useEffect)
  const dbRef = useRef(null);
  const authRef = useRef(null);
  const appIdRef = useRef(null);

  const { t } = useLanguage();

  // Define the list of allowed admin UIDs
  const ADMIN_UIDS = useRef([
    '3eHD6AZMLAef5GSZkQgrXt4RgrC2', // Your admin UID
  ]);

  const { addToCart, clearCart } = useContext(CartContext);

  // --- Firebase Initialization and Authentication Listener ---
  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Check for global variables
        const firebaseConfigFromGlobal = window.__firebase_config
          ? JSON.parse(window.__firebase_config)
          : {};

        const appIdFromGlobal = window.__app_id || null;
        // const initialAuthTokenFromGlobal = window.__initial_auth_token || null; // This was not used

        const firebaseConfig = {
          apiKey: firebaseConfigFromGlobal.apiKey || process.env.REACT_APP_FIREBASE_API_KEY,
          authDomain: firebaseConfigFromGlobal.authDomain || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
          projectId: firebaseConfigFromGlobal.projectId || process.env.REACT_APP_FIREBASE_PROJECT_ID,
          storageBucket: firebaseConfigFromGlobal.storageBucket || process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: firebaseConfigFromGlobal.messagingSenderId || process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
          appId: firebaseConfigFromGlobal.appId || process.env.REACT_APP_FIREBASE_APP_ID,
          measurementId: firebaseConfigFromGlobal.measurementId || process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
        };

        const currentAppId = appIdFromGlobal || firebaseConfig.projectId; // Using projectId as a fallback for appId

        if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
          console.error("Critical Firebase config values are missing");
          setProductsError("Firebase configuration incomplete. Check environment variables.");
          setProductsLoading(false);
          return;
        }

        const app = initializeApp(firebaseConfig);
        const dbInstance = getFirestore(app);
        const authInstance = getAuth(app);

        dbRef.current = dbInstance;
        authRef.current = authInstance;
        appIdRef.current = currentAppId;

        // Auth State Listener
        const unsubscribeAuth = onAuthStateChanged(authRef.current, async (user) => {
          if (user) {
            setCurrentUser(user);

            // Check if user is admin by UID
            const isAdminUser = ADMIN_UIDS.current.includes(user.uid);
            setIsAdmin(isAdminUser);

            if (isAdminUser && currentPage === 'login') {
              setCurrentPage('admin');
            }
          } else {
            // Sign in anonymously for regular users if not already authenticated
            // This prevents an infinite loop of anonymous sign-ins if the user logs out
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

        // Real-time Product Listener
        const productsCollectionPath = `artifacts/${appIdRef.current}/public/data/products`;
        const unsubscribeProducts = onSnapshot(
          collection(dbRef.current, productsCollectionPath),
          (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setAllProducts(fetchedProducts);
            setProductsLoading(false);
          },
          (error) => {
            console.error("Error loading products:", error);
            setProductsError(`${t('failedToLoadProducts')}: ${error.message}`);
            setProductsLoading(false);
          }
        );

        return () => {
          unsubscribeAuth();
          unsubscribeProducts();
        };

      } catch (e) {
        console.error("Firebase initialization error:", e);
        setProductsError(`${t('failedToLoadProducts')}: ${e.message}`);
        setProductsLoading(false);
      }
    };

    initFirebase();
  }, [t, currentPage]); // Added currentPage as a dependency to re-evaluate auth redirect

  /**
   * Handles admin login with email/password
   */
  const handleAdminLogin = useCallback(async (email, password) => {
    if (!authRef.current) {
      console.error(t('firebaseNotInitialized'));
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        authRef.current,
        email,
        password
      );

      setCurrentUser(userCredential.user);

      // Check if logged in user is admin
      const isAdminUser = ADMIN_UIDS.current.includes(userCredential.user.uid);
      setIsAdmin(isAdminUser);

      if (isAdminUser) {
        setCurrentPage('admin');
        console.log(t('adminLoginSuccess'));
      } else {
        console.warn(t('permissionDeniedAdmin'));
        // Sign out and revert to anonymous if not admin
        await signOut(authRef.current);
        const anonUserCredential = await signInAnonymously(authRef.current);
        setCurrentUser(anonUserCredential.user);
      }
    } catch (error) {
      console.error("Admin login error:", error);
      console.error(`${t('adminLoginError')}: ${error.message}`);
    }
  }, [t]);

  /**
   * Handles user logout
   */
  const handleLogout = useCallback(async () => {
    if (authRef.current) {
      try {
        await signOut(authRef.current);
        setCurrentPage('home');
        // After logout, Firebase's onAuthStateChanged will trigger an anonymous sign-in
        console.log(t('logoutSuccess'));
      } catch (error) {
        console.error("Logout error:", error);
        console.error(`${t('logoutError')}: ${error.message}`);
      }
    }
  }, [t]);

  /**
   * Handles navigation between pages
   */
  const handleNavigate = useCallback((page, param = null) => {
    if (page === 'admin' && !isAdmin && currentPage !== 'login') {
      console.warn(t('permissionDeniedAdmin'));
      setCurrentPage('home');
      window.scrollTo(0, 0);
      return;
    }

    setCurrentPage(page);
    window.scrollTo(0, 0);

    if (page === 'productDetail' && param) {
      const product = allProducts.find(p => p.id === param);
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }

    if (page === 'checkout' && param?.selectedItems) {
      setItemsToCheckout(param.selectedItems);
    } else {
      setItemsToCheckout([]);
    }
  }, [allProducts, isAdmin, t, currentPage]); // Added currentPage for more precise re-evaluation

  /**
   * Handles placing an order
   */
  const handlePlaceOrder = useCallback(async (orderDetails) => {
    const currentDb = dbRef.current;
    const currentAuth = authRef.current;
    const currentAppId = appIdRef.current;

    if (!currentDb || !currentAuth?.currentUser?.uid || !currentAppId) {
      console.error(`${t('failedToPlaceOrder')}: ${t('ensureFirebaseConnection')}`);
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
      handleNavigate('home');
      clearCart();
      console.log(`${t('orderPlacedSuccess')}. ${t('thankYouOrderPlaced')}`);
    } catch (e) {
      console.error("Order placement error:", e);
      console.error(`${t('failedToPlaceOrder')}: ${e.message}`);
    }
  }, [clearCart, handleNavigate, t]);

  return (
    <div className="min-h-screen font-sans text-base leading-relaxed antialiased flex flex-col items-center
      bg-gradient-to-br from-[#F2F0EF] to-[#BBBDBC] text-[#245F73]"> {/* Refined calm to Matte elegance gradient, Magnetic Pull text */}
      {/* Header component */}
      <Header
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onLogout={handleLogout}
        currencySymbol="DZD" // Pass the currency symbol here
      />

      {/* Main content area */}
      <main className="flex-grow w-full max-w-7xl px-2 py-8 md:py-12 flex justify-center items-start relative z-10">
        {productsLoading ? (
          <div className="text-center py-20">
            <svg className="animate-spin mx-auto h-12 w-12 text-[#BBBDBC] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-[#245F73]">{t('productsLoading')}</p> {/* Magnetic Pull text */}
          </div>
        ) : productsError ? (
          <div className="text-center py-20 text-[#733224]"> {/* Seductive Richness for error messages */}
            <p className="text-xl">{t('errorLoadingProducts')}: {productsError}</p>
          </div>
        ) : (
          (() => {
            switch (currentPage) {
              case 'home':
                return <HomePage onNavigate={handleNavigate} />;
              case 'products':
                return <ProductListingPage
                  products={allProducts}
                  onAddToCart={addToCart}
                  onNavigate={handleNavigate}
                  currencySymbol="DZD" // Pass the currency symbol
                />;
              case 'productDetail':
                return <ProductDetailPage
                  product={selectedProduct}
                  onAddToCart={addToCart}
                  onNavigate={handleNavigate}
                  currencySymbol="DZD" // Pass the currency symbol
                />;
              case 'cart':
                return <CartPage
                  onNavigate={handleNavigate}
                  currencySymbol="DZD" // Pass the currency symbol
                />;
              case 'checkout':
                return <CheckoutPage
                  selectedItems={itemsToCheckout}
                  onPlaceOrder={handlePlaceOrder}
                  onClearCart={clearCart}
                  onNavigate={handleNavigate}
                  db={dbRef.current}
                  auth={authRef.current}
                  appId={appIdRef.current}
                  currencySymbol="DZD" // Pass the currency symbol
                />;
              case 'admin':
                return <AdminPage
                  onNavigate={handleNavigate}
                  db={dbRef.current}
                  auth={authRef.current}
                  appId={appIdRef.current}
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  currencySymbol="DZD" // Pass the currency symbol
                />;
              case 'login':
                return <LoginPage
                  onNavigate={handleNavigate}
                  onAdminLogin={handleAdminLogin}
                  auth={authRef.current}
                />;
              default:
                return <HomePage onNavigate={handleNavigate} />;
            }
          })()
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#245F73] text-[#F2F0EF] py-6 mt-8 rounded-t-3xl shadow-inner-lg"> {/* Magnetic Pull background, Refined Calm text, deeper inner shadow */}
        <div className="container mx-auto text-center text-sm md:text-base">
          <p className="mb-1">&copy; {new Date().getFullYear()} ZShop. {t('allRightsReserved')}</p>
          <p className="text-[#BBBDBC]">{t('experienceLuxury')}</p> {/* Matte elegance secondary text */}
        </div>
      </footer>
    </div>
  );
}

export default App;