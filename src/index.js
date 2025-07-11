import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18+
import App from './App';
import './App.css';
// Import CartContext
import { CartProvider } from './context/CartContext';
// Import LanguageProvider
import { LanguageProvider } from './context/LanguageContext';

// Get the root DOM element where your React app will be mounted.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your React application.
root.render(
  // React.StrictMode helps identify potential problems in an application.
  <React.StrictMode>
    {/* Wrap the entire <App /> component with <LanguageProvider> */}
    <LanguageProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </LanguageProvider>
  </React.StrictMode>
);

// If you're using web-vitals, you might have this. Keep it if it was there originally.
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();