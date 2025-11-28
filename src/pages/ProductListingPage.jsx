 import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
  import ProductCard from '../components/ProductCard';
  import { useLanguage } from '../context/LanguageContext';
  import products from '../data/products';

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

  const ProductListingPage = ({ onAddToCart }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('default');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const { t } = useLanguage();
    const headerRef = useRef(null);
    const gridRef = useRef(null);

    const allProducts = products;

    useEffect(() => {
      if (headerRef.current) {
        headerRef.current.style.transform = 'translateY(0%)';
        headerRef.current.style.opacity = '1';
      }
    }, []);

    // Add scroll animation for product cards
    
    const categories = useMemo(() => [
      { id: 'All', name: 'ALL PRODUCTS', icon: '👕' },
      { id: 'Tops', name: 'TOPS', icon: '👚' },
      { id: 'Bottoms', name: 'BOTTOMS', icon: '👖' },
      { id: 'Dresses', name: 'DRESSES', icon: '👗' },
    ], []);

    const sortOptions = useMemo(() => [
      { value: 'default', label: 'RECOMMENDED' },
      { value: 'price-asc', label: 'PRICE: LOW TO HIGH' },
      { value: 'price-desc', label: 'PRICE: HIGH TO LOW' },
      { value: 'newest', label: 'NEWEST ARRIVALS' },
    ], []);

    const filteredAndSortedProducts = useMemo(() => {
      let currentProducts = [...allProducts];

      if (selectedCategory !== 'All') {
        currentProducts = currentProducts.filter(p => p.category === selectedCategory);
      }

      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        currentProducts = currentProducts.filter(p =>
          p.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (p.description && p.description.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }

      switch (sortOption) {
        case 'price-asc': currentProducts.sort((a, b) => a.price - b.price); break;
        case 'price-desc': currentProducts.sort((a, b) => b.price - a.price); break;
        case 'newest':
          currentProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
          break;
        default: currentProducts.sort((a, b) => a.id.localeCompare(b.id));
      }

      return currentProducts;
    }, [allProducts, selectedCategory, searchTerm, sortOption]);

    useEffect(() => {

      const observer = new IntersectionObserver(

        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.style.opacity = '1';

              entry.target.style.transform = 'translateY(0)';

            }

          });

        },

        { threshold: 0.1 }

      );



      const cards = gridRef.current?.querySelectorAll('.luxury-product-item');

      cards?.forEach((card) => observer.observe(card));



      return () => observer.disconnect();

    }, [filteredAndSortedProducts]);

    const handleApplyFilters = useCallback(() => {
      setIsFilterModalOpen(false);
    }, []);

    const handleClearFilters = useCallback(() => {
      setSelectedCategory('All');
      setSearchTerm('');
      setSortOption('default');
      setIsFilterModalOpen(false);
    }, []);

    const renderLuxuryHeader = () => (
      <div
        ref={headerRef}
        className="luxury-page-header"
        style={{
          fontFamily: "'Clash Display', 'Satoshi', 'Outfit', sans-serif"
        }}
      >
        <div className="luxury-header-content">
          <div className="luxury-header-brand">
            <div className="luxury-header-logo">
              VIZO
            </div>
            <div className="luxury-header-subtitle">
              LUXURY BOUTIQUE
            </div>
          </div>
          
          <div className="luxury-header-actions">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="luxury-filter-button"
            >
              <span className="luxury-filter-icon">⚙️</span>
              <span className="luxury-filter-text">FILTER & SORT</span>
              <div className="luxury-button-glow"></div>
            </button>
          </div>
        </div>

        <style jsx>{`
          .luxury-page-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 1.5rem 2rem;
            z-index: 50;
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(25px);
            border-bottom: 1px solid ${PremiumColors.GlassBorder};
          }

          .luxury-header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .luxury-header-brand {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .luxury-header-logo {
            font-family: 'Clash Display', sans-serif;
            font-weight: 900;
            font-size: 2rem;
            color: ${PremiumColors.PureWhite};
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
          }

          .luxury-header-subtitle {
            font-family: 'Satoshi', sans-serif;
            font-weight: 400;
            font-size: 0.8rem;
            color: ${PremiumColors.CoolGray};
            letter-spacing: 0.2em;
            text-transform: uppercase;
          }

          .luxury-filter-button {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid ${PremiumColors.GlassBorder};
            border-radius: 12px;
            color: ${PremiumColors.PureWhite};
            font-family: 'Clash Display', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            backdrop-filter: blur(10px);
            overflow: hidden;
            cursor: pointer;
          }

          .luxury-filter-button:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: ${PremiumColors.ElectricBlueStart};
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 157, 255, 0.2);
          }

          .luxury-filter-icon {
            font-size: 1.1rem;
          }

          .luxury-filter-text {
            position: relative;
            z-index: 2;
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

          .luxury-filter-button:hover .luxury-button-glow {
            left: 100%;
          }

          @media (max-width: 768px) {
            .luxury-page-header {
              padding: 1rem 1.5rem;
            }
            
            .luxury-header-logo {
              font-size: 1.5rem;
            }
            
            .luxury-filter-button {
              padding: 0.75rem 1.5rem;
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    );

    const renderLuxuryFilterModal = () => {
      if (!isFilterModalOpen) return null;

      return (
        <div className="luxury-filter-modal-overlay">
          <div className="luxury-filter-modal">
            <div className="luxury-modal-header">
              <h2 className="luxury-modal-title">FILTER & SORT</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="luxury-modal-close"
                aria-label="Close"
              >
                <svg className="luxury-close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="luxury-modal-content">
              <div className="luxury-filter-section">
                <h3 className="luxury-section-title">CATEGORIES</h3>
                <div className="luxury-categories-grid">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`luxury-category-button ${selectedCategory === category.id ? 'luxury-category-active' : ''}`}
                    >
                      <span className="luxury-category-icon">{category.icon}</span>
                      <span className="luxury-category-name">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="luxury-filter-section">
                <h3 className="luxury-section-title">SEARCH PRODUCTS</h3>
                <div className="luxury-search-container">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or description..."
                    className="luxury-search-input"
                  />
                  <div className="luxury-search-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="luxury-filter-section">
                <h3 className="luxury-section-title">SORT BY</h3>
                <div className="luxury-sort-grid">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortOption(option.value)}
                      className={`luxury-sort-button ${sortOption === option.value ? 'luxury-sort-active' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="luxury-modal-actions">
                <button
                  onClick={handleClearFilters}
                  className="luxury-clear-button"
                >
                  RESET FILTERS
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="luxury-apply-button"
                >
                  APPLY FILTERS
                </button>
              </div>
            </div>
          </div>

          <style jsx>{`
            .luxury-filter-modal-overlay {
              position: fixed;
              inset: 0;
              z-index: 100;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.8);
              backdrop-filter: blur(10px);
              animation: luxuryFadeIn 0.3s ease-out;
            }

            .luxury-filter-modal {
              width: 90%;
              max-width: 600px;
              background: rgba(10, 10, 10, 0.9);
              backdrop-filter: blur(30px);
              border: 1px solid ${PremiumColors.GlassBorder};
              border-radius: 24px;
              overflow: hidden;
              animation: luxuryScaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            }

            .luxury-modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 2rem 2rem 1rem 2rem;
              border-bottom: 1px solid ${PremiumColors.GlassBorder};
            }

            .luxury-modal-title {
              font-family: 'Clash Display', sans-serif;
              font-weight: 700;
              font-size: 1.5rem;
              color: ${PremiumColors.PureWhite};
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }

            .luxury-modal-close {
              padding: 0.5rem;
              border-radius: 8px;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid ${PremiumColors.GlassBorder};
              color: ${PremiumColors.PureWhite};
              transition: all 0.3s ease;
              cursor: pointer;
            }

            .luxury-modal-close:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: ${PremiumColors.ElectricBlueStart};
            }

            .luxury-close-icon {
              width: 1.5rem;
              height: 1.5rem;
            }

            .luxury-modal-content {
              padding: 2rem;
              max-height: 70vh;
              overflow-y: auto;
            }

            .luxury-filter-section {
              margin-bottom: 2.5rem;
            }

            .luxury-section-title {
              font-family: 'Clash Display', sans-serif;
              font-weight: 600;
              font-size: 1rem;
              color: ${PremiumColors.PureWhite};
              letter-spacing: 0.05em;
              text-transform: uppercase;
              margin-bottom: 1.5rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid ${PremiumColors.GlassBorder};
            }

            .luxury-categories-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
              gap: 1rem;
            }

            .luxury-category-button {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.75rem;
              padding: 1.5rem 1rem;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid ${PremiumColors.GlassBorder};
              border-radius: 12px;
              color: ${PremiumColors.CoolGray};
              transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              cursor: pointer;
            }

            .luxury-category-button:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: ${PremiumColors.ElectricBlueStart};
              transform: translateY(-2px);
            }

            .luxury-category-active {
              background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}20, ${PremiumColors.ElectricBlueEnd}15);
              border-color: ${PremiumColors.ElectricBlueStart};
              color: ${PremiumColors.PureWhite};
              box-shadow: 0 8px 25px rgba(0, 157, 255, 0.2);
            }

            .luxury-category-icon {
              font-size: 1.5rem;
            }

            .luxury-category-name {
              font-family: 'Satoshi', sans-serif;
              font-weight: 600;
              font-size: 0.8rem;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }

            .luxury-search-container {
              position: relative;
            }

            .luxury-search-input {
              width: 100%;
              padding: 1.25rem 3rem 1.25rem 1.5rem;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid ${PremiumColors.GlassBorder};
              border-radius: 12px;
              color: ${PremiumColors.PureWhite};
              font-family: 'Satoshi', sans-serif;
              font-size: 1rem;
              transition: all 0.3s ease;
            }

            .luxury-search-input:focus {
              outline: none;
              border-color: ${PremiumColors.ElectricBlueStart};
              background: rgba(255, 255, 255, 0.08);
              box-shadow: 0 0 20px rgba(0, 157, 255, 0.2);
            }

            .luxury-search-input::placeholder {
              color: ${PremiumColors.CoolGray};
            }

            .luxury-search-icon {
              position: absolute;
              right: 1.25rem;
              top: 50%;
              transform: translateY(-50%);
              color: ${PremiumColors.ElectricBlueStart};
            }

            .luxury-search-icon svg {
              width: 1.25rem;
              height: 1.25rem;
            }

            .luxury-sort-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1rem;
            }

            .luxury-sort-button {
              padding: 1.25rem 1.5rem;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid ${PremiumColors.GlassBorder};
              border-radius: 12px;
              color: ${PremiumColors.CoolGray};
              font-family: 'Satoshi', sans-serif;
              font-weight: 500;
              font-size: 0.9rem;
              transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              cursor: pointer;
            }

            .luxury-sort-button:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: ${PremiumColors.ElectricBlueStart};
              transform: translateY(-2px);
            }

            .luxury-sort-active {
              background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}20, ${PremiumColors.ElectricBlueEnd}15);
              border-color: ${PremiumColors.ElectricBlueStart};
              color: ${PremiumColors.PureWhite};
              box-shadow: 0 8px 25px rgba(0, 157, 255, 0.2);
            }

            .luxury-modal-actions {
              display: flex;
              gap: 1rem;
              padding-top: 2rem;
              border-top: 1px solid ${PremiumColors.GlassBorder};
            }

            .luxury-clear-button, .luxury-apply-button {
              flex: 1;
              padding: 1.25rem 2rem;
              border: none;
              border-radius: 12px;
              font-family: 'Clash Display', sans-serif;
              font-weight: 600;
              font-size: 0.9rem;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              cursor: pointer;
            }

            .luxury-clear-button {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid ${PremiumColors.GlassBorder};
              color: ${PremiumColors.PureWhite};
            }

            .luxury-clear-button:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: ${PremiumColors.ElectricBlueStart};
              transform: translateY(-2px);
            }

            .luxury-apply-button {
              background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
              color: ${PremiumColors.PureWhite};
              box-shadow: 0 4px 20px rgba(0, 157, 255, 0.3);
            }

            .luxury-apply-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 30px rgba(0, 157, 255, 0.5);
            }

            @keyframes luxuryFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes luxuryScaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }

            @media (max-width: 768px) {
              .luxury-filter-modal {
                width: 95%;
                margin: 1rem;
              }
              
              .luxury-modal-content {
                padding: 1.5rem;
              }
              
              .luxury-categories-grid {
                grid-template-columns: repeat(2, 1fr);
              }
              
              .luxury-sort-grid {
                grid-template-columns: 1fr;
              }
              
              .luxury-modal-actions {
                flex-direction: column;
              }
            }
          `}</style>
        </div>
      );
    };

    const renderLuxuryProductGrid = () => (
      <section className="luxury-product-grid-section">
        {/* Ambient Background Effects */}
        <div className="luxury-grid-background">
          <div className="luxury-grid-glow-1"></div>
          <div className="luxury-grid-glow-2"></div>
        </div>

        <div className="luxury-grid-container">
          <div className="luxury-grid-header">
            <div className="luxury-grid-title-section">
              <h2 className="luxury-grid-title">
                {selectedCategory === 'All' ? 'ALL PRODUCTS' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <div className="luxury-grid-count">
                <span className="luxury-count-number">{filteredAndSortedProducts.length}</span>
                <span className="luxury-count-label">ITEMS</span>
              </div>
            </div>
            
            
          </div>

          {filteredAndSortedProducts.length === 0 ? (
            <div className="luxury-empty-state">
              <div className="luxury-empty-icon">🕳️</div>
              <h3 className="luxury-empty-title">NO MATCHING ITEMS FOUND</h3>
              <p className="luxury-empty-description">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <button
                onClick={handleClearFilters}
                className="luxury-empty-button"
              >
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div ref={gridRef} className="luxury-products-grid">
              {filteredAndSortedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="luxury-product-item"
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                    transform: 'translateY(30px)',
                    transition: `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.05}s`
                  }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .luxury-product-grid-section {
            position: relative;
            min-height: 100vh;
            padding: 8rem 2rem 4rem 2rem;
            background: ${PremiumColors.DeepMatteBlack};
            overflow: hidden;
          }

          .luxury-grid-background {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }

          .luxury-grid-glow-1 {
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

          .luxury-grid-glow-2 {
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

          .luxury-grid-container {
            max-width: 1400px;
            margin: 0 auto;
            position: relative;
            z-index: 10;
          }

          .luxury-grid-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 4rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid ${PremiumColors.GlassBorder};
          }

          .luxury-grid-title-section {
            display: flex;
            align-items: flex-end;
            gap: 2rem;
          }

          .luxury-grid-title {
            font-family: 'Clash Display', sans-serif;
            font-weight: 700;
            font-size: 2.5rem;
            color: ${PremiumColors.PureWhite};
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin: 0;
          }

          .luxury-grid-count {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid ${PremiumColors.GlassBorder};
            border-radius: 8px;
          }

          .luxury-count-number {
            font-family: 'Clash Display', sans-serif;
            font-weight: 700;
            font-size: 1.5rem;
            color: ${PremiumColors.ElectricBlueStart};
            line-height: 1;
          }

          .luxury-count-label {
            font-family: 'Satoshi', sans-serif;
            font-weight: 600;
            font-size: 0.7rem;
            color: ${PremiumColors.CoolGray};
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-top: 0.25rem;
          }

          .luxury-grid-stats {
            font-family: 'Satoshi', sans-serif;
            font-weight: 400;
            font-size: 0.9rem;
            color: ${PremiumColors.CoolGray};
            letter-spacing: 0.05em;
          }

          .luxury-empty-state {
            text-align: center;
            padding: 6rem 2rem;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid ${PremiumColors.GlassBorder};
            border-radius: 24px;
            backdrop-filter: blur(20px);
          }

          .luxury-empty-icon {
            font-size: 4rem;
            margin-bottom: 2rem;
            opacity: 0.7;
          }

          .luxury-empty-title {
            font-family: 'Clash Display', sans-serif;
            font-weight: 700;
            font-size: 1.5rem;
            color: ${PremiumColors.PureWhite};
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 1rem;
          }

          .luxury-empty-description {
            font-family: 'Satoshi', sans-serif;
            font-weight: 400;
            font-size: 1rem;
            color: ${PremiumColors.CoolGray};
            max-width: 400px;
            margin: 0 auto 2rem auto;
            line-height: 1.6;
          }

          .luxury-empty-button {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, ${PremiumColors.ElectricBlueStart}, ${PremiumColors.ElectricBlueEnd});
            border: none;
            border-radius: 12px;
            color: ${PremiumColors.PureWhite};
            font-family: 'Clash Display', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            cursor: pointer;
          }

          .luxury-empty-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 157, 255, 0.4);
          }

          .luxury-products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2rem;
          }

          @media (max-width: 768px) {
            .luxury-product-grid-section {
              padding: 6rem 1rem 2rem 1rem;
            }
            
            .luxury-grid-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
              margin-bottom: 3rem;
            }
            
            .luxury-grid-title-section {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }
            
            .luxury-grid-title {
              font-size: 2rem;
            }
            
            .luxury-products-grid {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }
          }

          @media (min-width: 769px) and (max-width: 1024px) {
            .luxury-products-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1025px) and (max-width: 1440px) {
            .luxury-products-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (min-width: 1441px) {
            .luxury-products-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }
        `}</style>
      </section>
    );

    return (
      <div
        className="luxury-product-listing-page"
        style={{
          backgroundColor: PremiumColors.DeepMatteBlack,
          color: PremiumColors.PureWhite,
          fontFamily: "'Clash Display', 'Satoshi', 'Outfit', sans-serif",
          minHeight: '100vh'
        }}
      >
        {renderLuxuryHeader()}
        {renderLuxuryProductGrid()}
        {renderLuxuryFilterModal()}
      </div>
    );
  };

  export default ProductListingPage;