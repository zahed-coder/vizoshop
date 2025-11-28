import React, { useState, useCallback, useContext } from 'react';
import QuantitySelector from '../components/QuantitySelector';
import { CartContext } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * CartPage Component
 * This component displays the user's shopping cart, allowing them to review,
 * select/deselect, update quantities, and remove items. It provides a clear
 * summary of selected items and facilitates the transition to the checkout process.
 * The design emphasizes clarity, interactivity, and a premium feel.
 *
 * @param {object} props - The component's properties.
 * @param {function(string, any?): void} props.onNavigate - Callback function to handle page navigation.
 */
const CartPage = ({ onNavigate }) => {
  // --- Access Cart Context ---
  // Destructure cart state and actions from the global CartContext.
  const { cartItems, removeFromCart, updateQuantity, toggleItemSelected, toggleAllItemsSelected } = useContext(CartContext);

  const { t } = useLanguage();

  // --- Derived State/Calculations ---
  // Filter for items that are currently selected by the user for checkout.
  const selectedItems = cartItems.filter(item => item.isSelected);
  // Calculate the total count of all selected items (sum of quantities).
  const totalSelectedItems = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  // Calculate the total price of all selected items.
  const totalPriceSelected = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Determine if all items in the cart are currently selected.
  // This is used to control the "Select All" checkbox state.
  const allItemsAreSelected = cartItems.length > 0 && cartItems.every(item => item.isSelected);

  // --- Event Handlers ---

  /**
   * Handles the change event for an individual item's quantity.
   * Calls the `updateQuantity` function from CartContext.
   * @param {string} productId - The ID of the product whose quantity is being updated.
   * @param {number} newQuantity - The new quantity for the product.
   */
  const handleQuantityChange = useCallback((productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  }, [updateQuantity]);

  /**
   * Handles the click event for the "Remove" button of an individual cart item.
   * Calls the `removeFromCart` function from CartContext.
   * @param {string} productId - The ID of the product to be removed.
   */
  const handleRemoveItem = useCallback((productId) => {
    removeFromCart(productId);
  }, [removeFromCart]);

  /**
   * Handles the click event for the "Proceed to Checkout" button.
   * Navigates to the 'checkout' page, passing only the currently selected items.
   */
  const handleProceedToCheckout = useCallback(() => {
    // Only navigate if there are items selected.
    if (selectedItems.length > 0) {
      onNavigate('checkout', { selectedItems: selectedItems });
    }
  }, [selectedItems, onNavigate]);

  // =====================================================================
  // --- Render Sections for the Page ---
  // Encapsulating parts of the JSX into functions for readability and organization.
  // =====================================================================

  /**
   * Renders the header section for the cart page, including the title.
   */
  const renderPageHeader = () => (
    <h2 className="text-4xl md:text-5xl font-bold text-[#2b2b2b] mb-8 text-center drop-shadow-sm">
      {t('عربة التسوق الخاصة بك')} <span className="text-[#b3b3b3]">{t('المميزة')}</span>
    </h2>
  );

  /**
   * Renders the UI when the cart is empty.
   * Provides a friendly message and a button to encourage shopping.
   */
  const renderEmptyCartState = () => (
    <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-[#d4d4d4] animate-fade-in-down">
      <p className="text-2xl font-semibold text-[#b3b3b3] mb-6">
        {t('عربتك فارغة بعض الشيء.')}
      </p>
      <p className="text-lg text-[#4b5563] mb-8">
        {t('لماذا لا تستكشف مجموعاتنا الرائعة وتجد شيئًا تحبه؟')}
      </p>
      <button
        onClick={() => onNavigate('products')}
        className="bg-[#2b2b2b] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl
                   hover:bg-[#b3b3b3] hover:shadow-2xl transition-all duration-300 transform hover:scale-105
                   focus:outline-none focus:ring-4 focus:ring-[#d4d4d4]"
        aria-label={t('ابدأ التسوق الآن')}
      >
        {t('ابدأ التسوق الآن')}
      </button>
    </div>
  );

  /**
   * Renders the cart summary and "Select All" checkbox.
   * This section floats at the top of the cart items list.
   */
  const renderCartSummaryAndControls = () => (
    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between p-4 bg-offWhite rounded-lg shadow-md border border-lightGrey animate-fade-in-down sticky top-20 z-10 backdrop-blur-sm bg-opacity-80">
      {/* "Select All" Checkbox */}
      <label className="flex items-center space-x-3 text-lg font-medium text-[#2b2b2b] cursor-pointer mb-4 sm:mb-0">
        <input
          type="checkbox"
          className="form-checkbox h-6 w-6 text-darkGrey rounded border-mediumGrey focus:ring-2 focus:ring-darkGrey transition-colors duration-200 cursor-pointer"
          checked={allItemsAreSelected}
          onChange={(e) => toggleAllItemsSelected(e.target.checked)}
          aria-label={t('تحديد جميع العناصر في السلة')}
        />
        <span>{t('تحديد جميع العناصر')}</span>
      </label>
      {/* Total Price for Selected Items */}
      <span className="text-xl font-bold text-[#2b2b2b] animate-pulse-price">
        {t('الإجمالي')} ({totalSelectedItems} {t('عناصر')}):{' '}
        <span className="text-[#b3b3b3] drop-shadow-sm">${totalPriceSelected.toFixed(2)}</span>
      </span>
    </div>
  );

  /**
   * Renders an individual cart item card.
   * @param {object} item - The cart item object to render.
   */
  const renderCartItemCard = (item) => (
    <div
      key={item.id}
      className={`
        flex flex-col md:flex-row items-center bg-white p-4 rounded-lg shadow-md
        border border-[#f0f0f0] transition-all duration-300 transform
        hover:scale-[1.01] hover:shadow-lg
        ${item.isSelected ? 'border-[#b3b3b3] ring-2 ring-[#d4d4d4] scale-[1.005] shadow-lg' : ''}
        animate-fade-in-up
      `}
    >
      {/* Individual Item Selection Checkbox */}
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-darkGrey rounded border-mediumGrey focus:ring-2 focus:ring-darkGrey transition-colors duration-200 cursor-pointer mb-4 md:mb-0 md:mr-4"
        checked={item.isSelected}
        onChange={() => toggleItemSelected(item.id)}
        aria-label={`${t('تحديد')} ${item.name}`}
      />
      {/* Product Image */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-md mr-4 border border-[#d4d4d4] shadow-sm flex-shrink-0"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/96x96/b3b3b3/FFFFFF?text=${t('عنصر')}`; }}
      />
      {/* Product Name and Price Details */}
      <div className="flex-grow text-center md:text-left mt-4 md:mt-0">
        <h3 className="text-xl font-semibold text-[#2b2b2b] line-clamp-1 mb-1">
          {item.name}
        </h3>
        <p className="text-lg text-[#b3b3b3] font-medium">${item.price.toFixed(2)}</p>
      </div>
      {/* Quantity Selector and Remove Button */}
      <div className="flex items-center space-x-4 mt-4 md:mt-0 md:ml-auto flex-shrink-0">
        <QuantitySelector
          quantity={item.quantity}
          onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
        />
        <button
          onClick={() => handleRemoveItem(item.id)}
          className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md
                     hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 transform hover:scale-105 active:scale-95"
          aria-label={`${t('إزالة')} ${item.name} ${t('من السلة')}`}
        >
          {t('إزالة')}
        </button>
      </div>
    </div>
  );

  /**
   * Renders the "Proceed to Checkout" button.
   * It's disabled if no items are selected.
   */
  const renderProceedToCheckoutButton = () => (
    <div className="mt-10 text-center animate-fade-in-up">
      <button
        onClick={handleProceedToCheckout}
        className="bg-[#2b2b2b] text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl
                   hover:bg-[#b3b3b3] hover:shadow-2xl transition-all duration-300
                   transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#d4d4d4]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
        disabled={selectedItems.length === 0}
        aria-label={t('المتابعة إلى الدفع')}
      >
        {t('المتابعة إلى الدفع')} ({totalSelectedItems} {t('عناصر')})
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg m-4 md:m-8 w-full max-w-5xl border border-[#d4d4d4] animate-fade-in">
      {renderPageHeader()}

      {cartItems.length === 0 ? (
        renderEmptyCartState()
      ) : (
        <>
          {renderCartSummaryAndControls()}
          <div className="space-y-6 mt-6">
            {cartItems.map((item) => renderCartItemCard(item))}
          </div>
          {renderProceedToCheckoutButton()}
        </>
      )}
    </div>
  );
};

export default CartPage;