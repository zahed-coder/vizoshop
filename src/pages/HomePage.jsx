import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Import hero background images
import heroBg1 from '../assets/images/services/photo1.jpg';
import heroBg2 from '../assets/images/services/photo2.jpeg';
import heroBg3 from '../assets/images/services/photo3.jpg';
import heroBg4 from '../assets/images/services/photo4.jpg';
import heroBg5 from '../assets/images/services/photo5.jpg';
import heroBg6 from '../assets/images/services/photo6.jpeg';

// VIZO color palette (Keeping consistent with Header)
const VizoColors = {
  PrimaryDark: '#1A2A3A',          // Main background for dark sections
  AccentOrange: '#E66B3B',          // Primary accent color
  LightText: '#FFFFFF',              // Text on dark backgrounds
  DarkText: '#333333',               // Text on light backgrounds
  NeutralBlue: '#6A8DAD',            // Subtle accents, secondary text
  OffWhite: '#F9F9F9',               // Background for light sections
  GradientPurple: '#9D50BB',
  GradientYellow: '#F2D50F',
  SoftHighlight: '#A0AEC0'           // Subtle borders, focus rings
};

const HomePage = ({ onNavigate }) => {
  const [heroAnimated, setHeroAnimated] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);
  const { t } = useLanguage();

  const heroBackgroundImages = [heroBg1, heroBg3, heroBg4, heroBg5,]; // Keeping original array

  useEffect(() => {
    // Auto-cycle hero background images
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex(prevIndex => 
        (prevIndex + 1) % heroBackgroundImages.length
      );
    }, 4000);

    // Trigger hero animation
    const heroAnimationTimer = setTimeout(() => {
      setHeroAnimated(true);
    }, 100);
    
    return () => {
      clearTimeout(heroAnimationTimer);
      clearInterval(intervalRef.current);
    };
  }, [heroBackgroundImages.length]);

  // --- UPDATED TESTIMONIALS CONTENT ---
  const testimonials = [
    {
      name: "أحمد غواتي",
      role: "مهتم بملابس الشارع، الجزائر العاصمة",
      content: "مجموعة VIZO دائمًا على المستوى المطلوب! قطعهم عالية الجودة ومنتقاة بعناية لأحدث صيحات أسلوب الشارع. الشحن سريع أيضًا!",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "نور مسعودي",
      role: "مدون موضة، وهران",
      content: "أحب بالتأكيد التسوق في VIZO. جودة ملابسهم ممتازة باستمرار، وتصل طلباتي دائمًا بسرعة فائقة. أوصي بشدة!",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "وليد خضيم",
      role: "مستكشف حضري، قسنطينة",
      content: "أخيرًا متجر يفهم الأسلوب الجزائري الحديث. اختيار VIZO لا مثيل له، دائمًا جديد ويبقيني بمظهر أنيق بدون أي متاعب.",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  // --- UPDATED FEATURES CONTENT ---
  const features = [
    {
      icon: '⚡', // Lightning bolt for speed
      title: "شحن سريع وموثوق",
      description: "احصل على أسلوبك بسرعة في جميع أنحاء محافظات الجزائر"
    },
    {
      icon: '✨', // Sparkle for quality/curation
      title: "جودة منتقاة",
      description: "ملابس منتقاة يدويًا تلبي معايير عالية من المتانة والأناقة"
    },
    {
      icon: '📈', // Upward trend for latest trends
      title: "أحدث الصيحات والأنماط",
      description: "ابقَ في المقدمة مع مجموعة محدثة باستمرار من أحدث صيحات الموضة"
    },
    {
      icon: '📦', // Box for convenience
      title: "إرجاع سهل",
      description: "تباديل وإرجاع سهل لتجربة تسوق خالية من المتاعب"
    }
  ];

  // --- Hero Section ---
  const renderHeroSection = () => (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Dynamic Background Images */}
      {heroBackgroundImages.map((image, index) => (
        <div 
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />

      {/* Hero Content */}
      <div className={`relative z-20 h-full flex flex-col justify-center items-center text-center px-4 transition-all duration-1000 ease-in-out ${
          heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        <div className="mb-8 max-w-3xl">
          {/* UPDATED HERO H1 */}
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[${VizoColors.LightText}]`}>
            أسلوبك، <span className="block mt-2">منتقى بعناية</span>
          </h1>
          
          <div className="w-32 h-0.5 mx-auto my-6 bg-gradient-to-r from-[${VizoColors.GradientPurple}] to-[${VizoColors.GradientYellow}] rounded-full"></div>
          
          {/* UPDATED HERO P */}
          <p className={`text-xl text-[${VizoColors.LightText}]/90`}>
            اكتشف أحدث المظاهر والاتجاهات، مع توصيل سريع لباب منزلك في جميع أنحاء الجزائر
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => onNavigate('products')}
            className={`px-8 py-3 md:px-10 md:py-4 rounded-lg text-lg font-medium bg-[${VizoColors.AccentOrange}] text-[${VizoColors.LightText}]
                       hover:bg-[${VizoColors.AccentOrange}]/90 transition-colors duration-300 shadow-lg`}
          >
            {t('اكتشف المجموعة')}
          </button>
        </div>
      </div>

      {/* Image Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {heroBackgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              clearInterval(intervalRef.current);
              setCurrentImageIndex(index);
              intervalRef.current = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % heroBackgroundImages.length);
              }, 4000);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? `bg-[${VizoColors.LightText}] w-6` 
                : `bg-[${VizoColors.LightText}]/50`
            }`}
            aria-label={`انتقل إلى الشريحة ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );

  // --- Features Section ---
  const renderFeaturesSection = () => (
    <section className={`py-16 md:py-24 bg-gradient-to-br from-[${VizoColors.OffWhite}] to-[${VizoColors.OffWhite}]`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-[${VizoColors.DarkText}]`}>
            ميزة <span className={`text-[${VizoColors.AccentOrange}]`}>VIZO</span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto text-[${VizoColors.NeutralBlue}]`}>
            جرب الموضة بدون متاعب مع الجودة والسرعة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-xl shadow-md border border-[${VizoColors.SoftHighlight}]/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
            >
              <div className={`text-4xl mb-6 text-[${VizoColors.AccentOrange}]`}>{feature.icon}</div>
              <h3 className={`text-xl font-bold mb-3 text-[${VizoColors.PrimaryDark}]`}>{feature.title}</h3>
              <p className={`text-[${VizoColors.NeutralBlue}]`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // --- Algerian Testimonials ---
  const renderTestimonialsSection = () => (
    <section className={`py-16 md:py-24 bg-gradient-to-br from-[${VizoColors.PrimaryDark}] to-[#0f212e]`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-[${VizoColors.LightText}]`}>
            ما يقوله عملاؤنا
          </h2>
          <p className={`text-xl max-w-3xl mx-auto text-[${VizoColors.NeutralBlue}]`}>
            تعليقات حقيقية من عشاق موضة VIZO الراضين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-lg`}
            >
              <div className={`text-4xl text-[${VizoColors.AccentOrange}] mb-4`}>"</div>
              <p className={`text-[${VizoColors.LightText}] text-lg mb-6 italic`}>
                {testimonial.content}
              </p>
              <div className="flex items-center flex-row-reverse"> {/* RTL adjustment */}
                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 border-[${VizoColors.AccentOrange}] flex-shrink-0`}>
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/150/${VizoColors.SoftHighlight.substring(1)}/${VizoColors.DarkText.substring(1)}?text=👤`; }}
                  />
                </div>
                <div className="me-4 ms-0 text-right"> {/* RTL adjustment */}
                  <div className={`font-bold text-[${VizoColors.LightText}]`}>{testimonial.name}</div>
                  <div className={`text-sm text-[${VizoColors.NeutralBlue}]`}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // --- REDESIGNED FINAL CTA ---
 
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden" dir="rtl">
      {renderHeroSection()}
      {renderFeaturesSection()}
      {renderTestimonialsSection()}
      
      
      {/* Global Styles for Font and Pattern */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        
        body {
          font-family: 'Tajawal', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: ${VizoColors.OffWhite};
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        /* RTL text alignment adjustments */
        [dir="rtl"] .text-right {
          text-align: right;
        }
        
        [dir="rtl"] .text-left {
          text-align: left;
        }
        
        [dir="rtl"] .text-center {
          text-align: center;
        }
        
        /* Subtle Diagonal Lines Pattern */
        .background-pattern {
          background-size: 20px 20px;
          background-image: linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 100%), 
                            linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 100%);
        }
      `}</style>
    </div>
  );
};

export default HomePage;