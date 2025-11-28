import React, { useState, useEffect, useCallback, useMemo } from 'react';
import QuantitySelector from '../components/QuantitySelector';
import { useLanguage } from '../context/LanguageContext';
import { LuArrowLeft } from "react-icons/lu";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from '../components/ProductCard';
import products from '../data/products';
import { useParams, useNavigate } from 'react-router-dom';

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
  MetallicGray: '#1A1A1A'
};

const ProductDetailPage = ({ onAddToCart }) => {
  const { t } = useLanguage();
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(1);
  const [buttonText, setButtonText] = useState('ADD TO CART');
  const [isAnimating, setIsAnimating] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState({});

  // Find product by ID
  const product = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [productId]);

  // Format currency function
  const formatCurrency = useCallback((amount) => {
    return `${parseFloat(amount).toFixed(2)} DZD`;
  }, []);

  // Determine if the product is out of stock
  const isOutOfStock = product?.stock <= 0;

  // Check if product requires size selection
  const requiresSize = useMemo(() => {
    return product?.requiresSize || product?.variants?.type === 'size' || false;
  }, [product]);

  // Check if product requires color selection
  const requiresColor = useMemo(() => {
    return product?.requiresColor || (product?.id && ['000', '00'].includes(product.id));
  }, [product]);

  // Check if product has variants
  const hasVariants = useMemo(() => {
    return product?.variants && product.variants.options && product.variants.options.length > 0;
  }, [product]);

  // Get available sizes based on selected variant or product
  const availableSizes = useMemo(() => {
    if (selectedVariant?.sizes) {
      return selectedVariant.sizes;
    }
    if (product?.variants?.options?.[0]?.sizes) {
      return product.variants.options[0].sizes;
    }
    return ['S', 'M', 'L', 'XL']; // fallback
  }, [selectedVariant, product]);

  // Get current price based on selected variant
  const getCurrentPrice = useCallback(() => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.price;
    }
    return product?.price || 0;
  }, [hasVariants, selectedVariant, product]);

  // Get current images based on selected variant
  const getCurrentImages = useCallback(() => {
    if (hasVariants && selectedVariant && selectedVariant.image) {
      const otherImages = product.images ? product.images.filter(img => img !== selectedVariant.image) : [];
      return [selectedVariant.image, ...otherImages];
    }
    return product?.images || (product?.imageUrl ? [product.imageUrl] : []);
  }, [hasVariants, selectedVariant, product]);

  // Check if product can be purchased
  const canPurchase = useMemo(() => {
    if (isOutOfStock) return false;
    if (hasVariants && !selectedVariant) return false;
    if (requiresSize && !selectedSize) return false;
    if (requiresColor && !selectedColor) return false;
    return true;
  }, [isOutOfStock, hasVariants, selectedVariant, requiresSize, selectedSize, requiresColor, selectedColor]);

  // Get product images
  const productImages = useMemo(() => {
    return getCurrentImages();
  }, [getCurrentImages]);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = productImages.map((img, index) => {
        return new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            setAllImagesLoaded(prev => ({ ...prev, [index]: true }));
            resolve();
          };
          image.onerror = () => {
            setAllImagesLoaded(prev => ({ ...prev, [index]: true }));
            resolve();
          };
          image.src = img;
        });
      });
      
      await Promise.all(imagePromises);
    };

    if (productImages.length > 0) {
      loadImages();
    }
  }, [productImages]);

  // Update UI when product changes
  useEffect(() => {
    setMainImageIndex(0);
    setQuantity(1);
    setButtonText('ADD TO CART');
    setIsAnimating(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setImageLoaded(false);
    setAllImagesLoaded({});
    
    if (hasVariants && product?.variants?.options?.length > 0) {
      setSelectedVariant(product.variants.options[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product, hasVariants]);

  // Add to cart handler
  const handleAddToCartClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAnimating || !canPurchase || !product) return;

    setIsAnimating(true);
    
    const cartItem = {
      ...product, 
      size: selectedSize,
      color: selectedColor,
      variant: selectedVariant,
      displayName: hasVariants && selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
      displayPrice: getCurrentPrice(),
      finalPrice: getCurrentPrice()
    };
    
    onAddToCart(cartItem, quantity);

    setButtonText('ADDED! ✔');

    const timer = setTimeout(() => {
      setButtonText('ADD TO CART');
      setIsAnimating(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAnimating, canPurchase, product, selectedSize, selectedColor, selectedVariant, hasVariants, getCurrentPrice, onAddToCart, quantity]);

  // Buy Now handler
  const handleBuyNowClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAnimating || !canPurchase || !product) return;

    setIsAnimating(true);

    const checkoutItem = {
      ...product,
      id: `${product.id}-direct-${Date.now()}`,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      variant: selectedVariant,
      displayName: hasVariants && selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
      displayPrice: getCurrentPrice(),
      finalPrice: getCurrentPrice(),
      isDirectPurchase: true,
      imageUrl: productImages[0] || product.imageUrl
    };

    navigate('/checkout', { 
      state: { 
        directPurchase: true,
        product: checkoutItem,
        quantity: quantity,
        timestamp: Date.now()
      }
    });

    setTimeout(() => setIsAnimating(false), 1000);
  }, [isAnimating, canPurchase, product, quantity, selectedSize, selectedColor, selectedVariant, hasVariants, getCurrentPrice, navigate, productImages]);

  // Quantity handler
  const handleQuantityChange = useCallback((newQuantity) => {
    setQuantity(newQuantity);
  }, []);

  // Size selection handler
  const handleSizeSelect = useCallback((size) => {
    setSelectedSize(size);
  }, []);

  // Color selection handler
  const handleColorSelect = useCallback((color) => {
    setSelectedColor(color);
  }, []);

  // Variant selection handler
  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);
    setMainImageIndex(0);
    setImageLoaded(false);
    setAllImagesLoaded({});
    // Reset size when variant changes
    setSelectedSize(null);
  }, []);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    return formatCurrency(getCurrentPrice() * quantity);
  }, [getCurrentPrice, quantity, formatCurrency]);

  // Calculate related products
  const relatedProducts = useMemo(() => {
    if (!products || !product) return [];
    return products
      .filter(item => item.id !== product.id && item.category === product.category)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [products, product]);

  // Handle main image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle thumbnail image load
  const handleThumbnailLoad = (index) => {
    setAllImagesLoaded(prev => ({ ...prev, [index]: true }));
  };

  // Handle missing product
  if (!product) {
    return (
      <div className="luxury-product-detail-page">
        <div className="luxury-not-found-container">
          <div className="luxury-not-found-content">
            <div className="luxury-not-found-icon">✕</div>
            <h2 className="luxury-not-found-title">PRODUCT NOT FOUND</h2>
            <p className="luxury-not-found-description">
              The product you are looking for is no longer available
            </p>
            <button
              onClick={() => navigate('/products')}
              className="luxury-back-button"
            >
              BACK TO PRODUCTS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="luxury-product-detail-page">
      {/* Background Effects */}
      <div className="luxury-page-background">
        <div className="luxury-glow-1"></div>
        <div className="luxury-glow-2"></div>
      </div>

      <div className="luxury-page-container">
        <div className="luxury-content-wrapper">
          {/* Back Button */}
          <button
            onClick={() => navigate('/products')}
            className="luxury-back-nav-button"
          >
            <LuArrowLeft className="luxury-back-icon" />
            <span className="luxury-back-text">BACK TO COLLECTION</span>
            <div className="luxury-button-glow"></div>
          </button>
          
          {/* Main Product Section */}
          <div className="luxury-main-content">
            <div className="luxury-product-grid">
              
              {/* Image Gallery */}
              <div className="luxury-gallery-container">
                <div className="luxury-main-image-container">
                  <div className="luxury-glow-outer"></div>
                  <div className="luxury-glow-inner"></div>
                  <div className="luxury-card-border">
                    <div className="luxury-metallic-edge"></div>
                  </div>

                  <div className="luxury-image-content">
                    <div className="luxury-image-wrapper">
                      {!imageLoaded && (
                        <div className="luxury-image-loading">
                          <div className="luxury-loading-spinner"></div>
                        </div>
                      )}
                      
                      <img
                        src={productImages[mainImageIndex]}
                        alt={`${product.name} - ${mainImageIndex + 1}`}
                        loading="eager"
                        className={`luxury-product-main-image ${imageLoaded ? 'luxury-image-loaded' : ''}`}
                        onLoad={handleImageLoad}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/600x600/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`;
                          setImageLoaded(true);
                        }}
                      />
                    </div>

                    {/* Navigation Arrows */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          className="luxury-nav-arrow luxury-nav-prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMainImageIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
                            setImageLoaded(false);
                          }}
                        >
                          <FiChevronLeft className="luxury-arrow-icon" />
                        </button>
                        <button
                          className="luxury-nav-arrow luxury-nav-next"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMainImageIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
                            setImageLoaded(false);
                          }}
                        >
                          <FiChevronRight className="luxury-arrow-icon" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {productImages.length > 1 && (
                      <div className="luxury-image-counter">
                        {mainImageIndex + 1} / {productImages.length}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {productImages.length > 1 && (
                  <div className="luxury-thumbnail-gallery">
                    {productImages.map((img, index) => (
                      <button
                        key={index}
                        className={`luxury-thumbnail ${index === mainImageIndex ? 'luxury-thumbnail-active' : ''}`}
                        onClick={() => {
                          setMainImageIndex(index);
                          setImageLoaded(false);
                        }}
                      >
                        {!allImagesLoaded[index] && (
                          <div className="luxury-thumbnail-loading"></div>
                        )}
                        <img
                          src={img}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          loading="lazy"
                          className="luxury-thumbnail-image"
                          onLoad={() => handleThumbnailLoad(index)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/100x100/1a1a1a/ffffff?text=Image${index + 1}`;
                            handleThumbnailLoad(index);
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="luxury-details-container">
                {/* Product Header */}
                <div className="luxury-product-header">
                  <h1 className="luxury-product-title">
                    {hasVariants && selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name}
                  </h1>
                  <div className="luxury-title-underline"></div>
                </div>

                {/* Price Section */}
                <div className="luxury-price-section">
                  <p className="luxury-product-price">
                    {formatCurrency(getCurrentPrice())}
                  </p>
                  <div className={`luxury-stock-badge ${isOutOfStock ? 'luxury-stock-out' : 'luxury-stock-in'}`}>
                    <span className="luxury-stock-dot"></span>
                    {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                  </div>
                </div>

                {/* Premium Badge */}
                <div className="luxury-premium-badge">
                  <span>PREMIUM COLLECTION</span>
                </div>

                {/* Variant Selector */}
                {hasVariants && (
                  <div className="luxury-variant-section">
                    <h3 className="luxury-section-title">
                      SELECT {product.variants?.type?.toUpperCase() || 'VARIANT'}
                    </h3>
                    <div className="luxury-variants-grid">
                      {product.variants.options.map((variant) => (
                        <button
                          key={variant.id}
                          className={`luxury-variant-button ${selectedVariant?.id === variant.id ? 'luxury-variant-active' : ''}`}
                          onClick={() => handleVariantSelect(variant)}
                          disabled={isOutOfStock}
                        >
                          <div className="luxury-variant-image">
                            <img
                              src={variant.image}
                              alt={variant.name}
                              className="luxury-variant-img"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/100x100/1a1a1a/ffffff?text=${encodeURIComponent(variant.name)}`;
                              }}
                            />
                          </div>
                          <span className="luxury-variant-name">{variant.name}</span>
                          <span className="luxury-variant-price">{formatCurrency(variant.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {requiresSize && (
                  <div className="luxury-size-section">
                    <h3 className="luxury-section-title">SELECT SIZE</h3>
                    <div className="luxury-sizes-grid">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          className={`luxury-size-button ${selectedSize === size ? 'luxury-size-active' : ''}`}
                          onClick={() => handleSizeSelect(size)}
                          disabled={isOutOfStock}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {requiresColor && (
                  <div className="luxury-color-section">
                    <h3 className="luxury-section-title">SELECT COLOR</h3>
                    <div className="luxury-colors-grid">
                      {(product.id === '000' ? ['Black', 'Brown', 'Pink'] : ['Black', 'Clear']).map((color) => (
                        <button
                          key={color}
                          className={`luxury-color-button ${selectedColor === color ? 'luxury-color-active' : ''}`}
                          onClick={() => handleColorSelect(color)}
                          disabled={isOutOfStock}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Description */}
                <div className="luxury-description-section">
                  <p className="luxury-product-description">
                    {product.description}
                  </p>
                </div>

                {/* Quantity & Total */}
                <div className="luxury-quantity-section">
                  <div className="luxury-quantity-controls">
                    <span className="luxury-quantity-label">QUANTITY:</span>
                    <QuantitySelector
                      quantity={quantity}
                      onQuantityChange={handleQuantityChange}
                      stock={product.stock}
                      disabled={isOutOfStock}
                    />
                  </div>
                  <div className="luxury-total-price">
                    TOTAL: <span className="luxury-total-amount">{calculateTotalPrice()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="luxury-action-buttons">
                  <button
                    onClick={handleAddToCartClick}
                    disabled={isAnimating || !canPurchase}
                    className={`luxury-cart-button ${isAnimating ? 'luxury-button-animating' : ''} ${!canPurchase ? 'luxury-button-disabled' : ''}`}
                  >
                    <span className="luxury-button-text">
                      {isAnimating ? (
                        <>
                          <div className="luxury-loading-spinner-small"></div>
                          ADDING...
                        </>
                      ) : (
                        isOutOfStock ? 'OUT OF STOCK' : buttonText
                      )}
                    </span>
                    <div className="luxury-button-glow"></div>
                  </button>

                  <button
                    onClick={handleBuyNowClick}
                    disabled={isAnimating || !canPurchase}
                    className={`luxury-buy-button ${isAnimating ? 'luxury-button-animating' : ''} ${!canPurchase ? 'luxury-button-disabled' : ''}`}
                  >
                    <span className="luxury-button-text">
                      {isAnimating ? (
                        <>
                          <div className="luxury-loading-spinner-small"></div>
                          PROCESSING...
                        </>
                      ) : (
                        isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW'
                      )}
                    </span>
                    <div className="luxury-button-glow"></div>
                  </button>
                </div>

                {/* Product Specifications */}
                <div className="luxury-specs-section">
                  <h3 className="luxury-section-title">PRODUCT SPECIFICATIONS</h3>
                  <div className="luxury-specs-grid">
                    {[
                      { label: 'MATERIAL', value: product.specifications?.material || 'PREMIUM MATERIALS' },
                      { label: 'DIMENSIONS', value: product.specifications?.dimensions || 'VARIOUS SIZES AVAILABLE' },
                      { label: 'WEIGHT', value: product.specifications?.weight || '0.3 KG' },
                      { label: 'WARRANTY', value: product.specifications?.warranty || '1 YEAR WARRANTY' }
                    ].map((spec, index) => (
                      <div key={index} className="luxury-spec-item">
                        <div className="luxury-spec-icon">✓</div>
                        <div className="luxury-spec-content">
                          <span className="luxury-spec-label">{spec.label}</span>
                          <span className="luxury-spec-value">{spec.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related Products */}
            <section className="luxury-related-section">
              <div className="luxury-related-header">
                <h2 className="luxury-related-title">YOU MIGHT ALSO LIKE</h2>
                <button
                  onClick={() => navigate('/products')}
                  className="luxury-view-all-button"
                >
                  VIEW ALL
                  <span className="luxury-view-arrow">→</span>
                </button>
              </div>

              {relatedProducts.length > 0 ? (
                <div className="luxury-related-grid">
                  {relatedProducts.map((relatedProduct, index) => (
                    <div 
                      key={relatedProduct.id}
                      className="luxury-related-item"
                    >
                      <ProductCard
                        product={relatedProduct}
                        onAddToCart={onAddToCart}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="luxury-empty-related">
                  <p className="luxury-empty-text">
                    NO OTHER PRODUCTS AVAILABLE IN THIS CATEGORY
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700,800,900&f[]=satoshi@400,500,600,700,800,900&display=swap');

        .luxury-product-detail-page {
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
          padding: 1rem;
        }

        .luxury-content-wrapper {
          padding-top: 5rem;
        }

        /* Back Button */
        .luxury-back-nav-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 12px;
          color: ${PremiumColors.PureWhite};
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          backdrop-filter: blur(10px);
          overflow: hidden;
          cursor: pointer;
          margin-bottom: 2rem;
          position: relative;
        }

        .luxury-back-nav-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: ${PremiumColors.ElectricBlueStart};
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 157, 255, 0.2);
        }

        .luxury-back-icon {
          width: 1rem;
          height: 1rem;
          transition: transform 0.3s ease;
        }

        .luxury-back-nav-button:hover .luxury-back-icon {
          transform: translateX(-3px);
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

        .luxury-back-nav-button:hover .luxury-button-glow {
          left: 100%;
        }

        /* Main Content */
        .luxury-main-content {
          margin-bottom: 3rem;
        }

        .luxury-product-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 4rem;
        }

        /* Image Gallery */
        .luxury-gallery-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .luxury-main-image-container {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 1;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }

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

        .luxury-image-content {
          position: relative;
          width: 100%;
          height: 100%;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 19px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 4;
        }

        .luxury-image-wrapper {
          position: relative;
          width: 85%;
          height: 85%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .luxury-product-main-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: opacity 0.3s ease;
          opacity: 0;
        }

        .luxury-image-loaded {
          opacity: 1;
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
          width: 40px;
          height: 40px;
          border: 3px solid ${PremiumColors.GlassBorder};
          border-top: 3px solid ${PremiumColors.ElectricBlueStart};
          border-radius: 50%;
          animation: luxurySpin 1s linear infinite;
        }

        @keyframes luxurySpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .luxury-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 50%;
          color: ${PremiumColors.PureWhite};
          padding: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
          z-index: 5;
          display: none;
        }

        .luxury-nav-arrow:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: ${PremiumColors.ElectricBlueStart};
        }

        .luxury-nav-prev {
          left: 1rem;
        }

        .luxury-nav-next {
          right: 1rem;
        }

        .luxury-arrow-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .luxury-image-counter {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          color: ${PremiumColors.PureWhite};
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid ${PremiumColors.GlassBorder};
        }

        /* Thumbnail Gallery */
        .luxury-thumbnail-gallery {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 100%;
          overflow-x: auto;
          padding: 0.5rem 0;
        }

        .luxury-thumbnail {
          width: 70px;
          height: 70px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid transparent;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }

        .luxury-thumbnail:hover {
          border-color: ${PremiumColors.GlassBorder};
        }

        .luxury-thumbnail-active {
          border-color: ${PremiumColors.ElectricBlueStart};
          box-shadow: 0 4px 15px rgba(0, 157, 255, 0.3);
        }

        .luxury-thumbnail-loading {
          position: absolute;
          inset: 0;
          background: rgba(26, 26, 26, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .luxury-thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Product Details */
        .luxury-details-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .luxury-product-header {
          margin-bottom: 0.5rem;
        }

        .luxury-product-title {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          color: ${PremiumColors.PureWhite};
          letter-spacing: 0.02em;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }

        .luxury-title-underline {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          border-radius: 2px;
        }

        .luxury-price-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .luxury-product-price {
          font-family: 'Clash Display', sans-serif;
          font-weight: 800;
          font-size: 1.75rem;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
        }

        .luxury-stock-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-family: 'Satoshi', sans-serif;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .luxury-stock-in {
          background: rgba(0, 157, 255, 0.15);
          color: ${PremiumColors.ElectricBlueStart};
          border: 1px solid rgba(0, 157, 255, 0.3);
        }

        .luxury-stock-out {
          background: rgba(255, 107, 107, 0.15);
          color: #ff6b6b;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .luxury-stock-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .luxury-stock-in .luxury-stock-dot {
          background: ${PremiumColors.ElectricBlueStart};
        }

        .luxury-stock-out .luxury-stock-dot {
          background: #ff6b6b;
        }

        .luxury-premium-badge {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          color: ${PremiumColors.PureWhite};
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        /* Sections */
        .luxury-section-title {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          color: ${PremiumColors.PureWhite};
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid ${PremiumColors.GlassBorder};
        }

        /* Variants */
        .luxury-variants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .luxury-variant-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 10px;
          color: ${PremiumColors.CoolGray};
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .luxury-variant-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: ${PremiumColors.ElectricBlueStart};
        }

        .luxury-variant-active {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}20, ${PremiumColors.ElectricBlueEnd}15);
          border-color: ${PremiumColors.ElectricBlueStart};
          color: ${PremiumColors.PureWhite};
          box-shadow: 0 4px 15px rgba(0, 157, 255, 0.2);
        }

        .luxury-variant-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
        }

        .luxury-variant-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .luxury-variant-name {
          font-family: 'Satoshi', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          text-align: center;
        }

        .luxury-variant-price {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.7rem;
          color: ${PremiumColors.ElectricBlueStart};
        }

        /* Sizes and Colors */
        .luxury-sizes-grid,
        .luxury-colors-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .luxury-size-button,
        .luxury-color-button {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 8px;
          color: ${PremiumColors.CoolGray};
          font-family: 'Satoshi', sans-serif;
          font-weight: 500;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          cursor: pointer;
          flex: 1;
          min-width: 60px;
          text-align: center;
        }

        .luxury-size-button:hover,
        .luxury-color-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: ${PremiumColors.ElectricBlueStart};
        }

        .luxury-size-active,
        .luxury-color-active {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}20, ${PremiumColors.ElectricBlueEnd}15);
          border-color: ${PremiumColors.ElectricBlueStart};
          color: ${PremiumColors.PureWhite};
          box-shadow: 0 4px 15px rgba(0, 157, 255, 0.2);
        }

        /* Description */
        .luxury-product-description {
          font-family: 'Satoshi', sans-serif;
          font-weight: 400;
          font-size: 0.9rem;
          color: ${PremiumColors.CoolGray};
          line-height: 1.6;
          margin: 0;
        }

        /* Quantity Section */
        .luxury-quantity-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem 0;
          border-top: 1px solid ${PremiumColors.GlassBorder};
          border-bottom: 1px solid ${PremiumColors.GlassBorder};
        }

        .luxury-quantity-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .luxury-quantity-label {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          color: ${PremiumColors.PureWhite};
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .luxury-total-price {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          color: ${PremiumColors.PureWhite};
        }

        .luxury-total-amount {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.2rem;
        }

        /* Action Buttons */
        .luxury-action-buttons {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .luxury-cart-button,
        .luxury-buy-button {
          position: relative;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          overflow: hidden;
        }

        .luxury-cart-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${PremiumColors.GlassBorder};
          color: ${PremiumColors.PureWhite};
          backdrop-filter: blur(10px);
        }

        .luxury-cart-button:not(.luxury-button-disabled):not(.luxury-button-animating):hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: ${PremiumColors.ElectricBlueStart};
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 157, 255, 0.2);
        }

        .luxury-buy-button {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          color: ${PremiumColors.PureWhite};
          box-shadow: 0 4px 15px rgba(0, 157, 255, 0.3);
        }

        .luxury-buy-button:not(.luxury-button-disabled):not(.luxury-button-animating):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 157, 255, 0.4);
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

        .luxury-loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: luxurySpin 1s linear infinite;
        }

        /* Specifications */
        .luxury-specs-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .luxury-spec-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .luxury-spec-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: ${PremiumColors.ElectricBlueStart};
        }

        .luxury-spec-icon {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: ${PremiumColors.PureWhite};
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .luxury-spec-content {
          display: flex;
          flex-direction: column;
        }

        .luxury-spec-label {
          font-family: 'Satoshi', sans-serif;
          font-weight: 500;
          font-size: 0.7rem;
          color: ${PremiumColors.CoolGray};
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .luxury-spec-value {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          color: ${PremiumColors.PureWhite};
        }

        /* Related Products */
        .luxury-related-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid ${PremiumColors.GlassBorder};
        }

        .luxury-related-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .luxury-related-title {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: ${PremiumColors.PureWhite};
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0;
        }

        .luxury-view-all-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: ${PremiumColors.ElectricBlueStart};
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
          align-self: flex-start;
        }

        .luxury-view-all-button:hover {
          color: ${PremiumColors.ElectricBlueEnd};
          transform: translateX(5px);
        }

        .luxury-view-arrow {
          transition: transform 0.3s ease;
        }

        .luxury-view-all-button:hover .luxury-view-arrow {
          transform: translateX(3px);
        }

        .luxury-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .luxury-related-item {
          opacity: 1;
          transform: translateY(0);
        }

        .luxury-empty-related {
          text-align: center;
          padding: 3rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid ${PremiumColors.GlassBorder};
          border-radius: 20px;
          backdrop-filter: blur(20px);
        }

        .luxury-empty-text {
          font-family: 'Satoshi', sans-serif;
          font-weight: 400;
          font-size: 0.9rem;
          color: ${PremiumColors.CoolGray};
          margin: 0;
        }

        /* Not Found Styles */
        .luxury-not-found-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
        }

        .luxury-not-found-content {
          text-align: center;
          padding: 2rem;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid ${PremiumColors.GlassBorder};
          max-width: 400px;
          width: 100%;
        }

        .luxury-not-found-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          opacity: 0.7;
        }

        .luxury-not-found-title {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: ${PremiumColors.PureWhite};
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .luxury-not-found-description {
          font-family: 'Satoshi', sans-serif;
          font-weight: 400;
          font-size: 0.9rem;
          color: ${PremiumColors.CoolGray};
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .luxury-back-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          border: none;
          border-radius: 10px;
          color: ${PremiumColors.PureWhite};
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .luxury-back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 157, 255, 0.4);
        }

        /* Tablet Styles */
        @media (min-width: 768px) {
          .luxury-page-container {
            padding: 2rem;
          }

          .luxury-product-grid {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }

          .luxury-product-title {
            font-size: 2rem;
          }

          .luxury-product-price {
            font-size: 2rem;
          }

          .luxury-action-buttons {
            grid-template-columns: 1fr 1fr;
          }

          .luxury-related-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .luxury-specs-grid {
            grid-template-columns: 1fr 1fr;
          }

          .luxury-quantity-section {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .luxury-nav-arrow {
            display: flex;
          }
        }

        /* Desktop Styles */
        @media (min-width: 1024px) {
          .luxury-product-grid {
            gap: 4rem;
          }

          .luxury-product-title {
            font-size: 2.5rem;
          }

          .luxury-variants-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          }

          .luxury-size-button,
          .luxury-color-button {
            flex: none;
            min-width: 80px;
          }
        }

        /* Selection Styling */
        .luxury-product-detail-page ::selection {
          background: ${PremiumColors.ElectricBlueStart};
          color: ${PremiumColors.PureWhite};
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;