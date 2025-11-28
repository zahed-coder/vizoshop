import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import Logo from '../assets/images/services/logo.png';

// Enhanced Premium Luxury Color Palette
const PremiumColors = {
  DeepMatteBlack: '#000000',
  PureWhite: '#FFFFFF',
  ElectricBlueStart: '#009DFF',
  ElectricBlueEnd: '#00FFE0',
  TextHover: 'rgba(255, 255, 255, 0.7)',
  LogoGlowBase: 'rgba(255, 255, 255, 0.25)',
  LogoGlowHover: 'rgba(255, 255, 255, 0.35)',
  BlueGlowIntense: 'rgba(0, 157, 255, 0.4)',
  AmbientMist: 'rgba(0, 157, 255, 0.05)'
};

const Header = ({ onNavigate, isAdmin, currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems } = useContext(CartContext);
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

  return (
    <>
      {/* Premium Luxury Header */}
      <header 
        className={`w-full z-50 fixed top-0 transition-all duration-500 ease-out ${
          isScrolled ? 'py-2 md:py-3' : 'py-3 md:py-4'
        }`}
        style={{
          backgroundColor: PremiumColors.DeepMatteBlack,
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          fontFamily: "'Outfit', 'Satoshi', 'Neue Montreal', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        {/* Enhanced Ambient Background Mist */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${PremiumColors.AmbientMist}, transparent 70%)`,
            opacity: 0.6
          }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center h-16 md:h-20 lg:h-24 relative z-10">
          
          {/* Left Navigation - Hidden on mobile */}
          <div className="flex-1 hidden lg:flex justify-end items-center">
            <div className="flex items-center gap-8 md:gap-12 lg:gap-[4.5rem]"> 
              <LuxuryNavButton
                onClick={() => onNavigate('home')}
                text="HOME"
              />
              <LuxuryNavButton
                onClick={() => onNavigate('products')}
                text="SHOP"
              />
              <LuxuryNavButton
                onClick={() => onNavigate('collections')}
                text="COLLECTIONS"
              />
            </div>
          </div>

          {/* Centered Logo - Responsive sizing */}
          <div className="flex-shrink-0 mx-4 sm:mx-8 md:mx-12 lg:mx-20">
            <div
              className="cursor-pointer flex items-center justify-center luxury-logo-container"
              onClick={() => onNavigate('home')}
            >
              <div className="relative luxury-logo-float">
                {/* Primary Glow Layer - Animated */}
                <div 
                  className="absolute inset-0 luxury-logo-glow-base glowing-aura"
                  style={{
                    background: `radial-gradient(circle at center, ${PremiumColors.LogoGlowBase}, ${PremiumColors.BlueGlowIntense}40, transparent 60%)`,
                    filter: 'blur(20px) sm:blur(25px) lg:blur(30px)',
                    opacity: 0.9,
                    transform: 'scale(1.2) sm:scale(1.25) lg:scale(1.3)'
                  }}
                ></div>

                {/* Electric Blue Aura Layer */}
                <div 
                  className="absolute inset-0 luxury-logo-blue-aura glowing-aura-delayed"
                  style={{
                    background: `radial-gradient(circle at center, ${PremiumColors.ElectricBlueStart}50, ${PremiumColors.ElectricBlueEnd}30, transparent 70%)`,
                    filter: 'blur(25px) sm:blur(30px) lg:blur(35px)',
                    opacity: 0.7,
                    transform: 'scale(1.3) sm:scale(1.35) lg:scale(1.4)'
                  }}
                ></div>

                {/* Hover Glow Enhancement */}
                <div 
                  className="absolute inset-0 luxury-logo-glow-hover"
                  style={{
                    background: `radial-gradient(circle at center, ${PremiumColors.LogoGlowHover}, ${PremiumColors.BlueGlowIntense}60, transparent 50%)`,
                    filter: 'blur(30px) sm:blur(35px) lg:blur(40px)',
                    opacity: 0,
                    transform: 'scale(1.4) sm:scale(1.45) lg:scale(1.5)'
                  }}
                ></div>

                {/* Outer Glow Spread */}
                <div 
                  className="absolute inset-0 luxury-logo-glow-outer"
                  style={{
                    background: `radial-gradient(circle at center, ${PremiumColors.ElectricBlueStart}20, ${PremiumColors.ElectricBlueEnd}15, transparent 80%)`,
                    filter: 'blur(35px) sm:blur(40px) lg:blur(45px)',
                    opacity: 0.4,
                    transform: 'scale(1.6) sm:scale(1.7) lg:scale(1.8)'
                  }}
                ></div>
                
                {/* Main Logo - Responsive sizing */}
                <img
                  src={Logo}
                  alt="VIZO Luxury"
                  className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 transition-all duration-1000 luxury-logo-image relative z-30"
                  style={{
                    filter: 'brightness(1.2) contrast(1.15) saturate(1.1) drop-shadow(0 0 15px rgba(255,255,255,0.2)) sm:drop-shadow(0 0 20px rgba(255,255,255,0.3))'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Navigation - Hidden on mobile */}
          <div className="flex-1 hidden lg:flex justify-start items-center">
            <div className="flex items-center gap-8 md:gap-12 lg:gap-[4.5rem]">
              {isAdmin && (
                <LuxuryNavButton
                  onClick={() => onNavigate('admin')}
                  text="ADMIN"
                />
              )}
              
              <LuxuryNavButton
                onClick={() => onNavigate('contact')}
                text="CONTACT"
              />

              {/* Luxury Cart Button */}
              <button
                className="luxury-cart-button relative group"
                onClick={() => onNavigate('cart')}
              >
                <span className="luxury-cart-text">CART</span>
                {totalItemsInCart > 0 && (
                  <span className="luxury-cart-badge">
                    {totalItemsInCart}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button - Visible only on mobile */}
          <button
            className="lg:hidden text-white z-50 relative p-2 rounded-lg transition-all duration-300 hover:bg-white/5 luxury-mobile-menu-button"
            onClick={toggleMobileMenu}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>

          {/* Mobile Cart Button - Visible only on mobile */}
          <button
            className="lg:hidden relative luxury-mobile-cart-icon"
            onClick={() => onNavigate('cart')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {totalItemsInCart > 0 && (
              <span className="luxury-mobile-cart-badge">
                {totalItemsInCart}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center transition-all duration-500 ease-out lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        style={{
          backgroundColor: PremiumColors.DeepMatteBlack,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          fontFamily: "'Outfit', 'Satoshi', 'Neue Montreal', sans-serif"
        }}
      >
        {/* Ambient Electric Blue Mist */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${PremiumColors.ElectricBlueStart}25, transparent 50%),
                         radial-gradient(circle at 70% 20%, ${PremiumColors.ElectricBlueEnd}15, transparent 50%)`,
            filter: 'blur(60px)'
          }}
        ></div>

        <div className="relative space-y-8 sm:space-y-10 text-center px-6 z-10 w-full max-w-sm">
          <MobileNavButton
            onClick={() => handleMobileNavigate('home')}
            text="HOME"
          />
          <MobileNavButton
            onClick={() => handleMobileNavigate('products')}
            text="SHOP"
          />
          <MobileNavButton
            onClick={() => handleMobileNavigate('collections')}
            text="COLLECTIONS"
          />
          <MobileNavButton
            onClick={() => handleMobileNavigate('contact')}
            text="CONTACT"
          />

          {isAdmin && (
            <MobileNavButton
              onClick={() => handleMobileNavigate('admin')}
              text="ADMIN"
            />
          )}

          {currentUser && currentUser.isAnonymous === false ? (
            <MobileNavButton
              onClick={() => { onLogout(); handleMobileNavigate('home'); }}
              text="LOGOUT"
            />
          ) : (
            <MobileNavButton
              onClick={() => handleMobileNavigate('login')}
              text="LOGIN"
            />
          )}

          {/* Mobile Cart Full Button */}
          <button
            className="luxury-mobile-cart-full-button group"
            onClick={() => handleMobileNavigate('cart')}
          >
            <span className="luxury-mobile-cart-text">CART</span>
            {totalItemsInCart > 0 && (
              <span className="luxury-mobile-cart-full-badge">
                {totalItemsInCart}
              </span>
            )}
          </button>
        </div>

        {/* Close Button for Mobile */}
        <button
          className="absolute top-6 right-6 text-white p-2 rounded-lg transition-all duration-300 hover:bg-white/5"
          onClick={toggleMobileMenu}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Global Premium Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.cdnfonts.com/css/neue-montreal');

        .container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        /* Enhanced Logo Floating Animation */
        @keyframes luxuryFloat {
          0%, 100% {
            transform: translateY(-2px);
          }
          50% {
            transform: translateY(2px);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes glowPulseDelayed {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        .luxury-logo-float {
          animation: luxuryFloat 4s ease-in-out infinite;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .glowing-aura {
          animation: glowPulse 3s ease-in-out infinite;
        }

        .glowing-aura-delayed {
          animation: glowPulseDelayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        /* Enhanced Logo Glow Interactions */
        .luxury-logo-container:hover .luxury-logo-float {
          animation-duration: 3s;
        }

        .luxury-logo-container:hover .luxury-logo-glow-hover {
          opacity: 1;
          animation: glowPulse 2s ease-in-out infinite;
        }

        .luxury-logo-container:hover .luxury-logo-glow-base {
          opacity: 1;
        }

        .luxury-logo-container:hover .luxury-logo-blue-aura {
          opacity: 0.9;
        }

        .luxury-logo-container:hover .luxury-logo-glow-outer {
          opacity: 0.6;
        }

        .luxury-logo-container:hover .luxury-logo-image {
          filter: brightness(1.3) contrast(1.2) saturate(1.15) drop-shadow(0 0 25px rgba(255,255,255,0.3)) !important;
        }

        /* Premium Typography */
        .luxury-nav-text {
          font-family: 'Outfit', 'Satoshi', 'Neue Montreal', sans-serif;
          font-weight: 500;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: ${PremiumColors.PureWhite};
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Luxury Cart Button */
        .luxury-cart-button {
          display: flex;
          align-items: center;
          padding: 0.6rem 0;
          background: transparent;
          border: none;
          color: ${PremiumColors.PureWhite};
          position: relative;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .luxury-cart-button:hover {
          color: ${PremiumColors.TextHover};
          transform: translateY(-1px);
        }

        .luxury-cart-text {
          font-family: 'Outfit', 'Satoshi', 'Neue Montreal', sans-serif;
          font-weight: 500;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .luxury-cart-badge {
          position: absolute;
          top: -6px;
          right: -10px;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          color: ${PremiumColors.DeepMatteBlack};
          font-size: 0.65rem;
          font-weight: 600;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${PremiumColors.DeepMatteBlack};
          font-family: 'Outfit', sans-serif;
        }

        /* Mobile Cart Icon */
        .luxury-mobile-cart-icon {
          color: ${PremiumColors.PureWhite};
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease-out;
          margin-right: 0.5rem;
        }

        .luxury-mobile-cart-icon:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .luxury-mobile-cart-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          color: ${PremiumColors.DeepMatteBlack};
          font-size: 0.6rem;
          font-weight: 600;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${PremiumColors.DeepMatteBlack};
          font-family: 'Outfit', sans-serif;
        }

        /* Mobile Cart Full Button */
        .luxury-mobile-cart-full-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.2rem 2rem;
          border-radius: 12px;
          transition: all 0.5s ease-out;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          color: ${PremiumColors.PureWhite};
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: 1rem;
        }

        .luxury-mobile-cart-full-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(0, 157, 255, 0.4);
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(0, 157, 255, 0.2);
        }

        .luxury-mobile-cart-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .luxury-mobile-cart-full-badge {
          background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
          color: ${PremiumColors.DeepMatteBlack};
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${PremiumColors.DeepMatteBlack};
        }

        /* Mobile Menu Button */
        .luxury-mobile-menu-button {
          color: ${PremiumColors.PureWhite};
        }

        .luxury-mobile-menu-button:hover {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Enhanced smooth transitions */
        * {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </>
  );
};

// Premium Luxury NavButton Component
const LuxuryNavButton = ({ onClick, text }) => (
  <button
    onClick={onClick}
    className="relative py-2 px-1 overflow-hidden luxury-nav-button group"
    style={{
      background: 'transparent',
      border: 'none'
    }}
  >
    <span className="luxury-nav-text group-hover:opacity-70">
      {text}
    </span>
    
    {/* Elegant Gradient Underline */}
    <div 
      className="absolute bottom-0 left-0 w-full h-px transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"
      style={{
        background: `linear-gradient(90deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd})`,
        boxShadow: `0 0 12px rgba(0, 157, 255, 0.2)`
      }}
    ></div>

    {/* Subtle Background Glow on Hover */}
    <div 
      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"
      style={{
        background: `linear-gradient(135deg, rgba(0, 157, 255, 0.04), rgba(0, 255, 224, 0.02))`,
      }}
    ></div>
  </button>
);

// Mobile NavButton Component
const MobileNavButton = ({ onClick, text }) => (
  <button
    onClick={onClick}
    className="relative py-4 px-8 rounded-xl transition-all duration-500 luxury-mobile-nav group w-full"
    style={{
      color: PremiumColors.PureWhite,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(10px)'
    }}
  >
    <span 
      className="text-lg sm:text-xl font-medium tracking-widest uppercase transition-all duration-500 group-hover:opacity-70"
      style={{
        fontFamily: "'Outfit', 'Satoshi', 'Neue Montreal', sans-serif",
        letterSpacing: '0.1em'
      }}
    >
      {text}
    </span>
    
    {/* Mobile Hover Effect */}
    <div 
      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"
      style={{
        background: `linear-gradient(135deg, rgba(0, 157, 255, 0.08), rgba(0, 255, 224, 0.05))`,
        border: '1px solid rgba(0, 157, 255, 0.2)',
        boxShadow: `0 0 30px rgba(0, 157, 255, 0.1)`
      }}
    ></div>
  </button>
);

export default Header;