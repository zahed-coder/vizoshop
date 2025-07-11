import React, { createContext, useState } from 'react';

// Create the CartContext, which will be used by components to access cart state and functions.
export const CartContext = createContext();

/**
 * CartProvider component.
 * This component wraps its children to provide the cart state and actions.
 * It manages adding, removing, updating quantity, and selecting/deselecting cart items.
 *
 * @param {object} props - The component's properties.
 * @param {React.ReactNode} props.children - The child components that will consume the cart context.
 */
export const CartProvider = ({ children }) => {
  // State to hold the array of cart items. Each item includes product details, quantity, and selection status.
  // Example structure for a cart item: { id: 'prod1', name: 'Shorts', price: 100, imageUrl: '...', quantity: 2, isSelected: true }
  const [cartItems, setCartItems] = useState([]);

  /**
   * Adds a product to the cart or increments its quantity if it already exists.
   * New products are added with the specified quantity (or 1 by default) and marked as selected.
   *
   * @param {object} product - The product object to add. Should contain `id`, `name`, `price`, `imageUrl`, etc.
   * @param {number} [quantityToAdd=1] - The quantity of the product to add. Defaults to 1.
   */
  const addToCart = (product, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingItemIndex > -1) {
        // If item exists, create a new array with the updated item
        return prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantityToAdd, isSelected: true }
            : item
        );
      } else {
        // If new item, add it with its quantity and set as selected.
        return [...prevItems, { ...product, quantity: quantityToAdd, isSelected: true }];
      }
    });
  };

  /**
   * Removes a product entirely from the cart.
   * @param {string} productId - The unique ID of the product to remove.
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  /**
   * Updates the quantity of a specific product in the cart.
   * Ensures the quantity does not drop below 1.
   * @param {string} productId - The unique ID of the product to update.
   * @param {number} newQuantity - The new quantity for the product. Must be at least 1.
   */
  const updateQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  /**
   * Toggles the `isSelected` status of a single item in the cart.
   * Used for fine-grained control over which items go to checkout.
   * @param {string} productId - The unique ID of the item whose selection status to toggle.
   */
  const toggleItemSelected = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  /**
   * Sets the `isSelected` status for all items in the cart.
   * @param {boolean} select - `true` to select all items, `false` to deselect all items.
   */
  const toggleAllItemsSelected = (select) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => ({ ...item, isSelected: select }))
    );
  };

  /**
   * Clears all items from the cart. Typically called after a successful order.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // The context value provided to children.
  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleItemSelected,
    toggleAllItemsSelected,
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};