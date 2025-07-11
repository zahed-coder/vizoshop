import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

// --- Firebase Imports ---
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

/**
 * AdminPage Component
 * This component serves as the administrative dashboard for ZShop. It allows
 * administrators to view and manage customer orders, and to manage products (add, edit, delete).
 * It receives Firebase instances (db, auth) and admin status as props from App.js.
 * It strictly checks the 'isAdmin' prop at the top-level render for immediate access control.
 *
 * @param {object} props - The component's properties.
 * @param {function(string, any?): void} props.onNavigate - Callback function to handle page navigation.
 * @param {object} props.db - The Firestore database instance.
 * @param {object} props.auth - The Firebase Auth instance.
 * @param {string} props.appId - The application ID used in Firestore collection paths.
 * @param {boolean} props.isAdmin - True if the current user has admin privileges.
 * @param {object} props.currentUser - The current Firebase User object (null if not authenticated).
 * @param {function} props.onLogout - Callback function to handle admin logout.
 */
const AdminPage = ({ onNavigate, db, auth, appId, isAdmin, currentUser, onLogout }) => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage(); // Access translation function

  // --- Order Management States ---
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('placedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // --- Product Management States ---
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
  });
  const [productFormErrors, setProductFormErrors] = useState({});
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);

  // --- User ID/Email for Display ---
  const displayUserIdentifier = useMemo(() => {
    if (currentUser) {
      return currentUser.email || currentUser.uid;
    }
    return t('notAvailable');
  }, [currentUser, t]);

  // --- Constants for dropdowns (memoized for performance and translated) ---
  const orderStatuses = useMemo(() => [
    'All', t('pendingCall'), t('confirmed'), t('shipped'), t('delivered'), t('cancelled')
  ], [t]);

  const productCategories = useMemo(() => [
    '', t('electronics'), t('apparel'), t('homeLiving'), t('accessories'), t('books'), t('photography'), t('healthBeauty'), t('other')
  ], [t]);


  // --- useEffect for Firebase Data Listeners ---
  useEffect(() => {
    // If user is not an admin, or Firebase instances are not yet available, stop here.
    if (!db || !appId || !auth || !isAdmin) {
      setLoading(false);
      setError(t('permissionDeniedAdmin'));
      return;
    }

    console.log("AdminPage: Firebase props received and isAdmin is TRUE. Setting up listeners.");
    setLoading(true);

    // --- Order Listener ---
    const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);
    const unsubscribeOrders = onSnapshot(query(ordersCollectionRef), (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error("AdminPage: Error listening to orders:", err);
      setError(t('errorFetchingOrders'));
      setLoading(false);
    });

    // --- Product Listener ---
    const productsCollectionRef = collection(db, `artifacts/${appId}/public/data/products`);
    const unsubscribeProducts = onSnapshot(query(productsCollectionRef), (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(fetchedProducts);
      setLoading(false);
    }, (err) => {
      console.error("AdminPage: Error listening to products:", err);
      setError(t('errorFetchingProducts'));
      setLoading(false);
    });

    return () => {
      console.log("AdminPage: Unsubscribing from Firestore listeners.");
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [db, appId, auth, isAdmin, t]);


  // --- Memoized Filtered and Sorted Orders ---
  const displayedOrders = useMemo(() => {
    let currentOrders = [...orders];
    if (filterStatus !== 'All') {
      currentOrders = currentOrders.filter(order => order.orderStatus === filterStatus);
    }
    currentOrders.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'total') {
        valA = a.summary?.total || 0;
        valB = b.summary?.total || 0;
      } else if (sortBy === 'placedAt') {
        valA = a.placedAt && typeof a.placedAt.toDate === 'function' ? a.placedAt.toDate().getTime() : 0;
        valB = b.placedAt && typeof b.placedAt.toDate === 'function' ? b.placedAt.toDate().getTime() : 0;
      } else if (sortBy === 'fullName') {
        valA = a.customerInfo?.fullName?.toLowerCase() || '';
        valB = b.customerInfo?.fullName?.toLowerCase() || '';
      } else if (sortBy === 'orderStatus') {
        valA = a.orderStatus?.toLowerCase() || '';
        valB = b.orderStatus?.toLowerCase() || '';
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return currentOrders;
  }, [orders, filterStatus, sortBy, sortOrder]);

  // --- Order Action Handlers ---
  const handleUpdateOrderStatus = useCallback(async (orderId, newStatus) => {
    if (!db || !appId) {
      setError(t('firestoreNotInitialized'));
      return;
    }
    if (!isAdmin) {
      alert(t('permissionDeniedOrderUpdate'));
      return;
    }
    try {
      const orderDocRef = doc(db, `artifacts/${appId}/public/data/orders`, orderId);
      await updateDoc(orderDocRef, {
        orderStatus: newStatus,
        lastUpdated: serverTimestamp()
      });
    } catch (e) {
      console.error("Error updating order status:", e);
      setError(`${t('failedToUpdateStatus')}: ${orderId}.`);
    }
  }, [db, appId, isAdmin, t]);

  const handleSortToggle = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);


  // --- Product Management Logic ---
  const validateProductForm = useCallback(() => {
    const errors = {};
    if (!productForm.name.trim()) errors.name = t('productNameRequired');
    if (!productForm.description.trim()) errors.description = t('descriptionRequired');
    if (!productForm.price || isNaN(productForm.price) || parseFloat(productForm.price) <= 0) {
      errors.price = t('validPriceRequired');
    }
    if (!productForm.imageUrl.trim()) errors.imageUrl = t('imageUrlRequired');
    if (!productForm.category.trim()) errors.category = t('categoryRequired');

    setProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [productForm, t]);

  const handleProductFormChange = useCallback((e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, imageUrl: reader.result }));
        setProductFormErrors(prev => ({ ...prev, imageUrl: '' }));
      };
      reader.onerror = () => {
        console.error("Error reading file.");
        setProductFormErrors(prev => ({ ...prev, imageUrl: t('failedToReadImage') }));
      };
      reader.readAsDataURL(file);
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }));
      setProductFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [t]);

  const clearProductForm = useCallback(() => {
    setProductForm({
      id: null, name: '', description: '', price: '', imageUrl: '', category: ''
    });
    setIsEditingProduct(false);
    setProductFormErrors({});
  }, []);

  const handleSaveProduct = useCallback(async (e) => {
    e.preventDefault();
    if (!validateProductForm()) {
      console.error("Product form validation failed.");
      return;
    }

    if (!db || !appId) {
      setError(t('firestoreNotInitialized'));
      return;
    }
    if (!isAdmin) {
      alert(t('permissionDeniedProductAddEdit'));
      return;
    }

    setProductSubmitLoading(true);
    try {
      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: parseFloat(productForm.price),
        imageUrl: productForm.imageUrl.trim(),
        category: productForm.category.trim(),
      };

      if (isEditingProduct && productForm.id) {
        const productDocRef = doc(db, `artifacts/${appId}/public/data/products`, productForm.id);
        await updateDoc(productDocRef, productData);
      } else {
        const productsCollectionRef = collection(db, `artifacts/${appId}/public/data/products`);
        await addDoc(productsCollectionRef, productData);
      }
      clearProductForm();
    } catch (e) {
      console.error("Error saving product:", e);
      setError(`${t('failedToSaveProduct')}: ${e.message}`);
    } finally {
      setProductSubmitLoading(false);
    }
  }, [productForm, isEditingProduct, validateProductForm, clearProductForm, db, appId, isAdmin, t]);

  const handleEditProduct = useCallback((productToEdit) => {
    if (!isAdmin) {
      alert(t('permissionDeniedProductEdit'));
      return;
    }
    setProductForm({
      id: productToEdit.id,
      name: productToEdit.name,
      description: productToEdit.description,
      price: productToEdit.price,
      imageUrl: productToEdit.imageUrl,
      category: productToEdit.category,
    });
    setIsEditingProduct(true);
    setProductFormErrors({});
    setActiveTab('products');
    window.scrollTo(0, 0);
  }, [isAdmin, t]);

  const handleDeleteProduct = useCallback(async (productId) => {
    if (!isAdmin) {
      alert(t('permissionDeniedProductDelete'));
      return;
    }
    const confirmDelete = window.prompt(`${t('typeDELETEConfirmDelete')}`);
    if (confirmDelete !== 'DELETE') {
      return;
    }

    if (!db || !appId) {
      setError(t('firestoreNotInitialized'));
      return;
    }

    try {
      const productDocRef = doc(db, `artifacts/${appId}/public/data/products`, productId);
      await deleteDoc(productDocRef);
    } catch (e) {
      console.error("Error deleting product:", e);
      setError(`${t('failedToDeleteProduct')}: ${e.message}`);
    }
  }, [db, appId, isAdmin, t]);

  // --- Admin Logout Handler ---
  const handleAdminLogout = useCallback(async () => {
    try {
      await signOut(auth);
      onLogout();
      onNavigate('home');
    } catch (error) {
      console.error("Admin logout error:", error);
      setError(t('logoutError'));
    }
  }, [auth, onLogout, onNavigate, t]);

  // =====================================================================
  // --- Render Sub-Sections of the Admin Page ---
  // =====================================================================

  const renderAdminHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-[#d4d4d4]">
      <h2 className="text-4xl md:text-5xl font-bold text-[#2b2b2b] drop-shadow-sm mb-4 md:mb-0">
        {t('admin')} <span className="text-[#b3b3b3]">{t('dashboard')}</span>
      </h2>
      <div className="flex items-center gap-4">
        <p className="text-lg text-[#4b5563]">
          {t('loggedInAs')}: <span className="font-semibold text-[#2b2b2b] break-all">{displayUserIdentifier}</span>
        </p>
        <button
          onClick={handleAdminLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t('logout')}
        </button>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="flex justify-center mb-8 bg-offWhite rounded-full p-2 shadow-inner-md animate-fade-in">
      <button
        onClick={() => setActiveTab('orders')}
        className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300
                    ${activeTab === 'orders' ? 'bg-[#2b2b2b] text-white shadow-lg' : 'text-[#4b5563] hover:text-[#2b2b2b]'}
                    focus:outline-none focus:ring-2 focus:ring-[#d4d4d4] mr-2`}
        aria-controls="orders-panel"
        aria-selected={activeTab === 'orders'}
        role="tab"
      >
        {t('orderManagement')}
      </button>
      <button
        onClick={() => setActiveTab('products')}
        className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300
                    ${activeTab === 'products' ? 'bg-[#2b2b2b] text-white shadow-lg' : 'text-[#4b5563] hover:text-[#2b2b2b]'}
                    focus:outline-none focus:ring-2 focus:ring-[#d4d4d4] ml-2`}
        aria-controls="products-panel"
        aria-selected={activeTab === 'products'}
        role="tab"
      >
        {t('productManagement')}
      </button>
    </div>
  );

  const renderOrderManagementSection = () => (
    <div id="orders-panel" role="tabpanel" className={activeTab === 'orders' ? 'block animate-fade-in' : 'hidden'}>
      {renderControls()}
      {renderOrderList()}
    </div>
  );

  const renderProductManagementSection = () => (
    <div id="products-panel" role="tabpanel" className={activeTab === 'products' ? 'block animate-fade-in' : 'hidden'}>
      <h3 className="text-3xl font-bold text-[#2b2b2b] mb-6 border-b pb-4 border-[#f0f0f0]">
        {isEditingProduct ? t('editProduct') : t('addNewProduct')}
      </h3>
      <form onSubmit={handleSaveProduct} className="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-[#d4d4d4] mb-8 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label htmlFor="product-name" className="form-label">{t('productName')}</label>
            <input
              type="text"
              id="product-name"
              name="name"
              value={productForm.name}
              onChange={handleProductFormChange}
              className={`form-input ${productFormErrors.name ? 'border-red-500' : ''}`}
              placeholder={t('productNamePlaceholder')}
              required
            />
            {productFormErrors.name && <p className="text-red-500 text-sm mt-1">{productFormErrors.name}</p>}
          </div>
          {/* Product Category */}
          <div>
            <label htmlFor="product-category" className="form-label">{t('category')}</label>
            <div className="relative">
              <select
                id="product-category"
                name="category"
                value={productForm.category}
                onChange={handleProductFormChange}
                className={`form-input appearance-none pr-10 cursor-pointer ${productFormErrors.category ? 'border-red-500' : ''}`}
                required
              >
                <option value="" disabled>{t('selectCategory')}</option>
                {productCategories.map(cat => (
                  <option key={cat || 'empty'} value={cat}>{cat || t('notSelected')}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#b3b3b3]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            {productFormErrors.category && <p className="text-red-500 text-sm mt-1">{productFormErrors.category}</p>}
          </div>
          {/* Product Price */}
          <div>
            <label htmlFor="product-price" className="form-label">{t('price')} ($)</label>
            <input
              type="number"
              id="product-price"
              name="price"
              value={productForm.price}
              onChange={handleProductFormChange}
              className={`form-input ${productFormErrors.price ? 'border-red-500' : ''}`}
              placeholder="e.g., 299.99"
              step="0.01"
              required
            />
            {productFormErrors.price && <p className="text-red-500 text-sm mt-1">{productFormErrors.price}</p>}
          </div>
          {/* Product Image URL/Upload */}
          <div>
            <label htmlFor="product-image" className="form-label">{t('productImageURL')}</label>
            <input
              type="text"
              id="product-image-url"
              name="imageUrl"
              value={productForm.imageUrl}
              onChange={handleProductFormChange}
              className={`form-input ${productFormErrors.imageUrl ? 'border-red-500' : ''}`}
              placeholder="https://example.com/image.jpg or Base64 string"
            />
            <p className="text-xs text-gray-500 mt-1 mb-2">
              {t('orUploadImage')}
            </p>
            <input
              type="file"
              id="product-image-file"
              name="imageFile"
              accept="image/*"
              onChange={handleProductFormChange}
              className={`block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-offWhite file:text-[#2b2b2b]
                         hover:file:bg-lightGrey
                         ${productFormErrors.imageUrl ? 'border border-red-500 rounded-lg' : ''}`}
            />
            {productFormErrors.imageUrl && <p className="text-red-500 text-sm mt-1">{productFormErrors.imageUrl}</p>}
            {productForm.imageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[#2b2b2b] mb-2">{t('currentImagePreview')}</p>
                <img
                  src={productForm.imageUrl}
                  alt={t('productPreview')}
                  className="w-32 h-32 object-cover rounded-lg border border-[#d4d4d4] shadow-sm"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/128x128/f0f0f0/2b2b2b?text=${t('broken')}`; }}
                />
              </div>
            )}
          </div>
          {/* Product Description */}
          <div className="md:col-span-2">
            <label htmlFor="product-description" className="form-label">{t('description')}</label>
            <textarea
              id="product-description"
              name="description"
              value={productForm.description}
              onChange={handleProductFormChange}
              className={`form-input h-24 ${productFormErrors.description ? 'border-red-500' : ''}`}
              placeholder={t('detailedDescriptionPlaceholder')}
              required
            ></textarea>
            {productFormErrors.description && <p className="text-red-500 text-sm mt-1">{productFormErrors.description}</p>}
          </div>
        </div>
        {/* Form Actions (Save/Cancel) */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={clearProductForm}
            className="px-6 py-3 rounded-full text-lg font-semibold text-[#4b5563] bg-lightGrey shadow-md
                       hover:bg-mediumGrey transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4d4d4]"
          >
            {isEditingProduct ? t('cancelEdit') : t('clearForm')}
          </button>
          <button
            type="submit"
            className="bg-[#2b2b2b] text-white px-8 py-3 rounded-full text-lg font-bold shadow-xl
                       hover:bg-[#b3b3b3] hover:shadow-2xl transition-all duration-300
                       transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#d4d4d4]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md
                       flex items-center justify-center"
            disabled={productSubmitLoading || !isAdmin}
          >
            {productSubmitLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('saving')}
              </>
            ) : (
              isEditingProduct ? t('saveChanges') : t('addProduct')
            )}
          </button>
        </div>
      </form>

      <h3 className="text-3xl font-bold text-[#2b2b2b] mb-6 border-b pb-4 border-[#f0f0f0]">
        {t('currentProducts')}
      </h3>
      {/* Product List Table */}
      <div className="bg-white rounded-xl shadow-lg border border-[#d4d4d4] overflow-hidden animate-fade-in-up delay-200">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-[#d4d4d4]">
            <thead className="bg-[#f0f0f0]">
              <tr>
                <th className="table-header">{t('image')}</th>
                <th className="table-header">{t('productName')}</th>
                <th className="table-header">{t('category')}</th>
                <th className="table-header">{t('price')}</th>
                <th className="table-header">{t('description')}</th>
                <th className="table-header">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-data text-center py-6 text-[#b3b3b3]">
                    {t('noProductsFound')}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-offWhite transition-colors duration-150">
                    <td className="table-data">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md border border-[#f0f0f0] shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/d4d4d4/2b2b2b?text=${t('imageNA')}`; }}
                      />
                    </td>
                    <td className="table-data font-semibold text-[#2b2b2b]">{product.name}</td>
                    <td className="table-data text-[#4b5563]">{t(product.category.toLowerCase().replace(/\s/g, '') + 'Category') || product.category}</td>
                    <td className="table-data font-bold text-[#b3b3b3]">${product.price?.toFixed(2)}</td>
                    <td className="table-data text-sm text-[#4b5563] line-clamp-2 max-w-xs">{product.description}</td>
                    <td className="table-data">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className={`px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm
                                     hover:bg-blue-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300
                                     ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!isAdmin}
                          aria-label={`${t('edit')} ${product.name}`}
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 shadow-sm
                                     hover:bg-red-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300
                                     ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!isAdmin}
                          aria-label={`${t('delete')} ${product.name}`}
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderControls = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-[#d4d4d4] mb-8 animate-fade-in-down">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
        {/* Order Status Filter */}
        <div>
          <label htmlFor="status-filter" className="form-label">{t('filterByStatus')}:</label>
          <div className="relative">
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input appearance-none pr-10 cursor-pointer"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#b3b3b3]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Sort By Selector */}
          <div>
            <label htmlFor="sort-by" className="form-label">{t('sortBy')}:</label>
            <div className="relative">
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input appearance-none pr-10 cursor-pointer"
              >
                <option value="placedAt">{t('orderDateSort')}</option>
                <option value="total">{t('totalAmountSort')}</option>
                <option value="fullName">{t('customerNameSort')}</option>
                <option value="orderStatus">{t('statusSort')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#b3b3b3]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Sort Order Toggle Button */}
          <div className="flex items-center justify-end md:justify-start">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-[#2b2b2b] text-white px-6 py-2 rounded-full text-base font-semibold shadow-md
                         hover:bg-[#b3b3b3] transition-colors duration-200 flex items-center justify-center
                         focus:outline-none focus:ring-2 focus:ring-[#d4d4d4]"
              aria-label={`${t('toggleSortOrder')} ${sortOrder === 'asc' ? t('descending') : t('ascending')}`}
            >
              {sortOrder === 'asc' ? (
                <>
                  {t('ascending')}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18"></path></svg>
                </>
              ) : (
                <>
                  {t('descending')}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l-4 4m0 0l-4-4m4 4V3"></path></svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );

  const renderOrderList = () => {
    if (loading) {
      return (
        <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-[#d4d4d4] animate-fade-in">
          <svg className="animate-spin mx-auto h-12 w-12 text-[#b3b3b3] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-[#4b5563]">{t('loadingOrders')}</p>
        </div>
      );
    }

    if (error && error !== t('permissionDeniedAdmin')) {
      return (
        <div className="text-center py-20 bg-red-500 text-white rounded-xl shadow-lg border border-red-700 animate-fade-in">
          <p className="text-2xl font-bold mb-4">{t('error')}:</p>
          <p className="text-lg">{error}</p>
          <p className="text-sm mt-4">{t('checkConsoleReload')}</p>
        </div>
      );
    }

    if (displayedOrders.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-[#d4d4d4] animate-fade-in">
          <p className="text-2xl font-semibold text-[#b3b3b3] mb-4">{t('noOrdersFound')}</p>
          <p className="text-lg text-[#4b5563]">{t('tryAdjustingFilters')}</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-[#d4d4d4] overflow-hidden animate-fade-in">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-[#d4d4d4]">
            <thead className="bg-[#f0f0f0]">
              <tr>
                <th className="table-header">{t('orderId')}</th>
                <th className="table-header">{t('customer')}</th>
                <th className="table-header">{t('contact')}</th>
                <th className="table-header">{t('address')}</th>
                <th className="table-header">{t('items')}</th>
                <th className="table-header cursor-pointer" onClick={() => handleSortToggle('total')}>
                  {t('total')}
                  {sortBy === 'total' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th className="table-header cursor-pointer" onClick={() => handleSortToggle('orderStatus')}>
                  {t('status')}
                  {sortBy === 'orderStatus' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th className="table-header cursor-pointer" onClick={() => handleSortToggle('placedAt')}>
                  {t('orderDate')}
                  {sortBy === 'placedAt' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th className="table-header">{t('actions')}</th>
                <th className="table-header">{t('userId')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {displayedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-offWhite transition-colors duration-150">
                  <td className="table-data font-mono text-sm">{order.orderId || order.id.substring(0, 8) + '...'}</td>
                  <td className="table-data">
                    <p className="font-semibold text-[#2b2b2b]">{order.customerInfo?.fullName}</p>
                  </td>
                  <td className="table-data">
                    <p className="text-sm text-[#4b5563]">{order.customerInfo?.phone}</p>
                  </td>
                  <td className="table-data text-sm text-[#4b5563]">
                    <p>{order.customerInfo?.address}</p>
                    <p>{order.customerInfo?.town}, {order.customerInfo?.wilaya}</p>
                  </td>
                  <td className="table-data text-sm text-[#4b5563]">
                    <ul className="list-disc list-inside">
                      {order.items.map((item, index) => (
                        <li key={index} className="line-clamp-1">{item.name} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </td>
                  <td className="table-data font-bold text-[#b3b3b3]">${order.summary?.total?.toFixed(2)}</td>
                  <td className="table-data">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold inline-block
                      ${order.orderStatus === 'Pending Call' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${order.orderStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.orderStatus === 'Shipped' ? 'bg-indigo-100 text-indigo-800' : ''}
                      ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                      ${order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {t(order.orderStatus.toLowerCase().replace(/\s/g, ''))}
                    </div>
                  </td>
                  <td className="table-data text-sm text-[#4b5563]">
                    {order.placedAt ? new Date(order.placedAt.toDate()).toLocaleString() : 'N/A'}
                  </td>
                  <td className="table-data">
                    <div className="relative">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`block w-full px-3 py-2 border border-[#d4d4d4] rounded-md shadow-sm
                                   focus:ring-2 focus:ring-[#b3b3b3] focus:border-transparent
                                   appearance-none bg-white pr-8 text-sm cursor-pointer
                                   ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isAdmin}
                        aria-label={`${t('updateStatus')} for order ${order.orderId || order.id}`}
                      >
                        {orderStatuses.slice(1).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#b3b3b3]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="table-data text-xs text-[#4b5563] break-all">{order.userId || 'anonymous'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Main Render of AdminPage Component ---
  return (
    <>
      <div className="min-h-screen font-sans text-base leading-relaxed antialiased flex flex-col items-center
                      bg-gradient-to-br from-[#f0f0f0] to-[#d4d4d4] text-[#2b2b2b] p-4 md:p-8">
        <div className="w-full max-w-7xl bg-white rounded-xl shadow-2xl p-6 md:p-10 border border-[#d4d4d4] animate-fade-in">
          {/* Conditional rendering for header and tabs only if admin is true */}
          {isAdmin && (
            <>
              {renderAdminHeader()}
              {renderTabs()}
            </>
          )}

          {/* Conditional rendering based on isAdmin status for content */}
          {!isAdmin ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-[#d4d4d4] animate-fade-in">
              <p className="text-2xl font-semibold text-red-500 mb-4">{t('accessDenied')}</p>
              <p className="text-lg text-[#4b5563]">{t('permissionDeniedAdmin')}</p>
              {/* Display current user ID/email for debugging/info */}
              <p className="text-sm mt-2">{t('currentUserUid')}: <span className="font-mono break-all">{displayUserIdentifier}</span></p>
              <p className="text-sm text-[#b3b3b3] mt-4">{t('ensureFirebaseRules')}</p>
              <button
                onClick={() => onNavigate('home')}
                className="bg-[#2b2b2b] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl
                           hover:bg-[#b3b3b3] hover:shadow-2xl transition-all duration-300 transform hover:scale-105
                           focus:outline-none focus:ring-4 focus:ring-[#d4d4d4] mt-8"
              >
                {t('goToHome')}
              </button>
            </div>
          ) : (
            // Render the actual Admin Dashboard content if isAdmin is true
            <>
              {activeTab === 'orders' && renderOrderManagementSection()}
              {activeTab === 'products' && renderProductManagementSection()}
            </>
          )}
        </div>
      </div>
      {/* Moved the style block outside the main div, and using dangerouslySetInnerHTML */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Local CSS for form elements, complementing App.css */
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #2b2b2b;
          margin-bottom: 0.5rem;
        }
        .form-input {
          display: block;
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid #d4d4d4;
          border-radius: 0.5rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition-property: border-color, box-shadow;
          transition-duration: 200ms;
        }
        .form-input:focus {
          outline: none;
          border-color: #b3b3b3;
          box-shadow: 0 0 0 3px rgba(179, 179, 179, 0.5);
        }
        /* Table styles */
        .table-header {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .table-data {
          padding: 0.75rem 1rem;
          white-space: nowrap;
          color: #2b2b2b;
          font-size: 0.875rem;
        }
        /* Custom scrollbar for table overflow */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px; /* For horizontal scrollbar */
          width: 8px; /* For vertical scrollbar */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2b2b2b;
        }
      `}} />
    </>
  );
};

export default AdminPage;