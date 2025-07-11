import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from '../assets/images/services/logo.png';

// Updated color palette with subtle enhancements
const VizoColors = {
  PrimaryDarkBlur: '#1A2A3A',       // Slightly darker for better contrast
  AccentOrange: '#E66B3B',
  LightText: '#FFFFFF',
  NeutralBlue: '#6A8DAD',
  OffWhiteBody: '#F9F9F9',
  SoftHighlight: '#A0AEC0',         // Softer highlight
  GradientPurple: '#9D50BB',        // New purple for gradient
  GradientYellow: '#F2D50F'         // New yellow for gradient
};

const Header = ({ onNavigate, isAdmin, currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems } = useContext(CartContext);
  const { lang, setLang, t } = useLanguage();
  const totalItemsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const handleMobileNavigate = (page) => {
    toggleMobileMenu();
    onNavigate(page);
  };

  const handleLanguageChange = (e) => {
    setLang(e.target.value);
  };

  return (
    <>
      {/* Enhanced Blurred Header with scroll effect */}
      <header className={`w-full z-50 fixed top-0 transition-all duration-300 ease-in-out ${isScrolled ? 'shadow-xl py-2' : 'py-3'}`}
              style={{
                backgroundColor: `rgba(26, 42, 58, ${isScrolled ? 0.95 : 0.85})`, // Adjust opacity on scroll
                backdropFilter: 'blur(16px)', // Increased blur
                WebkitBackdropFilter: 'blur(16px)', // For Safari support
                borderBottom: `1px solid rgba(160, 174, 192, 0.2)`
              }}>
        <div className="container mx-auto px-4 flex justify-between items-center h-20"> {/* Increased height for bigger logo */}
          {/* Logo with continuously animated gradient line */}
          <div className="flex items-center">
            <div 
              className="cursor-pointer flex flex-col items-center group relative logo-container" // Added class for animation
              onClick={() => onNavigate('home')}
            >
              <img 
                src={Logo} 
                alt="VIZO Logo" 
                className="h-16 transition-all duration-300 group-hover:opacity-95" // Made logo bigger
              />
              <div 
                className="absolute bottom-0 w-full h-0.5 animate-gradient-line" // Applied animation class
                style={{ 
                  background: `linear-gradient(90deg, ${VizoColors.GradientPurple}, ${VizoColors.GradientYellow})`,
                }}
              ></div>
            </div>
          </div>

          {/* Desktop Navigation - Simplified */}
          <nav className="hidden md:flex items-center space-x-8 font-outfit">
            <NavButton 
              onClick={() => onNavigate('home')}
              text={t('home')}
            />
            
            <NavButton 
              onClick={() => onNavigate('products')}
              text={t('products')}
            />
            
            {isAdmin && (
              <NavButton 
                onClick={() => onNavigate('admin')}
                text={t('admin')}
              />
            )}
            
            {/* Modern Language Selector */}
            <div className="relative group">
              <div className="flex items-center space-x-1 cursor-pointer px-2 py-1 rounded-lg transition-colors duration-200 hover:bg-white/10">
                <span className="text-white text-sm">{lang.toUpperCase()}</span>
                <svg className="w-4 h-4 text-white transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <div className="absolute top-full right-0 mt-2 w-28 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:pointer-events-auto transform group-hover:translate-y-0 translate-y-1">
                <select
                  className="w-full bg-transparent text-gray-800 py-2 px-3 cursor-pointer focus:outline-none"
                  value={lang}
                  onChange={handleLanguageChange}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
            
            {/* User Section */}
            <div className="flex items-center space-x-6">
              {currentUser && currentUser.isAnonymous === false ? (
                <button
                  className="text-white hover:text-orange-300 transition-colors duration-200 relative"
                  onClick={onLogout}
                  title={t('logout')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H9" />
                  </svg>
                </button>
              ) : (
                <button
                  className="text-white hover:text-orange-300 transition-colors duration-200"
                  onClick={() => onNavigate('login')}
                  title={t('login')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              
              {/* Cart Button with Visible Badge */}
              <button
                className="relative flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 cart-button"
                onClick={() => onNavigate('cart')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <span className="font-outfit">{t('cart')}</span>
                {totalItemsInCart > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center font-outfit shadow-md border border-orange-200">
                    {totalItemsInCart}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white z-30"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-0 bg-[${VizoColors.PrimaryDarkBlur}] z-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out font-outfit ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="space-y-8 text-center">
          <MobileNavButton 
            onClick={() => handleMobileNavigate('home')}
            text={t('home')}
          />
          <MobileNavButton 
            onClick={() => handleMobileNavigate('products')}
            text={t('products')}
          />
          
          {isAdmin && (
            <MobileNavButton 
              onClick={() => handleMobileNavigate('admin')}
              text={t('admin')}
            />
          )}
          
          {currentUser && currentUser.isAnonymous === false ? (
            <MobileNavButton 
              onClick={() => { onLogout(); handleMobileNavigate('home'); }}
              text={t('logout')}
            />
          ) : (
            <MobileNavButton 
              onClick={() => handleMobileNavigate('login')}
              text={t('login')}
            />
          )}
          
          <button
            className="flex items-center justify-center mx-auto space-x-3 text-2xl font-medium text-white py-3 transition-colors hover:text-orange-300"
            onClick={() => handleMobileNavigate('cart')}
          >
            <span>{t('cart')}</span>
            {totalItemsInCart > 0 && (
              <span className="bg-orange-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
                {totalItemsInCart}
              </span>
            )}
          </button>
          
          <div className="pt-8">
            <select
              className="bg-white/20 text-white py-2 px-4 rounded-lg border border-white/20 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
              value={lang}
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: ${VizoColors.OffWhiteBody};
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        .container {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Custom select arrow for dark background */
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        
        /* Smooth transitions for all interactive elements */
        button, select, .nav-button {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        
        /* Subtle glow effect on cart button hover */
        .cart-button:hover {
          box-shadow: 0 5px 15px rgba(230, 107, 59, 0.4);
          transform: translateY(-2px);
        }

        /* Keyframe animation for the gradient line under the logo */
        @keyframes gradient-move {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-gradient-line {
          animation: gradient-move 3s linear infinite; /* Adjust duration for desired speed */
        }
      `}</style>
    </>
  );
};

// Reusable NavButton Component for Desktop
const NavButton = ({ onClick, text }) => (
  <button
    onClick={onClick}
    className="relative py-1 px-2 overflow-hidden group nav-button"
  >
    <span className="text-lg font-medium text-white relative z-10 transition-colors duration-300 group-hover:text-orange-300">
      {text}
    </span>
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
  </button>
);

// Mobile NavButton Component
const MobileNavButton = ({ onClick, text }) => (
  <button
    onClick={onClick}
    className="text-2xl font-medium text-white py-3 transition-colors duration-300 hover:text-orange-300 relative"
  >
    {text}
    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-yellow-400 transition-all duration-500 group-hover:w-full transform -translate-x-1/2"></div>
  </button>
);

export default Header;