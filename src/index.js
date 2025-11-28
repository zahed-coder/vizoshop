import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

// Get the root DOM element where your React app will be mounted.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your React application.
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);