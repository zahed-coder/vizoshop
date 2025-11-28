import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';

// Premium Luxury Color Palette - MOVED OUTSIDE COMPONENT
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
  MetallicGray: '#1A1A1A'
};

// Static data and styles moved outside component
const placeholderImage = (productName) => 
  `https://via.placeholder.com/400x400/1a1a1a/ffffff?text=${encodeURIComponent(productName)}`;

/**
 * Luxury ProductCard Component
 * Premium futuristic product card with flexible zones and perfect grid alignment
 * OPTIMIZED WITH React.memo and performance enhancements
 */
const ProductCard = ({ product, onAddToCart, currencySymbol = 'DZD', onImageLoad, isImageLoaded = false }) => {
  const [buttonText, setButtonText] = useState('ADD TO CART');
  const [isAnimating, setIsAnimating] = useState(false);
  const [localImageLoaded, setLocalImageLoaded] = useState(false);

  const isOutOfStock = product.stock <= 0;

  // 🚀 FIX: Optimized add to cart with proper dependencies
  const handleAddToCartClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAnimating || isOutOfStock) return;

    setIsAnimating(true);
    onAddToCart(product, 1);

    setButtonText('ADDED! ✔');

    const timer = setTimeout(() => {
      setButtonText('ADD TO CART');
      setIsAnimating(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAnimating, isOutOfStock, onAddToCart, product]);

  // 🚀 FIX: Optimized image loading with single handler
  const handleImageLoad = useCallback((e) => {
    setLocalImageLoaded(true);
    onImageLoad?.(product.imageUrl);
  }, [onImageLoad, product.imageUrl]);

  // 🚀 FIX: Optimized image error handling
  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = placeholderImage(product.name);
    setLocalImageLoaded(true);
    onImageLoad?.(product.imageUrl);
  }, [product.name, product.imageUrl, onImageLoad]);

  const imageLoadedState = isImageLoaded || localImageLoaded;

  return (
    <div
      className="luxury-product-card group"
      style={{
        fontFamily: "'Clash Display', 'Satoshi', 'Outfit', sans-serif"
      }}
    >
      {/* Main Card Container */}
      <div className="luxury-card-container">
        {/* Outer Glow Layer */}
        <div className="luxury-glow-outer"></div>
        
        {/* Inner Glow Layer */}
        <div className="luxury-glow-inner"></div>

        {/* Card Border */}
        <div className="luxury-card-border">
          <div className="luxury-metallic-edge"></div>
        </div>

        {/* Main Card Content with Flexible Zones */}
        <div className="luxury-card-content">
          {/* ZONE 1: Fixed Image Section */}
          <Link to={`/product/${product.id}`} className="luxury-image-zone">
            <div className="luxury-image-container">
              {/* Background Glow */}
              <div className="luxury-image-glow"></div>
              
              {/* Loading State */}
              {!imageLoadedState && (
                <div className="luxury-image-loading">
                  <div className="luxury-loading-spinner"></div>
                </div>
              )}

              {/* Product Image */}
              <div className="luxury-image-wrapper">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className={`luxury-product-image ${imageLoadedState ? 'luxury-image-loaded' : 'luxury-image-loading'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  width="400"
                  height="400"
                />
              </div>

              {/* Hover Overlay */}
              <div className="luxury-image-overlay">
                <div className="luxury-view-details">
                  <span>VIEW DETAILS</span>
                  <svg className="luxury-arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* ZONE 2: Flexible Text Section */}
          <Link to={`/product/${product.id}`} className="luxury-text-zone">
            <div className="luxury-text-content">
              {/* Product Name */}
              <h3 className="luxury-product-name">
                {product.name}
              </h3>
              
              {/* Product Description */}
              <p className="luxury-product-description">
                {product.description}
              </p>
            </div>
          </Link>

          {/* ZONE 3: Fixed Actions Section (Always Visible) */}
          <div className="luxury-actions-zone">
            {/* Price and Info Row */}
            <div className="luxury-info-row">
              <div className="luxury-price-section">
                <p className="luxury-product-price">
                  {product.price.toFixed(2)} <span className="luxury-currency">{currencySymbol}</span>
                </p>
                {isOutOfStock ? (
                  <span className="luxury-stock-badge luxury-stock-out">
                    OUT OF STOCK
                  </span>
                ) : (
                  <span className="luxury-stock-badge luxury-stock-low">
                    PROMO
                  </span>
                )}
              </div>
              
              {/* Premium Badge */}
              <div className="luxury-premium-badge">
                <span>PREMIUM</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="luxury-buttons-container">
              {/* Buy Now Button */}
              {!isOutOfStock && (
                <Link
                  to={`/product/${product.id}`}
                  className="luxury-primary-button"
                  aria-label={`Buy ${product.name} now`}
                >
                  <span className="luxury-button-text">BUY NOW</span>
                  <div className="luxury-button-glow"></div>
                </Link>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCartClick}
                className={`luxury-secondary-button ${isAnimating ? 'luxury-button-animating' : ''} ${isOutOfStock ? 'luxury-button-disabled' : ''}`}
                disabled={isAnimating || isOutOfStock}
                aria-label={`Add ${product.name} to cart`}
              >
                <span className="luxury-button-text">
                  {isOutOfStock ? 'OUT OF STOCK' : buttonText}
                </span>
                <div className="luxury-button-glow"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Global Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700,800,900&f[]=satoshi@400,500,600,700,800,900&display=swap');

        .luxury-product-card {
          width: 100%;
          height: auto;
          min-height: 480px;
          position: relative;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translateZ(0); /* Hardware acceleration */
        }

        .luxury-card-container {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
        }

        /* Glow Effects */
        .luxury-glow-outer {
          position: absolute;
          inset: -2px;
          border-radius: 22px;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}00, ${PremiumColors.ElectricBlueEnd}00);
          opacity: 0;
          transition: all 0.5s ease;
          z-index: 1;
        }

        .luxury-glow-inner {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: radial-gradient(circle at 50% 0%, ${PremiumColors.ElectricBlueStart}10, transparent 50%);
          opacity: 0.3;
          transition: all 0.5s ease;
          z-index: 2;
        }

        /* Card Border */
        .luxury-card-border {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, ${PremiumColors.MetallicGray}, ${PremiumColors.MetallicGray});
          z-index: 3;
        }

        .luxury-metallic-edge {
          width: 100%;
          height: 100%;
          border-radius: 19px;
          background: linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.1));
        }

        /* Main Card Content - Flex Column Layout */
        .luxury-card-content {
          position: relative;
          width: 100%;
          height: 100%;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 19px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 4;
        }

        /* Hover Effects - Optimized with will-change */
        .luxury-product-card:hover {
          transform: translateY(-8px) scale(1.02);
          will-change: transform;
        }

        .luxury-product-card:hover .luxury-glow-outer {
          opacity: 1;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}30, ${PremiumColors.ElectricBlueEnd}20);
          box-shadow: 0 0 40px ${PremiumColors.BlueGlowIntense};
        }

        .luxury-product-card:hover .luxury-glow-inner {
          opacity: 0.6;
        }

        .luxury-product-card:hover .luxury-card-border {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
        }

        /* ZONE 1: Fixed Image Section */
        .luxury-image-zone {
          display: block;
          flex: 0 0 250px;
          position: relative;
          overflow: hidden;
        }

        .luxury-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, ${PremiumColors.MetallicGray}, #0a0a0a);
        }

        .luxury-image-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, ${PremiumColors.ElectricBlueStart}05, transparent 60%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .luxury-product-card:hover .luxury-image-glow {
          opacity: 1;
        }

        .luxury-image-wrapper {
          position: relative;
          width: 80%;
          height: 80%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .luxury-product-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0;
          will-change: transform, opacity;
        }

        .luxury-image-loaded {
          opacity: 1;
        }

        .luxury-product-card:hover .luxury-product-image {
          transform: scale(1.08) rotate(1deg);
        }

        .luxury-image-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(26, 26, 26, 0.8);
        }

        .luxury-loading-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid ${PremiumColors.GlassBorder};
          border-top: 2px solid ${PremiumColors.ElectricBlueStart};
          border-radius: 50%;
          animation: luxurySpin 1s linear infinite;
        }

        @keyframes luxurySpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Image Overlay */
        .luxury-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8));
          display: flex;
          align-items: flex-end;
          justify-content: center;
          opacity: 0;
          transition: all 0.4s ease;
          padding-bottom: 20px;
        }

        .luxury-product-card:hover .luxury-image-overlay {
          opacity: 1;
        }

        .luxury-view-details {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${PremiumColors.PureWhite};
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .luxury-arrow-icon {
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease;
        }

        .luxury-product-card:hover .luxury-arrow-icon {
          transform: translateX(3px);
        }

        /* ZONE 2: Flexible Text Section */
        .luxury-text-zone {
          display: block;
          flex: 1 1 auto;
          min-height: 80px;
          max-height: 120px;
          padding: 16px 20px 8px 20px;
          text-decoration: none;
          transition: background-color 0.3s ease;
          overflow: hidden;
        }

        .luxury-text-zone:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .luxury-text-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .luxury-product-name {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: ${PremiumColors.PureWhite};
          margin-bottom: 8px;
          line-height: 1.3;
          letter-spacing: 0.02em;
          
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.6em;
        }

        .luxury-product-description {
          font-family: 'Satoshi', sans-serif;
          font-weight: 400;
          font-size: 0.85rem;
          color: ${PremiumColors.CoolGray};
          line-height: 1.5;
          
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        /* ZONE 3: Fixed Actions Section (Pinned to Bottom) */
        .luxury-actions-zone {
          flex: 0 0 auto;
          margin-top: auto;
          padding: 8px 20px 20px 20px;
          min-height: 130px;
        }

        .luxury-info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 12px;
        }

        .luxury-price-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .luxury-product-price {
          font-family: 'Clash Display', sans-serif;
          font-weight: 800;
          font-size: 1.3rem;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
          line-height: 1;
        }

        .luxury-currency {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .luxury-stock-badge {
          font-family: 'Satoshi', sans-serif;
          font-weight: 600;
          font-size: 0.7rem;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .luxury-stock-out {
          background: rgba(255, 107, 107, 0.15);
          color: #ff6b6b;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .luxury-stock-low {
          background: rgba(0, 157, 255, 0.15);
          color: ${PremiumColors.ElectricBlueStart};
          border: 1px solid rgba(0, 157, 255, 0.3);
        }

        .luxury-premium-badge {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          color: ${PremiumColors.PureWhite};
          padding: 6px 10px;
          border-radius: 8px;
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Action Buttons */
        .luxury-buttons-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .luxury-primary-button, .luxury-secondary-button {
          position: relative;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          text-align: center;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        .luxury-primary-button {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          color: ${PremiumColors.PureWhite};
          box-shadow: 0 4px 20px rgba(0, 157, 255, 0.3);
        }

        .luxury-primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 157, 255, 0.5);
        }

        .luxury-secondary-button {
          background: rgba(255, 255, 255, 0.05);
          color: ${PremiumColors.PureWhite};
          border: 1px solid ${PremiumColors.GlassBorder};
          backdrop-filter: blur(10px);
        }

        .luxury-secondary-button:not(.luxury-button-disabled):not(.luxury-button-animating):hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: ${PremiumColors.ElectricBlueStart};
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 157, 255, 0.2);
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

        .luxury-primary-button:hover .luxury-button-glow,
        .luxury-secondary-button:hover .luxury-button-glow {
          left: 100%;
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
          border-color: rgba(255, 107, 107, 0.3) !important;
          cursor: not-allowed;
          transform: none !important;
        }

        .luxury-button-text {
          position: relative;
          z-index: 2;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .luxury-product-card {
            min-height: 440px;
          }
          
          .luxury-image-zone {
            flex: 0 0 200px;
          }
          
          .luxury-text-zone {
            padding: 12px 16px 8px 16px;
            max-height: 100px;
          }
          
          .luxury-actions-zone {
            padding: 8px 16px 16px 16px;
            min-height: 120px;
          }
          
          .luxury-product-name {
            font-size: 1rem;
          }
          
          .luxury-product-price {
            font-size: 1.1rem;
          }
        }

        /* Selection Styling */
        .luxury-product-card ::selection {
          background: ${PremiumColors.ElectricBlueStart};
          color: ${PremiumColors.PureWhite};
        }
      `}</style>
    </div>
  );
};

// 🚀 CRITICAL FIX: React.memo with custom comparison function
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.stock === nextProps.product.stock &&
    prevProps.currencySymbol === nextProps.currencySymbol &&
    prevProps.isImageLoaded === nextProps.isImageLoaded &&
    prevProps.onAddToCart === nextProps.onAddToCart &&
    prevProps.onImageLoad === nextProps.onImageLoad
  );
};

export default memo(ProductCard, areEqual);