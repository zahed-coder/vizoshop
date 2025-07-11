import React, { useState, useCallback } from 'react';

// Re-using the Header's VizoColors for consistency
const VizoColors = {
  PrimaryDarkBlur: '#1A2A3A',       // Main background for header/dark elements
  AccentOrange: '#E66B3B',          // Primary accent color
  LightText: '#FFFFFF',              // Text on dark backgrounds
  DarkText: '#333333',               // Text on light backgrounds (for card content)
  NeutralBlue: '#6A8DAD',            // Subtle accents, icons
  OffWhiteBody: '#F9F9F9',           // Background for the main body/card itself
  SoftHighlight: '#BBBDBC',          // Subtle borders, focus rings
  GradientPurple: '#9D50BB',        // For specific gradients
  GradientYellow: '#F2D50F'         // For specific gradients
};

/**
 * ProductCard Component
 * Displays a single product in a visually appealing card format. It shows
 * the product image, name, price, and provides options to view details
 * or directly add the product to the cart. The design incorporates modern
 * aesthetics with subtle shadows, smooth transitions, and consistent colors
 * from the header.
 *
 * @param {object} props - The component's properties.
 * @param {object} props.product - The product object to display (must include id, name, price, imageUrl, description, stock).
 * @param {function(object, number): void} props.onAddToCart - Callback function to add this product to the cart.
 * It expects the product object and quantity.
 * @param {function(string, any?): void} props.onNavigate - Callback function to navigate to the product detail page.
 * @param {string} [props.currencySymbol='DZD'] - The symbol for the currency (e.g., 'DZD', '$'). Defaults to 'DZD'.
 */
const ProductCard = ({ product, onAddToCart, onNavigate, currencySymbol = 'DZD' }) => {
  const [buttonText, setButtonText] = useState('Add to Cart');
  const [isAnimating, setIsAnimating] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCartClick = useCallback((e) => {
    e.stopPropagation();

    if (isAnimating || isOutOfStock) return;

    setIsAnimating(true);
    onAddToCart(product, 1);

    setButtonText('Added! ✔');

    const timer = setTimeout(() => {
      setButtonText('Add to Cart');
      setIsAnimating(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAnimating, isOutOfStock, onAddToCart, product]);

  const handleCardClick = useCallback(() => {
    onNavigate('productDetail', product.id);
  }, [onNavigate, product.id]);

  return (
    <div
      className={`
        bg-[${VizoColors.OffWhiteBody}] rounded-xl shadow-lg overflow-hidden cursor-pointer
        transform hover:scale-103 hover:shadow-xl transition-all duration-300 ease-in-out
        border border-[${VizoColors.SoftHighlight}]/30 group flex flex-col font-outfit
      `}
      onClick={handleCardClick}
      style={{
        boxShadow: `0 4px 15px rgba(0,0,0,0.08)`, // Subtle default shadow
      }}
    >
      {/* Product Image Section */}
      <div 
        className="relative w-full h-56 md:h-64 overflow-hidden flex items-center justify-center p-2 rounded-t-xl"
        style={{ backgroundColor: VizoColors.LightGrey || '#F8F8F8' }} // Fallback if LightGrey is not in header's colors
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/400x300/${VizoColors.SoftHighlight.substring(1)}/${VizoColors.DarkText.substring(1)}?text=${product.name.replace(/\s/g, '+')}`; }}
        />
        {/* Subtle dark overlay on image hover for visual depth */}
        <div 
          className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-grow items-start justify-between">
        <div>
          {/* Product Name */}
          <h3 className={`text-xl font-semibold text-[${VizoColors.PrimaryDarkBlur}] mb-2 line-clamp-2`}>
            {product.name}
          </h3>
          {/* Product Description (Truncated) */}
          <p className={`text-[${VizoColors.NeutralBlue}] text-sm mb-3 line-clamp-3`}>
            {product.description}
          </p>
        </div>

        {/* Price and Stock Info */}
        <div className="w-full flex justify-between items-baseline mt-auto pt-3">
          <p className={`text-2xl font-bold text-[${VizoColors.AccentOrange}]`}>
            {product.price.toFixed(2)} {currencySymbol}
          </p>
          {isOutOfStock ? (
            <span className={`text-sm font-medium text-[${VizoColors.AccentOrange}] px-3 py-1 rounded-full bg-[${VizoColors.AccentOrange}]/10`}>
              Out of Stock
            </span>
          ) : (
            <span className={`text-sm font-medium text-[${VizoColors.PrimaryDarkBlur}] px-3 py-1 rounded-full bg-[${VizoColors.PrimaryDarkBlur}]/10`}>
              In Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCartClick}
          className={`
            mt-4 w-full px-6 py-3 rounded-full text-lg font-semibold
            transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[${VizoColors.AccentOrange}]/50
            ${isAnimating 
                ? `bg-[${VizoColors.SoftHighlight}] text-[${VizoColors.PrimaryDarkBlur}] cursor-not-allowed` 
                : isOutOfStock 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : `bg-[${VizoColors.PrimaryDarkBlur}] text-[${VizoColors.LightText}] hover:bg-[${VizoColors.NeutralBlue}]` // Changed hover to NeutralBlue
            }
          `}
          disabled={isAnimating || isOutOfStock}
          aria-label={`Add ${product.name} to cart`}
        >
          {isOutOfStock ? 'Out of Stock' : buttonText}
        </button>
      </div>

      {/* Global Styles for Font (if not already in main CSS) */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;