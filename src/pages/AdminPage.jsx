import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const AdminPage = ({ onNavigate, db, storage, auth, appId, isAdmin, currentUser, onLogout }) => {
  // State Management
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW: Separate state for image upload loading
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const { t } = useLanguage();

  // Order Management States
  const [orders, setOrders] = useState([]);
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [sortBy, setSortBy] = useState('placedAt');
  const [sortOrder, setSortOrder] = useState('desc');
// 🆕 ADD THIS COMPONENT INSIDE AdminPage.jsx
const InstagramOrderForm = () => {
  const [order, setOrder] = useState({
    firstname: '',
    familyname: '',
    contact_phone: '+213 ',
    address: '',
    to_commune_name: '',
    to_wilaya_name: '',
    product_list: '',
    price: '',
    order_id: `INSTA_${Date.now()}`,
    from_wilaya_name: "Alger", // Your location
    do_insurance: true,
    declared_value: '',
    height: 10,
    width: 20,
    length: 30,
    weight: 1,
    freeshipping: false,
    is_stopdesk: false,
    has_exchange: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createYalidineShipment = async () => {
    if (!order.firstname || !order.contact_phone || !order.product_list || !order.price) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        ...order,
        price: parseInt(order.price),
        declared_value: parseInt(order.price)
      };

      const response = await fetch('http://localhost:3001/api/yalidine-orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([orderData])
      });
      
      const result = await response.json();
      
      if (result[order.order_id]?.success) {
        alert(`✅ Shipment Created!\nTracking: ${result[order.order_id].tracking}\nLabel: ${result[order.order_id].label}`);
        // Reset form
        setOrder({
          firstname: '',
          familyname: '',
          contact_phone: '+213 ',
          address: '',
          to_commune_name: '',
          to_wilaya_name: '',
          product_list: '',
          price: '',
          order_id: `INSTA_${Date.now()}`,
          from_wilaya_name: "Alger",
          do_insurance: true,
          declared_value: '',
          height: 10,
          width: 20,
          length: 30,
          weight: 1,
          freeshipping: false,
          is_stopdesk: false,
          has_exchange: false
        });
      } else {
        alert(`❌ Failed: ${result[order.order_id]?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Shipment creation error:', error);
      alert('❌ Failed to create shipment. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">📦 Instagram Orders to Yalidine</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Customer First Name *"
          value={order.firstname}
          onChange={e => setOrder({...order, firstname: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input
          placeholder="Family Name"
          value={order.familyname}
          onChange={e => setOrder({...order, familyname: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input
          placeholder="Phone * (+213 XXXXXXXX)"
          value={order.contact_phone}
          onChange={e => setOrder({...order, contact_phone: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input
          placeholder="Wilaya *"
          value={order.to_wilaya_name}
          onChange={e => setOrder({...order, to_wilaya_name: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input
          placeholder="Commune *"
          value={order.to_commune_name}
          onChange={e => setOrder({...order, to_commune_name: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input
          placeholder="Address"
          value={order.address}
          onChange={e => setOrder({...order, address: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>
      
      <div className="mb-4">
        <textarea
          placeholder="Products List * (e.g., 2x T-Shirt Black, 1x Jeans Blue)"
          value={order.product_list}
          onChange={e => setOrder({...order, product_list: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg h-20"
        />
      </div>
      
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Price (DZD) *</label>
          <input
            type="number"
            placeholder="5000"
            value={order.price}
            onChange={e => setOrder({...order, price: e.target.value, declared_value: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <button
          onClick={createYalidineShipment}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {isSubmitting ? '🔄 Creating...' : '🚀 Create Yalidine Shipment'}
        </button>
      </div>
    </div>
  );
};
  // Product Management States
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    imageUrls: [],
    category: '',
  });
  const [productFormErrors, setProductFormErrors] = useState({});
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  // Constants
  const displayUserIdentifier = useMemo(() => {
    return currentUser?.email || currentUser?.uid || t('notAvailable');
  }, [currentUser, t]);

  const orderStatuses = useMemo(() => [
    'all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  ], []);

  const orderStatusLabels = useMemo(() => ({
    all: t('all'),
    pending: t('pending'),
    confirmed: t('confirmed'),
    shipped: t('shipped'),
    delivered: t('delivered'),
    cancelled: t('cancelled'),
  }), [t]);

  const productCategories = useMemo(() => [
    '', t('electronics'), t('apparel'), t('homeLiving'), t('accessories'), 
    t('books'), t('photography'), t('healthBeauty'), t('other')
  ], [t]);

  // Firebase Listeners
  useEffect(() => {
    if (!db || !appId || !auth || !isAdmin) {
      setLoading(false);
      setError(t('permissionDeniedAdmin'));
      return;
    }

    setLoading(true);

    // Order Listener
    const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);
    const unsubscribeOrders = onSnapshot(query(ordersCollectionRef), (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to orders:", err);
      setError(t('errorFetchingOrders'));
      setLoading(false);
    });

    // Product Listener
    const productsCollectionRef = collection(db, `artifacts/${appId}/public/data/products`);
    const unsubscribeProducts = onSnapshot(query(productsCollectionRef), (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.imageUrl && !Array.isArray(data.imageUrls)) {
          data.imageUrls = [data.imageUrl];
        } else if (!data.imageUrls) {
          data.imageUrls = [];
        }
        return { id: doc.id, ...data };
      });
      setProducts(fetchedProducts);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to products:", err);
      setError(t('errorFetchingProducts'));
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [db, appId, auth, isAdmin, t]);

  // Order Filtering and Sorting
  const displayedOrders = useMemo(() => {
    let currentOrders = [...orders];
    
    if (activeOrderTab !== 'all') {
      currentOrders = currentOrders.filter(order => 
        order.statusKey === activeOrderTab || 
        order.orderStatus === orderStatusLabels[activeOrderTab]
      );
    }
    
    currentOrders.sort((a, b) => {
      let valA, valB;
      
      if (sortBy === 'total') {
        valA = a.summary?.total || 0;
        valB = b.summary?.total || 0;
      } else if (sortBy === 'placedAt') {
        valA = a.placedAt?.toDate?.()?.getTime() || 0;
        valB = b.placedAt?.toDate?.()?.getTime() || 0;
      } else if (sortBy === 'fullName') {
        valA = a.customerInfo?.fullName?.toLowerCase() || '';
        valB = b.customerInfo?.fullName?.toLowerCase() || '';
      } else if (sortBy === 'orderStatus') {
        valA = a.orderStatus?.toLowerCase() || '';
        valB = b.orderStatus?.toLowerCase() || '';
      }
      
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    
    return currentOrders;
  }, [orders, activeOrderTab, sortBy, sortOrder, orderStatusLabels]);

  // Order Status Update
  const handleUpdateOrderStatus = useCallback(async (orderId, newStatusKey) => {
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
        orderStatus: orderStatusLabels[newStatusKey],
        statusKey: newStatusKey,
        lastUpdated: serverTimestamp()
      });
    } catch (e) {
      console.error("Error updating order status:", e);
      setError(`${t('failedToUpdateStatus')}: ${orderId}.`);
    }
  }, [db, appId, isAdmin, t, orderStatusLabels]);

  // FIXED: Image Upload Handler
  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Add file type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError(t('invalidImageType'));
      return;
    }

    setImageUploadLoading(true);
    
    try {
      if (!storage) {
        throw new Error('Firebase Storage is not initialized');
      }
      
      const uploadedUrls = [];
      for (const file of files) {
        // Sanitize filename
        const sanitizedFilename = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        
        // FIXED: Correct storage reference with app ID
        const storageRef = ref(
          storage, 
          `artifacts/${appId}/public/products/${Date.now()}_${sanitizedFilename}`
        );
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(downloadUrl);
      }
      
      setProductForm(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls]
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      setError(`${t('imageUploadFailed')}: ${error.message}`);
    } finally {
      setImageUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [storage, appId, t]);

  // Remove Image
  const removeImage = useCallback((index) => {
    setProductForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  }, []);

  // Product Form Validation
  const validateProductForm = useCallback(() => {
    const errors = {};
    if (!productForm.name.trim()) errors.name = t('productNameRequired');
    if (!productForm.description.trim()) errors.description = t('descriptionRequired');
    if (!productForm.price || isNaN(productForm.price) || parseFloat(productForm.price) <= 0) {
      errors.price = t('validPriceRequired');
    }
    if (productForm.imageUrls.length === 0) {
      errors.imageUrls = t('atLeastOneImageRequired');
    }
    if (!productForm.category.trim()) errors.category = t('categoryRequired');

    setProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [productForm, t]);

  // Product Form Handlers
  const handleProductFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
    setProductFormErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const clearProductForm = useCallback(() => {
    setProductForm({
      id: null,
      name: '',
      description: '',
      price: '',
      imageUrls: [],
      category: ''
    });
    setIsEditingProduct(false);
    setProductFormErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSaveProduct = useCallback(async (e) => {
    e.preventDefault();
    if (!validateProductForm()) return;
    if (!db || !appId || !storage) {
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
        imageUrls: productForm.imageUrls,
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
  }, [productForm, isEditingProduct, validateProductForm, db, appId, storage, isAdmin, t]);

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
      imageUrls: productToEdit.imageUrls || [],
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
    if (confirmDelete !== 'DELETE') return;
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

  // Admin Logout
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
  // --- Render Components ---
  // =====================================================================

  const renderAdminHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-300">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-0">
        {t('admin')} <span className="text-gray-500">{t('dashboard')}</span>
      </h2>
      <div className="flex items-center gap-4">
        <p className="text-lg text-gray-700">
          {t('loggedInAs')}: <span className="font-semibold text-gray-900 break-all">{displayUserIdentifier}</span>
        </p>
        <button
          onClick={handleAdminLogout}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
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
    <div className="flex justify-center mb-8 bg-gray-100 rounded-full p-2 shadow-inner">
      <button
        onClick={() => setActiveTab('orders')}
        className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300
                    ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-700 hover:text-gray-900'}
                    focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2`}
      >
        {t('orderManagement')}
      </button>
      <button
        onClick={() => setActiveTab('products')}
        className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300
                    ${activeTab === 'products' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-700 hover:text-gray-900'}
                    focus:outline-none focus:ring-2 focus:ring-gray-300 ml-2`}
      >
        {t('productManagement')}
      </button>
    </div>
  );

  const renderOrderManagementSection = () => (
    <div className={activeTab === 'orders' ? 'block' : 'hidden'}>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
          {t('orderManagement')}
        </h3>
        {renderOrderTabs()}
        {renderControls()}
        {renderOrderList()}
      </div>
    </div>
  );

  const renderProductManagementSection = () => (
    <div className={`${activeTab === 'products' ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
              {isEditingProduct ? t('editProduct') : t('addNewProduct')}
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('productName')} *
              </label>
              <input
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  productFormErrors.name ? 'border-red-500' : ''
                }`}
                placeholder={t('productNamePlaceholder')}
              />
              {productFormErrors.name && <p className="text-red-500 text-sm mt-1">{productFormErrors.name}</p>}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('category')} *
              </label>
              <select
                name="category"
                value={productForm.category}
                onChange={handleProductFormChange}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  productFormErrors.category ? 'border-red-500' : ''
                }`}
              >
                <option value="">{t('selectCategory')}</option>
                {productCategories.map(cat => (
                  <option key={cat || 'empty'} value={cat}>{cat}</option>
                ))}
              </select>
              {productFormErrors.category && <p className="text-red-500 text-sm mt-1">{productFormErrors.category}</p>}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('price')} (DZD) *
              </label>
              <input
                type="number"
                name="price"
                value={productForm.price}
                onChange={handleProductFormChange}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  productFormErrors.price ? 'border-red-500' : ''
                }`}
                placeholder="2999.99"
                step="0.01"
              />
              {productFormErrors.price && <p className="text-red-500 text-sm mt-1">{productFormErrors.price}</p>}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
              {t('mediaDescription')}
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('productImages')} *
              </label>
              
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  className="hidden"
                  id="image-upload"
                  accept="image/jpeg, image/png, image/webp"
                  disabled={imageUploadLoading}
                />
                <label 
                  htmlFor="image-upload"
                  className={`flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${
                    imageUploadLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {imageUploadLoading ? (
                    <div className="text-center">
                      <svg className="animate-spin mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">{t('uploadingImages')}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">
                        {t('uploadImages')}
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </div>
                  )}
                </label>
                {productFormErrors.imageUrls && <p className="text-red-500 text-sm mt-1">{productFormErrors.imageUrls}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('preview')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {productForm.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = `https://placehold.co/64x64/d1d5db/6b7280?text=${t('imageError')}`; 
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')} *
              </label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleProductFormChange}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 ${
                  productFormErrors.description ? 'border-red-500' : ''
                }`}
                placeholder={t('detailedDescriptionPlaceholder')}
              ></textarea>
              {productFormErrors.description && <p className="text-red-500 text-sm mt-1">{productFormErrors.description}</p>}
            </div>
          </div>
        </div>
        {activeTab === 'instagram' && (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
    <InstagramOrderForm />
  </div>
)}
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={clearProductForm}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isEditingProduct ? t('cancelEdit') : t('clearForm')}
          </button>
          <button
            type="submit"
            onClick={handleSaveProduct}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
            disabled={productSubmitLoading || !isAdmin}
          >
            {productSubmitLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('saving')}
              </>
            ) : isEditingProduct ? (
              t('saveChanges')
            ) : (
              t('addProduct')
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">
            {t('currentProducts')} ({products.length})
          </h3>
          <p className="text-gray-600 mt-2">
            {t('manageYourProductCatalog')}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('product')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('images')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.imageUrls?.length > 0 ? (
                        <img 
                          src={product.imageUrls[0]} 
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md mr-3"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {product.price} DZD
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {product.imageUrls?.slice(0, 3).map((url, index) => (
                        <img 
                          key={index}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-8 h-8 object-cover rounded-full border-2 border-white shadow"
                        />
                      ))}
                      {product.imageUrls?.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                          +{product.imageUrls.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className={`text-blue-600 hover:text-blue-900 ${
                          !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!isAdmin}
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={`text-red-600 hover:text-red-900 ${
                          !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!isAdmin}
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrderTabs = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {orderStatuses.map((status) => (
        <button
          key={status}
          onClick={() => setActiveOrderTab(status)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeOrderTab === status 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {orderStatusLabels[status]} (
          {status === 'all' 
            ? orders.length 
            : orders.filter(o => 
                o.statusKey === status || 
                o.orderStatus === orderStatusLabels[status]
              ).length
          })
        </button>
      ))}
    </div>
  );

  const renderControls = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('sortBy')}:
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 cursor-pointer"
            >
              <option value="placedAt">{t('orderDateSort')}</option>
              <option value="total">{t('totalAmountSort')}</option>
              <option value="fullName">{t('customerNameSort')}</option>
              <option value="orderStatus">{t('statusSort')}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
        // Add this tab button with the others:
<button
  onClick={() => setActiveTab('instagram')}
  className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300
              ${activeTab === 'instagram' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-700 hover:text-gray-900'}
              focus:outline-none focus:ring-2 focus:ring-green-300 ml-2`}
>
  📦 Instagram Orders
</button>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('sortOrder')}:
          </label>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg font-medium shadow hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            {sortOrder === 'asc' ? t('ascending') : t('descending')}
            {sortOrder === 'asc' ? (
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
              </svg>
            ) : (
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrderList = () => {
    if (loading) {
      return (
        <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
          <svg className="animate-spin mx-auto h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-gray-600">{t('loadingOrders')}</p>
        </div>
      );
    }

    if (error && error !== t('permissionDeniedAdmin')) {
      return (
        <div className="text-center py-20 bg-red-500 text-white rounded-xl shadow-lg border border-red-700">
          <p className="text-2xl font-bold mb-4">{t('error')}:</p>
          <p className="text-lg">{error}</p>
          <p className="text-sm mt-4">{t('checkConsoleReload')}</p>
        </div>
      );
    }

    if (displayedOrders.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
          <p className="text-2xl font-semibold text-gray-500 mb-4">{t('noOrdersFound')}</p>
          <p className="text-lg text-gray-600">{t('tryAdjustingFilters')}</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orderId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('address')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('items')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('total')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orderDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('userId')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-800">
                    {order.orderId || order.id.substring(0, 8) + '...'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{order.customerInfo?.fullName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{order.customerInfo?.phone}</p>
                    <p className="text-sm text-gray-600">{order.customerInfo?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>{order.customerInfo?.address}</p>
                    <p>{order.customerInfo?.town}, {order.customerInfo?.wilaya}</p>
                  </td>
                <td className="px-6 py-4 text-sm text-gray-600">
  <div className="space-y-2">
    {order.items.map((item, index) => (
      <div key={index} className="border rounded-lg p-3 bg-gray-50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{item.name}</div>
            <div className="text-gray-600">الكمية: {item.quantity}</div>
            <div className="text-green-600 font-medium">السعر: {item.price} د.ج</div>
            
            {/* Size and Color */}
            <div className="mt-2 flex flex-wrap gap-2">
              {item.size && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  الحجم: {item.size}
                </span>
              )}
              {item.color && (
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  اللون: {item.color}
                </span>
              )}
            </div>

            {/* Specifications */}
            {item.specifications && (
              <div className="mt-2 text-xs text-gray-500">
                <div className="font-medium mb-1">المواصفات:</div>
                {item.specifications.material && (
                  <div>المادة: {item.specifications.material}</div>
                )}
                {item.specifications.dimensions && (
                  <div>الأبعاد: {item.specifications.dimensions}</div>
                )}
                {item.specifications.weight && (
                  <div>الوزن: {item.specifications.weight}</div>
                )}
                {item.specifications.warranty && (
                  <div>الضمان: {item.specifications.warranty}</div>
                )}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="mt-2 text-xs text-gray-500">
                <div className="font-medium">الوصف:</div>
                <div className="line-clamp-2">{item.description}</div>
              </div>
            )}

            {/* Category */}
            {item.category && (
              <div className="mt-1 text-xs text-gray-500">
                الفئة: {item.category}
              </div>
            )}
          </div>
          
          {/* Product Image */}
          {item.imageUrl && (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-12 h-12 object-cover rounded-lg ml-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/48x48/d1d5db/6b7280?text=صورة';
              }}
            />
          )}
        </div>
        
        {/* Stock Information */}
        {item.stock !== undefined && (
          <div className="mt-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${
              item.stock > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              المخزون: {item.stock}
            </span>
          </div>
        )}
      </div>
    ))}
  </div>
</td>
                  <td className="px-6 py-4 font-bold text-gray-700">${order.summary?.total?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold inline-block
                      ${order.statusKey === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${order.statusKey === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.statusKey === 'shipped' ? 'bg-indigo-100 text-indigo-800' : ''}
                      ${order.statusKey === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                      ${order.statusKey === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {order.orderStatus}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.placedAt ? new Date(order.placedAt.toDate()).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={order.statusKey || ''}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   appearance-none bg-white pr-8 text-sm cursor-pointer
                                   ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isAdmin}
                      >
                        {Object.entries(orderStatusLabels).map(([key, label]) => {
                          if (key === 'all') return null;
                          return (
                            <option key={key} value={key}>{label}</option>
                          );
                        })}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 break-all">{order.userId || 'anonymous'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className="min-h-screen font-sans text-base leading-relaxed antialiased flex flex-col items-center bg-gray-100 p-4 md:p-8">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-2xl p-6 md:p-10 border border-gray-200">
        {isAdmin ? (
          <>
            {renderAdminHeader()}
            {renderTabs()}
            
            {activeTab === 'orders' && renderOrderManagementSection()}
            {activeTab === 'products' && renderProductManagementSection()}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
            <p className="text-2xl font-semibold text-red-500 mb-4">{t('accessDenied')}</p>
            <p className="text-lg text-gray-600">{t('permissionDeniedAdmin')}</p>
            <p className="text-sm mt-2">{t('currentUserUid')}: <span className="font-mono break-all">{displayUserIdentifier}</span></p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-700 transition-colors mt-8"
            >
              {t('goToHome')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;