import React, { useState, useEffect, useCallback, useMemo } from 'react';
import WilayaTownSelector from '../components/WilayaTownSelector';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { algeriaLocations, shippingPrices } from '../data/algeriaLocations';

// Premium Luxury Color Palette
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
  Platinum: '#E5E5E5',
  MetallicGray: '#1A1A1A',
  InputText: '#FFFFFF',
  PlaceholderText: 'rgba(255, 255, 255, 0.5)',
};

const formatCurrency = (amount) => {
  return `${parseFloat(amount).toFixed(2)} DZD`;
};

const CheckoutPage = ({ selectedItems = [], onPlaceOrder, onClearCart, onNavigate, db, auth, appId }) => {
  const location = useLocation();
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '+213 ',
    address: '',
    town: '',
    wilaya: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('home');

  const directPurchaseData = location.state?.directPurchase ? location.state : null;
  
  // Check backend connection
  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then(res => res.json())
      .then(data => console.log('✅ Backend connection:', data))
      .catch(err => console.error('❌ Backend not running:', err));
  }, []);

  // Optimized items processing
  const itemsToProcess = useMemo(() => {
    if (directPurchaseData) {
      const directPurchaseItem = {
        ...directPurchaseData.product,
        quantity: directPurchaseData.quantity,
        id: directPurchaseData.product.id || `direct-${Date.now()}`,
        isSelected: true,
        name: directPurchaseData.product.displayName || directPurchaseData.product.name,
        price: directPurchaseData.product.finalPrice || directPurchaseData.product.price,
        imageUrl: directPurchaseData.product.imageUrl || (directPurchaseData.product.images && directPurchaseData.product.images[0])
      };
      return [directPurchaseItem];
    }
    return Array.isArray(selectedItems) ? selectedItems : [];
  }, [selectedItems, directPurchaseData]);

  // Optimized calculations
  const subtotal = useMemo(() =>
    itemsToProcess.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [itemsToProcess]
  );

  // Shipping cost calculation
  const shippingCost = useMemo(() => {
    if (!customerInfo.wilaya) return 0;
    const prices = shippingPrices[customerInfo.wilaya];
    return prices ? prices[deliveryMethod] : 0;
  }, [customerInfo.wilaya, deliveryMethod]);

  const totalAmount = subtotal + shippingCost;

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    if (!customerInfo.fullName.trim()) errors.fullName = 'Full name is required';
    
    const phoneRegex = /^\+213\s?0?[5-7][0-9]{8}$/;
    
    if (!customerInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const normalizedPhone = customerInfo.phone.replace(/\s/g, '');
      if (!phoneRegex.test(normalizedPhone)) {
        errors.phone = 'Invalid phone number (must start with +213 followed by 9 or 10 digits)';
      }
    }
    
    if (!customerInfo.address.trim() && deliveryMethod === 'home') errors.address = 'Address is required for home delivery';
    if (!customerInfo.town.trim()) errors.town = 'Town is required';
    if (!customerInfo.wilaya.trim()) errors.wilaya = 'Wilaya is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [customerInfo, deliveryMethod]);

  // Input handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCustomerInfo(prevInfo => ({ ...prevInfo, [name]: value }));
    setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  }, []);

  const handleWilayaChange = useCallback((wilaya) => {
    setCustomerInfo(prevInfo => ({ ...prevInfo, wilaya: wilaya, town: '' }));
    setFormErrors(prevErrors => ({ ...prevErrors, wilaya: '' }));
  }, []);

  const handleTownChange = useCallback((town) => {
    setCustomerInfo(prevInfo => ({ ...prevInfo, town: town }));
    setFormErrors(prevErrors => ({ ...prevErrors, town: '' }));
  }, []);
  
  const handlePhoneChange = useCallback((e) => {
    let value = e.target.value;
    const prefix = '+213 ';

    if (!value.startsWith(prefix)) {
      const digits = value.replace(/[^0-9]/g, '');
      value = prefix + digits;
    } else {
      value = prefix + value.substring(prefix.length).replace(/[^0-9]/g, '');
    }

    const digitsOnly = value.substring(prefix.length).replace(/[^0-9]/g, '');
    const maxDigits = 10;
    
    if (digitsOnly.length > maxDigits) {
      value = prefix + digitsOnly.substring(0, maxDigits);
    }

    setCustomerInfo(prevInfo => ({ ...prevInfo, phone: value }));
    setFormErrors(prevErrors => ({ ...prevErrors, phone: '' }));
  }, []);

  const handleDeliveryMethodChange = useCallback((e) => {
    setDeliveryMethod(e.target.value);
    if (e.target.value === 'yalidine') {
      setFormErrors(prevErrors => ({ ...prevErrors, address: '' }));
    }
  }, []);

  // 🚀🚀🚀 CORRECTED ORDER SUBMISSION WITH CORS FIX 🚀🚀🚀
  const handleSubmitOrder = useCallback(async (e) => {
    e.preventDefault();
    if (!auth?.currentUser) {
      alert('Please log in first');
      onNavigate('login');
      return;
    }

    if (!validateForm()) return;
    
    if (itemsToProcess.length === 0) {
        alert('No items in cart to place order.');
        return;
    }

    if (!db || !auth || !auth.currentUser || !appId) {
      alert('Connection error. Please try again later');
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      customerInfo: { ...customerInfo, deliveryMethod: deliveryMethod },
      items: itemsToProcess.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        size: item.size || null,
        isDirectPurchase: !!directPurchaseData,
      })),
      summary: {
        subtotal: subtotal,
        shipping: shippingCost,
        total: totalAmount,
      },
      userId: auth.currentUser.uid,
      placedAt: serverTimestamp(),
      orderStatus: 'Pending',
      orderSource: directPurchaseData ? 'direct_purchase' : 'cart',
    };

    try {
      // 1. First save to Firebase
      const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);
      await addDoc(ordersCollectionRef, orderData);
      
      // 2. 🚀 CORRECTED: Try multiple backend URLs with fallback
      console.log('📦 Sending order to Yalidine...');
      
      const yalidineOrderData = {
        order_id: `order_${Date.now()}_${auth.currentUser.uid.substring(0, 8)}`,
        from_wilaya_name: "Alger",
        firstname: customerInfo.fullName.split(' ')[0] || customerInfo.fullName,
        familyname: customerInfo.fullName.split(' ').slice(1).join(' ') || "",
        contact_phone: customerInfo.phone,
        address: customerInfo.address || "Not specified",
        to_commune_name: customerInfo.town,
        to_wilaya_name: customerInfo.wilaya,
        product_list: itemsToProcess.map(item => 
          `${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ''}`
        ).join(', '),
        price: totalAmount,
        do_insurance: true,
        declared_value: totalAmount,
        height: 10,
        width: 20,
        length: 30,
        weight: Math.max(1, itemsToProcess.length * 0.3),
        freeshipping: false,
        is_stopdesk: deliveryMethod === 'yalidine',
        has_exchange: false
      };

      // 🚀 CORRECTED: Try multiple backend URLs with proper error handling
      const backendUrls = [
        'http://localhost:3001/api/yalidine-orders',  // Local development
         'https://vizoshop-production.up.railway.app/api/yalidine-orders'// Production (update this URL)
      ];

      let yalidineResponse = null;
      let yalidineResult = null;
      let yalidineSuccess = false;

      for (const url of backendUrls) {
        try {
          console.log(`🔄 Trying backend: ${url}`);
          yalidineResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([yalidineOrderData])
          });

          if (yalidineResponse.ok) {
            yalidineResult = await yalidineResponse.json();
            yalidineSuccess = true;
            console.log(`✅ Backend ${url} succeeded`);
            break;
          } else {
            console.warn(`⚠️ Backend ${url} failed with status: ${yalidineResponse.status}`);
          }
        } catch (error) {
          console.warn(`⚠️ Backend ${url} error:`, error.message);
          continue;
        }
      }

      if (yalidineSuccess && yalidineResult && yalidineResult[yalidineOrderData.order_id]?.success) {
        console.log('✅ Yalidine shipment created:', yalidineResult[yalidineOrderData.order_id]);
        alert(`🎉 Order placed successfully!\n📦 Tracking: ${yalidineResult[yalidineOrderData.order_id].tracking}\n📋 Label: ${yalidineResult[yalidineOrderData.order_id].label}`);
      } else {
        console.warn('⚠️ Yalidine creation failed or no backend available');
        alert('✅ Order saved successfully! We will contact you shortly to arrange shipping.');
      }

      // 3. Show success and cleanup
      setIsOrderPlaced(true);
      onPlaceOrder(orderData);
      
      if (!directPurchaseData) {
        onClearCart();
      }
      
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Failed to place order:', error);
      
      // Check if it's a Yalidine error or Firebase error
      if (error.message.includes('Yalidine') || error.message.includes('fetch')) {
        alert('✅ Order saved to database! Shipping will be arranged separately.');
        setIsOrderPlaced(true);
        onPlaceOrder(orderData);
        if (!directPurchaseData) {
          onClearCart();
        }
      } else {
        alert(`❌ Failed to place order: ${error.message}`);
        setIsOrderPlaced(false);
      }
      
      setIsSubmitting(false);
    }
  }, [
    customerInfo, 
    itemsToProcess, 
    subtotal, 
    shippingCost, 
    totalAmount, 
    validateForm, 
    onPlaceOrder, 
    onClearCart, 
    db, 
    auth, 
    appId, 
    onNavigate, 
    deliveryMethod, 
    directPurchaseData
  ]);

  // Memoized order summary component
  const renderOrderSummary = useMemo(() => (
    <div className="luxury-summary-container">
      <div className="luxury-card-border">
        <div className="luxury-metallic-edge"></div>
      </div>
      
      <div className="luxury-summary-content">
        <h3 className="luxury-summary-title">
          {directPurchaseData ? 'DIRECT PURCHASE SUMMARY' : 'ORDER SUMMARY'}
        </h3>
        <div className="luxury-title-underline"></div>

        <div className="luxury-items-list">
          {itemsToProcess.map((item) => (
            <div key={item.id} className="luxury-item-row">
              <div className="luxury-item-info">
                <span className="luxury-item-name">{item.name}</span>
                <div className="luxury-item-details">
                  {item.size && (
                    <span className="luxury-item-size">{item.size}</span>
                  )}
                  <span className="luxury-item-quantity">x{item.quantity}</span>
                </div>
              </div>
              <span className="luxury-item-price">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="luxury-summary-totals">
          <div className="luxury-total-row">
            <span>Subtotal:</span>
            <span className="luxury-total-amount">{formatCurrency(subtotal)}</span>
          </div>
          <div className="luxury-total-row">
            <span>Shipping ({deliveryMethod === 'home' ? 'Home Delivery' : 'Pickup Point'}):</span>
            <span className="luxury-total-amount">
              {customerInfo.wilaya ? formatCurrency(shippingCost) : 'Select Wilaya & Shipping'}
            </span>
          </div>
          <div className="luxury-total-final">
            <span>TOTAL AMOUNT:</span>
            <span className="luxury-final-price">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  ), [
    itemsToProcess, 
    subtotal, 
    shippingCost, 
    totalAmount, 
    customerInfo.wilaya, 
    deliveryMethod, 
    directPurchaseData
  ]);

  // Memoized customer info form component
  const renderCustomerInfoForm = useMemo(() => (
    <div className="luxury-form-container">
      <div className="luxury-card-border">
        <div className="luxury-metallic-edge"></div>
      </div>

      <div className="luxury-form-content">
        <h3 className="luxury-form-title">SHIPPING INFORMATION</h3>
        <div className="luxury-title-underline"></div>

        <form onSubmit={handleSubmitOrder} className="luxury-form">
          <div className="luxury-form-grid">
            {/* Full Name */}
            <div className="luxury-form-group luxury-full-width">
              <label className="luxury-form-label">FULL NAME</label>
              <input
                type="text"
                name="fullName"
                value={customerInfo.fullName}
                onChange={handleInputChange}
                className={`luxury-form-input ${formErrors.fullName ? 'luxury-input-error' : ''}`}
                placeholder="Enter your full name"
              />
              {formErrors.fullName && <span className="luxury-error-message">{formErrors.fullName}</span>}
            </div>

            {/* Phone Number */}
            <div className="luxury-form-group luxury-full-width">
              <label className="luxury-form-label">PHONE NUMBER</label>
              <div className="luxury-phone-input-container">
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handlePhoneChange}
                  className={`luxury-form-input luxury-phone-input ${formErrors.phone ? 'luxury-input-error' : ''}`}
                  placeholder="5XX XXX XXX or 05XXXXXXXX"
                />
                <span className="luxury-phone-prefix">+213</span>
              </div>
              {formErrors.phone && <span className="luxury-error-message">{formErrors.phone}</span>}
            </div>

            {/* Delivery Method */}
            <div className="luxury-form-group luxury-full-width">
              <label className="luxury-form-label">DELIVERY METHOD</label>
              <div className="luxury-delivery-options">
                <label className="luxury-radio-option">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="home"
                    checked={deliveryMethod === 'home'}
                    onChange={handleDeliveryMethodChange}
                    className="luxury-radio-input"
                  />
                  <span className="luxury-radio-custom"></span>
                  <span className="luxury-radio-label">Home Delivery</span>
                </label>
                <label className="luxury-radio-option">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="yalidine"
                    checked={deliveryMethod === 'yalidine'}
                    onChange={handleDeliveryMethodChange}
                    className="luxury-radio-input"
                  />
                  <span className="luxury-radio-custom"></span>
                  <span className="luxury-radio-label">Pickup Point (Yalidine)</span>
                </label>
              </div>
            </div>

            {/* Address */}
            {deliveryMethod === 'home' && (
              <div className="luxury-form-group luxury-full-width">
                <label className="luxury-form-label">FULL ADDRESS</label>
                <input
                  type="text"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  className={`luxury-form-input ${formErrors.address ? 'luxury-input-error' : ''}`}
                  placeholder="Street, Neighborhood, Postal Code"
                />
                {formErrors.address && <span className="luxury-error-message">{formErrors.address}</span>}
              </div>
            )}

            {/* Wilaya and Town Selectors */}
            <div className="luxury-form-group luxury-full-width">
              <label className="luxury-form-label">SELECT YOUR LOCATION</label>
              <div className="luxury-location-selectors">
                <WilayaTownSelector
                  selectedWilaya={customerInfo.wilaya}
                  selectedTown={customerInfo.town}
                  onWilayaChange={handleWilayaChange}
                  onTownChange={handleTownChange}
                  wilayaError={formErrors.wilaya}
                  townError={formErrors.town}
                  locations={algeriaLocations}
                  PremiumColors={PremiumColors}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="luxury-form-actions">
            <button
              type="submit"
              disabled={isSubmitting || itemsToProcess.length === 0 || isOrderPlaced}
              className={`luxury-submit-button ${isSubmitting ? 'luxury-button-animating' : ''} ${!itemsToProcess.length ? 'luxury-button-disabled' : ''}`}
            >
              <span className="luxury-button-text">
                {isSubmitting ? (
                  <>
                    <div className="luxury-loading-spinner-small"></div>
                    PROCESSING...
                  </>
                ) : isOrderPlaced ? (
                  'ORDER PLACED'
                ) : (
                  `PLACE ORDER (${formatCurrency(totalAmount)})`
                )}
              </span>
              <div className="luxury-button-glow"></div>
            </button>

            {isOrderPlaced && (
              <div className="luxury-success-message">
                <div className="luxury-success-icon">✓</div>
                <h3 className="luxury-success-title">ORDER CONFIRMED!</h3>
                <p className="luxury-success-description">
                  We will contact you shortly to confirm your order details. Thank you for your trust.
                </p>
                <button
                  onClick={() => onNavigate('home')}
                  className="luxury-success-button"
                >
                  RETURN TO HOME
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  ), [
    customerInfo,
    formErrors,
    deliveryMethod,
    isSubmitting,
    isOrderPlaced,
    itemsToProcess.length,
    totalAmount,
    handleInputChange,
    handlePhoneChange,
    handleDeliveryMethodChange,
    handleWilayaChange,
    handleTownChange,
    handleSubmitOrder,
    onNavigate
  ]);

  if (itemsToProcess.length === 0 && !isOrderPlaced) {
    return (
      <div className="luxury-checkout-page">
        <div className="luxury-page-background">
          <div className="luxury-glow-1"></div>
          <div className="luxury-glow-2"></div>
        </div>

        <div className="luxury-page-container">
          <div className="luxury-not-found-container">
            <div className="luxury-not-found-content">
              <div className="luxury-not-found-icon">🛒</div>
              <h2 className="luxury-not-found-title">
                {directPurchaseData ? 'PROCESSING ERROR' : 'NO ITEMS SELECTED'}
              </h2>
              <p className="luxury-not-found-description">
                {directPurchaseData ? 'Please try again' : 'Please return to cart and add products'}
              </p>
              <button
                onClick={() => directPurchaseData ? onNavigate('products') : onNavigate('cart')}
                className="luxury-back-button"
              >
                {directPurchaseData ? 'BACK TO PRODUCTS' : 'BACK TO CART'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="luxury-checkout-page">
      {/* Background Effects */}
      <div className="luxury-page-background">
        <div className="luxury-glow-1"></div>
        <div className="luxury-glow-2"></div>
      </div>

      <div className="luxury-page-container">
        <div className="luxury-content-wrapper">
          {/* Page Header */}
          <div className="luxury-page-header">
            <h1 className="luxury-page-title">
              COMPLETE YOUR <span className="luxury-accent-text">PURCHASE</span>
            </h1>
            <div className="luxury-title-underline"></div>
          </div>

          {/* Main Content Grid */}
          <div className="luxury-checkout-grid">
            {renderCustomerInfoForm}
            {renderOrderSummary}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700,800,900&f[]=satoshi@400,500,600,700,800,900&display=swap');

        .luxury-checkout-page {
          background-color: ${PremiumColors.DeepMatteBlack};
          color: ${PremiumColors.PureWhite};
          font-family: 'Clash Display', 'Satoshi', 'Outfit', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .luxury-page-background {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .luxury-glow-1 {
          position: absolute;
          top: 20%;
          left: 10%;
          width: 40vw;
          height: 40vw;
          border-radius: 50%;
          background: radial-gradient(circle, ${PremiumColors.ElectricBlueStart}05, transparent 60%);
          filter: blur(40px);
          opacity: 0.3;
        }

        .luxury-glow-2 {
          position: absolute;
          bottom: 10%;
          right: 10%;
          width: 30vw;
          height: 30vw;
          border-radius: 50%;
          background: radial-gradient(circle, ${PremiumColors.ElectricBlueEnd}03, transparent 60%);
          filter: blur(40px);
          opacity: 0.2;
        }

        .luxury-page-container {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .luxury-content-wrapper {
          padding-top: 2rem;
        }

        /* Page Header */
        .luxury-page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .luxury-page-title {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 3rem;
          color: ${PremiumColors.PureWhite};
          letter-spacing: 0.02em;
          margin-bottom: 1rem;
        }

        .luxury-accent-text {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .luxury-title-underline {
          width: 120px;
          height: 4px;
          background: linear-gradient(90deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          border-radius: 2px;
          margin: 0 auto;
        }

        /* Checkout Grid */
        .luxury-checkout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 768px) {
          .luxury-checkout-grid {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
        }

        /* Form and Summary Containers */
        .luxury-form-container,
        .luxury-summary-container {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
        }

        .luxury-card-border {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, ${PremiumColors.MetallicGray}, ${PremiumColors.MetallicGray});
          z-index: 1;
        }

        .luxury-metallic-edge {
          width: 100%;
          height: 100%;
          border-radius: 19px;
          background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.1));
        }

        .luxury-form-content,
        .luxury-summary-content {
          position: relative;
          padding: 2rem;
          z-index: 2;
        }

        /* Form and Summary Titles */
        .luxury-form-title,
        .luxury-summary-title {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 1.5rem;
          color: ${PremiumColors.PureWhite};
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        /* Form Styles */
        .luxury-form-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .luxury-form-group {
          display: flex;
          flex-direction: column;
        }

        .luxury-full-width {
          grid-column: 1 / -1;
        }

        .luxury-form-label {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          color: ${PremiumColors.PureWhite};
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .luxury-form-input {
          width: 100%;
          padding: 1.2rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 12px;
          color: ${PremiumColors.InputText};
          font-family: 'Satoshi', sans-serif;
          font-size: 1.1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .luxury-form-input::placeholder {
          color: ${PremiumColors.PlaceholderText};
          font-weight: 400;
        }

        .luxury-form-input:focus {
          outline: none;
          border-color: ${PremiumColors.ElectricBlueStart};
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 25px rgba(0, 157, 255, 0.3);
          transform: translateY(-2px);
        }

        .luxury-input-error {
          border-color: #ff6b6b !important;
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.3) !important;
        }

        .luxury-error-message {
          color: #ff6b6b;
          font-family: 'Satoshi', sans-serif;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        /* Location Selectors */
        .luxury-location-selectors {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid ${PremiumColors.GlassBorder};
        }

        /* Phone Input */
        .luxury-phone-input-container {
          position: relative;
        }

        .luxury-phone-input {
          padding-left: 5rem;
        }

        .luxury-phone-prefix {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: ${PremiumColors.CoolGray};
          font-family: 'Satoshi', sans-serif;
          font-weight: 500;
        }

        /* Delivery Options */
        .luxury-delivery-options {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .luxury-radio-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .luxury-radio-input {
          display: none;
        }

        .luxury-radio-custom {
          width: 20px;
          height: 20px;
          border: 2px solid ${PremiumColors.GlassBorder};
          border-radius: 50%;
          position: relative;
          transition: all 0.3s ease;
        }

        .luxury-radio-input:checked + .luxury-radio-custom {
          border-color: ${PremiumColors.ElectricBlueStart};
        }

        .luxury-radio-input:checked + .luxury-radio-custom::after {
          content: '';
          width: 10px;
          height: 10px;
          background: ${PremiumColors.ElectricBlueStart};
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .luxury-radio-label {
          font-family: 'Satoshi', sans-serif;
          font-weight: 500;
          color: ${PremiumColors.PureWhite};
        }

        /* Submit Button */
        .luxury-form-actions {
          margin-top: 2rem;
        }

        .luxury-submit-button {
          position: relative;
          width: 100%;
          padding: 1.25rem 2rem;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          border: none;
          border-radius: 12px;
          color: ${PremiumColors.PureWhite};
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .luxury-submit-button:not(.luxury-button-disabled):not(.luxury-button-animating):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 157, 255, 0.4);
        }

        .luxury-button-animating {
          background: ${PremiumColors.CoolGray} !important;
          color: ${PremiumColors.MetallicGray} !important;
          cursor: not-allowed;
          transform: none !important;
        }

        .luxury-button-disabled {
          background: rgba(255, 107, 107, 0.1) !important;
          color: #ff6b6b !important;
          border: 1px solid rgba(255, 107, 107, 0.3) !important;
          cursor: not-allowed;
          transform: none !important;
        }

        .luxury-button-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 2;
        }

        .luxury-button-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.7s ease;
        }

        .luxury-submit-button:hover .luxury-button-glow {
          left: 100%;
        }

        .luxury-loading-spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid currentColor;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: luxurySpin 1s linear infinite;
        }

        @keyframes luxurySpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Success Message */
        .luxury-success-message {
          text-align: center;
          padding: 2rem;
          background: rgba(0, 157, 255, 0.1);
          border: 1px solid rgba(0, 157, 255, 0.3);
          border-radius: 15px;
          margin-top: 1.5rem;
        }

        .luxury-success-icon {
          font-size: 3rem;
          color: ${PremiumColors.ElectricBlueStart};
          margin-bottom: 1rem;
        }

        .luxury-success-title {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: ${PremiumColors.PureWhite};
          margin-bottom: 1rem;
        }

        .luxury-success-description {
          font-family: 'Satoshi', sans-serif;
          font-weight: 400;
          font-size: 0.9rem;
          color: ${PremiumColors.CoolGray};
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .luxury-success-button {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 8px;
          color: ${PremiumColors.PureWhite};
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .luxury-success-button:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: ${PremiumColors.ElectricBlueStart};
        }

        /* Order Summary Styles */
        .luxury-items-list {
          margin: 1.5rem 0;
        }

        .luxury-item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1rem 0;
          border-bottom: 1px solid ${PremiumColors.GlassBorder};
        }

        .luxury-item-row:last-child {
          border-bottom: none;
        }

        .luxury-item-info {
          flex: 1;
        }

        .luxury-item-name {
          font-family: 'Satoshi', sans-serif;
          font-weight: 600;
          color: ${PremiumColors.PureWhite};
          display: block;
          margin-bottom: 0.5rem;
        }

        .luxury-item-details {
          display: flex;
          gap: 0.5rem;
        }

        .luxury-item-size {
          padding: 0.25rem 0.75rem;
          background: rgba(0, 157, 255, 0.1);
          border: 1px solid rgba(0, 157, 255, 0.3);
          border-radius: 15px;
          font-family: 'Satoshi', sans-serif;
          font-weight: 500;
          font-size: 0.8rem;
          color: ${PremiumColors.ElectricBlueStart};
        }

        .luxury-item-quantity {
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 15px;
          font-family: 'Satoshi', sans-serif;
          font-weight: 500;
          font-size: 0.8rem;
          color: ${PremiumColors.CoolGray};
        }

        .luxury-item-price {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          color: ${PremiumColors.PureWhite};
          white-space: nowrap;
        }

        .luxury-summary-totals {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid ${PremiumColors.GlassBorder};
        }

        .luxury-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          font-family: 'Satoshi', sans-serif;
          color: ${PremiumColors.CoolGray};
        }

        .luxury-total-amount {
          font-weight: 600;
          color: ${PremiumColors.PureWhite};
        }

        .luxury-total-final {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          margin-top: 1rem;
          border-top: 1px dashed ${PremiumColors.GlassBorder};
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: ${PremiumColors.PureWhite};
        }

        .luxury-final-price {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.3rem;
        }

        /* Selection Styling */
        .luxury-checkout-page ::selection {
          background: ${PremiumColors.ElectricBlueStart};
          color: ${PremiumColors.PureWhite};
        }
      `}</style>
    </div>
  );
};

export default React.memo(CheckoutPage);