import React, { useState, useMemo, useRef, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

// Updated to VizoColors palette
const VizoColors = {
  PrimaryBlue: '#1A3A4A',
  AccentOrange: '#E66B3B',
  LightGrey: '#F0F2F5',
  DarkText: '#333333',
  LightText: '#FFFFFF',
  NeutralBlue: '#6A8DAD',
  OffWhite: '#F9F9F9',
  ContrastDark: '#245F73',
  ContrastAccent: '#733224',
  SoftHighlight: '#BBBDBC',
};

const ProductListingPage = ({ products, onAddToCart, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [displayedProductCount, setDisplayedProductCount] = useState(12);
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    // Canvas animation remains similar but uses VizoColors
    const initCanvasAnimation = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      let particles = [];
      const particleCount = 150;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          color: `rgba(106, 141, 173, ${Math.random() * 0.3 + 0.1})` // NeutralBlue
        });
      }
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;
          
          if (p.x > canvas.width || p.x < 0) p.speedX = -p.speedX;
          if (p.y > canvas.height || p.y < 0) p.speedY = -p.speedY;
          
          const gradient = ctx.createRadialGradient(
            p.x, p.y, 0, 
            p.x, p.y, p.radius * 5
          );
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, 'rgba(106, 141, 173, 0)');
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    };

    initCanvasAnimation();

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Simplified clothing categories with more visible icons
  const categories = useMemo(() => [
    { id: 'All', name: 'All Items', icon: '👕' },
    { id: 'Shorts', name: 'Shorts', icon: '🩳' },
    { id: 'Tops', name: 'Tops', icon: '👚' },
    { id: 'Outerwear', name: 'Outerwear', icon: '🧥' },
    { id: 'Footwear', name: 'Footwear', icon: '👟' },
    { id: 'Accessories', name: 'Accessories', icon: '🕶️' },
  ], []);
  
  const sortOptions = useMemo(() => [
    { value: 'default', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' },
  ], []);

  const filteredAndSortedProducts = useMemo(() => {
    let currentProducts = [...products];
    
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
      case 'newest': currentProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: currentProducts.sort((a, b) => a.id.localeCompare(b.id));
    }
    
    return currentProducts;
  }, [products, selectedCategory, searchTerm, sortOption]);

  const handleLoadMore = () => {
    setDisplayedProductCount(prev => prev + 8);
  };

  const renderFloatingHeader = () => (
    <div 
      ref={headerRef}
      className="fixed top-0 left-0 w-full py-4 px-8 z-50 transition-all duration-500 backdrop-blur-lg bg-white/90 border-b"
      style={{ 
        backgroundColor: VizoColors.OffWhite,
        borderColor: VizoColors.SoftHighlight,
        transform: 'translateY(-100%)', 
        opacity: 0 
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-2xl font-bold" style={{ color: VizoColors.PrimaryBlue }}>VIZO</div>
          <div className="ml-8 flex space-x-6">
            {categories.slice(0, 4).map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? 'text-white' 
                    : 'text-gray-700 hover:text-' + VizoColors.AccentOrange.replace('#', '')
                }`}
                style={{
                  backgroundColor: selectedCategory === category.id 
                    ? VizoColors.AccentOrange 
                    : 'transparent'
                }}
              >
                <span className="mr-1 text-lg">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find clothing items..."
              className="bg-white border rounded-full py-2 px-4 placeholder-gray-400 focus:outline-none focus:ring-1 w-64"
              style={{ 
                borderColor: VizoColors.SoftHighlight,
                color: VizoColors.DarkText
              }}
            />
            <div className="absolute right-3 top-2.5" style={{ color: VizoColors.AccentOrange }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductBanner = () => (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
        style={{ backgroundColor: VizoColors.PrimaryBlue }}
      />
      
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 to-white/10"></div>
      
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 pt-20">
        <div className="mb-8">
          <div 
            className="inline-block px-6 py-2 rounded-full mb-6 text-white font-medium"
            style={{ backgroundColor: VizoColors.AccentOrange }}
          >
            Premium Collection
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            <span className="block">Curated</span>
            <span className="block mt-2" style={{ color: VizoColors.AccentOrange }}>
              Fashion Selection
            </span>
          </h1>
          
          <div className="w-64 h-1 mx-auto my-8" style={{ backgroundColor: VizoColors.AccentOrange }}></div>
          
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto text-white">
            Discover premium clothing crafted for style and comfort
          </p>
        </div>
      </div>
    </section>
  );

  const renderFilterSortControls = () => (
    <section className="relative z-30 -mt-20">
      <div className="container mx-auto px-4 md:px-8">
        <div 
          className="rounded-2xl p-8 shadow-xl"
          style={{ 
            backgroundColor: VizoColors.OffWhite,
            border: `1px solid ${VizoColors.SoftHighlight}`
          }}
        >
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Category Filter */}
            <div className="flex-1">
              <h3 
                className="text-lg font-semibold mb-4 pl-2"
                style={{ color: VizoColors.PrimaryBlue }}
              >
                Categories
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setDisplayedProductCount(12);
                    }}
                    className={`flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'shadow-lg'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id 
                        ? VizoColors.AccentOrange 
                        : 'white',
                      color: selectedCategory === category.id 
                        ? 'white' 
                        : VizoColors.DarkText,
                      border: `1px solid ${VizoColors.SoftHighlight}`
                    }}
                  >
                    <span className="mr-2 text-2xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: VizoColors.PrimaryBlue }}
                >
                  Refine Selection
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setDisplayedProductCount(12);
                    }}
                    placeholder="Find clothing items..."
                    className="w-full px-4 py-3 bg-white border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-1"
                    style={{ 
                      borderColor: VizoColors.SoftHighlight,
                      color: VizoColors.DarkText
                    }}
                  />
                  <div className="absolute right-3 top-3.5" style={{ color: VizoColors.AccentOrange }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: VizoColors.PrimaryBlue }}
                  >
                    Sort By
                  </h3>
                  <button 
                    className="text-sm hover:underline"
                    style={{ color: VizoColors.AccentOrange }}
                    onClick={() => {
                      setSortOption('default');
                      setDisplayedProductCount(12);
                    }}
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortOption(option.value)}
                      className={`p-3 rounded-xl text-center transition-all duration-300 ${
                        sortOption === option.value
                          ? 'shadow-lg'
                          : 'hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: sortOption === option.value 
                          ? VizoColors.AccentOrange 
                          : 'white',
                        color: sortOption === option.value 
                          ? 'white' 
                          : VizoColors.DarkText,
                        border: `1px solid ${VizoColors.SoftHighlight}`
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderProductGrid = () => (
    <section className="container mx-auto px-4 md:px-8 py-16 relative z-20">
      <div 
        className="flex justify-between items-center mb-12 pb-6"
        style={{ borderBottom: `1px solid ${VizoColors.SoftHighlight}` }}
      >
        <h2 className="text-3xl font-bold" style={{ color: VizoColors.PrimaryBlue }}>
          {selectedCategory === 'All' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.name}
          <span className="ml-4" style={{ color: VizoColors.AccentOrange }}>
            {filteredAndSortedProducts.length} items
          </span>
        </h2>
        
        <div style={{ color: VizoColors.DarkText }}>
          Showing {Math.min(displayedProductCount, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length}
        </div>
      </div>
      
      {filteredAndSortedProducts.length === 0 ? (
        <div 
          className="text-center py-20 rounded-2xl shadow-xl"
          style={{ 
            backgroundColor: VizoColors.OffWhite,
            border: `1px solid ${VizoColors.SoftHighlight}`
          }}
        >
          <div className="text-5xl mb-4" style={{ color: VizoColors.AccentOrange }}>🕳️</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: VizoColors.AccentOrange }}>
            No items match your criteria
          </h3>
          <p className="text-lg max-w-md mx-auto" style={{ color: VizoColors.DarkText }}>
            Try adjusting your filters or search terms
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchTerm('');
              setSortOption('default');
            }}
            className="mt-6 px-6 py-3 rounded-full font-bold"
            style={{ 
              backgroundColor: VizoColors.AccentOrange,
              color: 'white'
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedProducts.slice(0, displayedProductCount).map((product, index) => (
              <div
                key={product.id}
                className="transform transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onNavigate={onNavigate}
                  theme="light"
                />
              </div>
            ))}
          </div>

          {displayedProductCount < filteredAndSortedProducts.length && (
            <div className="text-center mt-16">
              <button
                onClick={handleLoadMore}
                className="relative px-8 py-4 bg-transparent rounded-full text-lg font-bold group overflow-hidden"
                style={{ 
                  border: `1px solid ${VizoColors.AccentOrange}`,
                  color: VizoColors.AccentOrange
                }}
              >
                View More Items
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );

  return (
    <div 
      className="flex flex-col w-full overflow-x-hidden"
      style={{ backgroundColor: VizoColors.OffWhite, color: VizoColors.DarkText }}
    >
      {renderFloatingHeader()}
      {renderProductBanner()}
      {renderFilterSortControls()}
      {renderProductGrid()}
      
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductListingPage;