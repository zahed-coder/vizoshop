import React, { useState, useEffect, useCallback, useMemo } from 'react';
import QuantitySelector from '../components/QuantitySelector';
import { useLanguage } from '../context/LanguageContext';
import { LuArrowLeft } from "react-icons/lu";
import ProductCard from '../components/ProductCard';

// Updated VizoColors palette for consistency
const VizoColors = {
  PrimaryDark: '#1A2A3A',
  AccentOrange: '#E66B3B',
  LightText: '#FFFFFF',
  NeutralBlue: '#6A8DAD',
  OffWhite: '#F9F9F9',
  GradientPurple: '#9D50BB',
  GradientYellow: '#F2D50F',
  SoftHighlight: '#A0AEC0'
};

const ProductDetailPage = ({ product, onAddToCart, onNavigate, allProducts }) => {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [buttonText, setButtonText] = useState(t('addToCart'));
  const [isAnimating, setIsAnimating] = useState(false);
  const [mainImage, setMainImage] = useState(product?.imageUrl);
  const [zoomStyle, setZoomStyle] = useState({});

  // Format currency function
  const formatCurrency = useCallback((amount) => {
    return `${parseFloat(amount).toFixed(2)} DZD`;
  }, []);

  // Determine if the product is out of stock
  const isOutOfStock = product?.stock <= 0;

  // Update UI when product changes
  useEffect(() => {
    if (product?.imageUrl) {
      setMainImage(product.imageUrl);
    } else {
      setMainImage(`https://placehold.co/600x400/${VizoColors.PrimaryDark.substring(1)}/white?text=${t('imageNA').replace(/\s/g, '+')}`);
    }
    setQuantity(1);
    setButtonText(t('addToCart'));
    setIsAnimating(false);
  }, [product, t]);

  // Image zoom handlers
  const handleMouseMove = useCallback((e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)',
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)',
    });
  }, []);

  // Add to cart handler
  const handleAddToCartClick = useCallback((e) => {
    e.stopPropagation();
    if (isAnimating || isOutOfStock) return; // Prevent adding if animating or out of stock

    setIsAnimating(true);
    onAddToCart(product, quantity);

    setButtonText(t('added'));

    const timer = setTimeout(() => {
      setButtonText(t('addToCart'));
      setIsAnimating(false);
      setQuantity(1); // Reset quantity after adding to cart
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAnimating, isOutOfStock, onAddToCart, product, quantity, t]);

  // New handler for direct checkout
  const handleDirectCheckout = useCallback((e) => {
    e.stopPropagation();
    if (isAnimating || isOutOfStock) return; // Prevent if animating or out of stock

    setIsAnimating(true);
    
    // Navigate directly to checkout with this product
    onNavigate('checkout', {
      selectedItems: [{
        ...product,
        quantity: quantity
      }]
    });

    // Reset button after delay
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAnimating, isOutOfStock, onNavigate, product, quantity]); // Added isOutOfStock to dependencies

  // Quantity handler
  const handleQuantityChange = useCallback((newQuantity) => {
    setQuantity(newQuantity);
  }, []);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    return formatCurrency(product?.price * quantity || 0);
  }, [product, quantity, formatCurrency]);

  // Calculate related products
  const relatedProducts = useMemo(() => {
    if (!allProducts || !product) return [];

    // Filter out current product and select 3 random related products
    return allProducts
      .filter(item => item.id !== product.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  }, [allProducts, product]);

  // Handle missing product
  if (!product) {
    return (
      <div className={`text-center py-20 rounded-xl shadow-lg m-4 md:m-8 w-full max-w-4xl bg-[${VizoColors.OffWhite}] border border-[${VizoColors.SoftHighlight}]/30`}>
        <p className={`text-[${VizoColors.NeutralBlue}] mb-6 text-xl`}>{t('productNotFound')}</p>
        <button
          onClick={() => onNavigate('products')}
          className={`bg-[${VizoColors.PrimaryDark}] text-[${VizoColors.LightText}] px-6 py-3 rounded-lg hover:bg-[${VizoColors.NeutralBlue}] transition-colors duration-300`}
        >
          {t('goBackToProducts')}
        </button>
      </div>
    );
  }

  // =====================================================================
  // --- Render Sections ---
  // =====================================================================

  const renderBackButton = () => (
    <button
      onClick={() => onNavigate('products')}
      className={`mb-6 inline-flex items-center text-[${VizoColors.NeutralBlue}] hover:text-[${VizoColors.PrimaryDark}] transition-colors duration-200`}
    >
      <LuArrowLeft className="w-5 h-5 mr-2" />
      {t('backToProducts')}
    </button>
  );

  const renderImageGallery = () => (
    <div className={`relative w-full flex flex-col items-center p-4 bg-[${VizoColors.OffWhite}] rounded-xl`}>
      <div
        className="w-full aspect-square max-w-lg rounded-xl overflow-hidden shadow-lg border border-gray-200 group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300"
          style={zoomStyle}
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = `https://placehold.co/600x400/${VizoColors.PrimaryDark.substring(1)}/white?text=${product.name.replace(/\s/g, '+')}`; 
          }}
        />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {t('hoverToZoom')}
      </div>
    </div>
  );

  const renderProductDetails = () => (
    <div className="flex flex-col space-y-6 lg:pl-8">
      <div>
        <h1 className={`text-3xl lg:text-4xl font-bold text-[${VizoColors.DarkText}] mb-2`}>
          {product.name}
        </h1>
        <div className="w-24 h-1 rounded-full mb-6" 
              style={{ background: `linear-gradient(90deg, ${VizoColors.GradientPurple}, ${VizoColors.GradientYellow})` }}></div>
      </div>

      <p className={`text-3xl font-bold text-[${VizoColors.AccentOrange}]`}>
        {formatCurrency(product.price)}
      </p>

      {/* Stock Information */}
      <div className="mb-4">
        {isOutOfStock ? (
          <span className={`text-lg font-medium text-[${VizoColors.AccentOrange}] px-3 py-1 rounded-full bg-[${VizoColors.AccentOrange}]/10`}>
            {t('outOfStock')}
          </span>
        ) : (
          <span className={`text-lg font-medium text-[${VizoColors.PrimaryDark}] px-3 py-1 rounded-full bg-[${VizoColors.PrimaryDark}]/10`}>
            {t('inStock')}
          </span>
        )}
      </div>

      <p className={`text-[${VizoColors.NeutralBlue}] leading-relaxed border-t border-gray-200 pt-6 mt-2`}>
        {product.description}
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6">
        <div className="flex items-center gap-4">
          <span className={`text-lg font-medium text-[${VizoColors.DarkText}]`}>{t('quantity')}:</span>
          <QuantitySelector quantity={quantity} onQuantityChange={handleQuantityChange} stock={product.stock} /> {/* Pass stock prop */}
        </div>
        <div className={`text-xl font-bold text-[${VizoColors.DarkText}]`}>
          {t('total')}: <span className={`text-[${VizoColors.AccentOrange}]`}>{calculateTotalPrice()}</span>
        </div>
      </div>

      {/* --- ADDED BUTTONS START --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <button
          onClick={handleAddToCartClick}
          disabled={isAnimating || isOutOfStock}
          className={`
            px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300
            ${isAnimating || isOutOfStock 
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
              : `bg-[${VizoColors.AccentOrange}] text-white hover:opacity-90 hover:shadow-xl`
            }
          `}
          style={{ backgroundColor: isAnimating || isOutOfStock ? '' : VizoColors.AccentOrange }}
        >
          {isOutOfStock ? t('outOfStock') : buttonText}
        </button>
        
        <button
          onClick={handleDirectCheckout}
          disabled={isAnimating || isOutOfStock}
          className={`
            px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300
            ${isAnimating || isOutOfStock 
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
              : `bg-[${VizoColors.PrimaryDark}] text-white hover:opacity-90 hover:shadow-xl`
            }
          `}
          style={{ backgroundColor: isAnimating || isOutOfStock ? '' : VizoColors.PrimaryDark }}
        >
          {isOutOfStock ? t('outOfStock') : t('checkoutDirectly')}
        </button>
      </div>
      {/* --- ADDED BUTTONS END --- */}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className={`text-xl font-bold text-[${VizoColors.DarkText}] mb-4`}>{t('productSpecifications')}:</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <li className="flex items-center">
            <span className={`w-32 text-[${VizoColors.NeutralBlue}]`}>{t('material')}:</span>
            <span className={`font-medium text-[${VizoColors.DarkText}]`}>Premium Materials</span>
          </li>
          <li className="flex items-center">
            <span className={`w-32 text-[${VizoColors.NeutralBlue}]`}>{t('dimensions')}:</span>
            <span className={`font-medium text-[${VizoColors.DarkText}]`}>10cm x 5cm x 2cm</span>
          </li>
          <li className="flex items-center">
            <span className={`w-32 text-[${VizoColors.NeutralBlue}]`}>{t('weight')}:</span>
            <span className={`font-medium text-[${VizoColors.DarkText}]`}>0.15 kg</span>
          </li>
          <li className="flex items-center">
            <span className={`w-32 text-[${VizoColors.NeutralBlue}]`}>{t('warranty')}:</span>
            <span className={`font-medium text-[${VizoColors.DarkText}]`}>2 Years</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderRelatedProducts = () => (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-2xl font-bold text-[${VizoColors.DarkText}]`}>
          {t('youMightAlsoLove')}
        </h2>
        <button 
          onClick={() => onNavigate('products')}
          className={`text-[${VizoColors.AccentOrange}] hover:text-[${VizoColors.AccentOrange}]/80 transition-colors duration-200`}
        >
          {t('viewAll')} →
        </button>
      </div>
      
      {relatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard
              key={relatedProduct.id}
              product={relatedProduct}
              onAddToCart={onAddToCart}
              onNavigate={onNavigate}
              className="transform transition-transform duration-300 hover:-translate-y-1"
            />
          ))}
        </div>
      ) : (
        <p className={`text-center text-[${VizoColors.NeutralBlue}] py-8`}>{t('noOtherProductsAvailable')}</p>
      )}
    </section>
  );

  return (
    <div className={`container mx-auto p-4 md:p-8 bg-[${VizoColors.OffWhite}] rounded-xl shadow-lg m-4 md:m-8 w-full max-w-6xl`}>
      {renderBackButton()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {renderImageGallery()}
        {renderProductDetails()}
      </div>

      {renderRelatedProducts()}
    </div>
  );
};

export default ProductDetailPage;