import React, { useCallback } from 'react'; // Only React and useCallback needed for a functional component with memoized handlers

/**
 * QuantitySelector Component
 * A reusable UI component for incrementing or decrementing a product's quantity.
 * It visually displays the current quantity and ensures the quantity cannot go below 1.
 * Designed with a clean, circular aesthetic and subtle hover effects.
 *
 * @param {object} props - The component's properties.
 * @param {number} props.quantity - The current quantity value.
 * @param {function(number): void} props.onQuantityChange - Callback function to notify the parent of a quantity change.
 */
const QuantitySelector = ({ quantity, onQuantityChange }) => {
  /**
   * Handles the decrement button click.
   * Decreases the quantity by 1, but ensures it never drops below 1.
   * Uses useCallback for memoization, as `onQuantityChange` and `quantity` are dependencies.
   */
  const handleDecrement = useCallback(() => {
    onQuantityChange(Math.max(1, quantity - 1));
  }, [onQuantityChange, quantity]);

  /**
   * Handles the increment button click.
   * Increases the quantity by 1.
   * Uses useCallback for memoization, as `onQuantityChange` and `quantity` are dependencies.
   */
  const handleIncrement = useCallback(() => {
    onQuantityChange(quantity + 1);
  }, [onQuantityChange, quantity]);

  return (
    <div className="flex items-center space-x-2 bg-offWhite rounded-full border border-lightGrey p-1 shadow-inner-md">
      {/* Decrement Button */}
      <button
        onClick={handleDecrement}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lightGrey text-darkGrey font-bold text-lg
                   hover:bg-mediumGrey transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-darkGrey focus:ring-opacity-75
                   transform hover:scale-105 active:scale-95 shadow-md"
        aria-label="Decrease quantity"
      >
        -
      </button>

      {/* Current Quantity Display */}
      <span className="text-xl font-semibold text-darkGrey min-w-[2rem] text-center select-none">
        {quantity}
      </span>

      {/* Increment Button */}
      <button
        onClick={handleIncrement}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lightGrey text-darkGrey font-bold text-lg
                   hover:bg-mediumGrey transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-darkGrey focus:ring-opacity-75
                   transform hover:scale-105 active:scale-95 shadow-md"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;