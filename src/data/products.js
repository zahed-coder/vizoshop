import chrome1 from '../assets/images/services/chrome1.jpg';
import chrome2 from '../assets/images/services/chrome2.jpg';
import chrome3 from '../assets/images/services/chrome3.jpg';

import coach1 from '../assets/images/services/coach1.jpg';
import coach2 from '../assets/images/services/coach2.jpg';
import coach3 from '../assets/images/services/coach3.jpg';
import coach4 from '../assets/images/services/coach4.jpg';

// 🚨 FIXED: SPIDER imports now match actual file names
import SPIDER1 from '../assets/images/services/SPIDER1.jpg';
import SPIDER2 from '../assets/images/services/SPIDER2.jpg';
import SPIDER3 from '../assets/images/services/SPIDER3.jpg';
import SPIDER4 from '../assets/images/services/SPIDER4.jpg';
import chrome4 from '../assets/images/services/chrome4.jpg';
import chrome5 from '../assets/images/services/chrome5.jpg';
import chrome6 from '../assets/images/services/chrome6.jpg';

// New imports for Chrome Hearts rings and bracelets
import ring4 from '../assets/images/services/ring4.jpg';
import ring2 from '../assets/images/services/ring2.jpg';
import sitePhoto1 from '../assets/images/services/site photo (1).jpg';
import sitePhoto2 from '../assets/images/services/site photo (2).jpg';
import sitePhoto3 from '../assets/images/services/site photo (3).jpg';
import sitePhoto5 from '../assets/images/services/site photo (5).jpg';
import sitePhoto6 from '../assets/images/services/site photo (6).jpg';
import sitePhoto9 from '../assets/images/services/site photo (9).jpg';
import sitePhoto10 from '../assets/images/services/site photo (10).jpg';
import sitePhoto11 from '../assets/images/services/site photo (11).jpg';
import sitePhoto12 from '../assets/images/services/site photo (12).jpg';
import sitePhoto13 from '../assets/images/services/site photo (13).jpg';
import sitePhoto14 from '../assets/images/services/site photo (14).jpg';
import sitePhoto17 from '../assets/images/services/site photo (17).jpg';
import sitePhoto20 from '../assets/images/services/site photo (20).JPG';
import sitePhoto25 from '../assets/images/services/site photo (25).jpg';
import sitePhoto26 from '../assets/images/services/site photo (26).jpg';
import sitePhoto27 from '../assets/images/services/site photo (27).jpg';
import sitePhoto18 from '../assets/images/services/site photo (18).jpg';

// New imports for Heat Mask
import heatMaskGrey from '../assets/images/services/heatMaskGrey.jpg';
import heatMaskGreen from '../assets/images/services/heatMaskGreen.jpg';
import heatMaskBlue from '../assets/images/services/heatMaskBlue.jpg';

// New imports for Stanley Cup
import stanleyTayla from '../assets/images/services/stanleyTayla.jpg';
import stanleyBlueMarble from '../assets/images/services/stanleyBlueMarble.jpg';
import stanleyHelloKitty from '../assets/images/services/stanleyHelloKitty.jpg';
import stanleyPink from '../assets/images/services/stanleyPink.jpg';

const products = [
  // Combined Chrome Hearts Jewelry - Rings & Bracelets
  {
    id: '1',
    name: 'Chrome Hearts Jewelry PROMO',
    description: 'مجموعة مجوهرات كروم هارتس أصلية من الفضة 925 - خواتم وأساور بتصميمات فريدة.',
    price: 1500,
    stock: 10,
    category: 'مجوهرات',
    imageUrl: sitePhoto10,
    images: [sitePhoto10, ring4, ring2, sitePhoto9, sitePhoto17, sitePhoto11, sitePhoto12, sitePhoto13, sitePhoto14, sitePhoto27],
    specifications: {
      material: 'فضة 925 عالية الجودة',
      weight: '0.06-0.15 كغ',
      warranty: 'ضمان جودة لمدة 6 أشهر',
    },
    variants: {
      type: 'jewelry',
      options: [
        // Rings
        { id: 'ring1', name: 'Ring Classic', image: ring4, price: 1500, type: 'ring' },
        { id: 'ring2', name: 'Ring Premium', image: sitePhoto17, price: 1800, type: 'ring' },
        { id: 'ring3', name: 'Ring Deluxe', image: sitePhoto9, price: 1900, type: 'ring' },
        { id: 'ring4', name: 'Ring Luxury', image: ring2, price: 2000, type: 'ring' },
        { id: 'ring5', name: 'Ring Exclusive', image: sitePhoto10, price: 2000, type: 'ring' },
        // Bracelets
        { id: 'bracelet1', name: 'Bracelet Classic', image: sitePhoto12, price: 2000, type: 'bracelet' },
        { id: 'bracelet2', name: 'Bracelet Premium', image: sitePhoto14, price: 2000, type: 'bracelet' },
        { id: 'bracelet3', name: 'Bracelet Deluxe', image: sitePhoto13, price: 2000, type: 'bracelet' },
        { id: 'bracelet4', name: 'Bracelet Luxury', image: sitePhoto11, price: 2000, type: 'bracelet' },
        { id: 'bracelet5', name: 'Bracelet Exclusive', image: sitePhoto27, price: 2000, type: 'bracelet' }
      ]
    }
  },
  // Chrome Hearts Long Sleeve
  {
    id: '2',
    name: 'Chrome Hearts Long Sleeve',
    description: 'تيشيرت كروم هارتس طويل الأكمان بجودة عالية وتصميم مميز.',
    price: 6000,
    stock: 15,
    category: 'ملابس',
    imageUrl: sitePhoto1,
    images: [sitePhoto1, sitePhoto2, sitePhoto25, sitePhoto26, sitePhoto3],
    specifications: {
      material: 'قطن 100% عالي الجودة',
      dimensions: 'مقاسات متنوعة',
      weight: '0.4 كغ',
      warranty: 'ضمان جودة لمدة شهر واحد',
    },
    requiresSize: true,
    variants: {
      type: 'size',
      options: [
        { id: 'longsleeve1', name: 'Model 1', image: sitePhoto1, price: 6000, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'longsleeve2', name: 'Model 2', image: sitePhoto2, price: 6000, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'longsleeve3', name: 'Model 3', image: sitePhoto25, price: 6000, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'longsleeve4', name: 'Model 4', image: sitePhoto26, price: 6000, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'longsleeve5', name: 'Model 5', image: sitePhoto3, price: 6000, sizes: ['S', 'M', 'L', 'XL'] }
      ]
    }
  },
  // Chrome Hearts Caps - Corrected photos
  {
    id: '3',
    name: 'Chrome Hearts Caps PROMO' ,
    description: 'قبعات كروم هارتس بتصميمات عصرية وجودة فائقة.',
    price: 3000,
    stock: 8,
    category: 'قبعات',
    imageUrl: sitePhoto6,
    images: [sitePhoto6, sitePhoto5, sitePhoto20],
    specifications: {
      material: 'قطن ولباد عالي الجودة',
      dimensions: 'مقاس واحد يناسب الجميع',
      weight: '0.2 كغ',
      warranty: 'ضمان جودة لمدة 3 أشهر',
    },
    variants: {
      type: 'model',
      options: [
        { id: 'cap1', name: 'Cap Classic', image: sitePhoto6, price: 3000 },
        { id: 'cap2', name: 'Cap Premium', image: sitePhoto5, price: 3000 },
        { id: 'cap3', name: 'Cap Deluxe', image: sitePhoto20, price: 3000 }
      ]
    }
  },
  // Updated Chrome Hearts Glasses with proper box option
  {
    id: '4',
    name: 'Chrome Hearts Glasses',
    description: 'نظارات كروم هارتس عالية الجودة بتصميم أنيق - متوفرة مع علبة أصلية.',
    price: 3000,
    stock: 12,
    category: 'نظارات',
    imageUrl: chrome1,
    images: [chrome1, chrome2, chrome3, chrome4, chrome5, chrome6, sitePhoto18],
    specifications: {
      material: 'بلاستيك عالي الجودة مع تفاصيل فضية',
      dimensions: 'مقاس واحد يناسب الجميع',
      weight: '0.3 كغ',
      warranty: 'ضمان جودة لمدة شهر واحد',
    },
    variants: {
      type: 'package',
      options: [
        { 
          id: 'black_without_box', 
          name: 'نظارات سوداء بدون علبة', 
          image: chrome1, 
          price: 3200,
          type: 'glasses_only',
          additionalImages: [chrome1, chrome2, chrome3]
        },
        { 
          id: 'black_with_box', 
          name: 'نظارات سوداء مع علبة', 
          image: sitePhoto18, 
          price: 5200,
          type: 'with_box',
          additionalImages: [chrome1, chrome2, chrome3, sitePhoto18]
        },
        { 
          id: 'transparent_without_box', 
          name: 'نظارات شفافة بدون علبة', 
          image: chrome4, 
          price: 3200,
          type: 'glasses_only',
          additionalImages: [chrome4, chrome5, chrome6]
        },
        { 
          id: 'transparent_with_box', 
          name: 'نظارات شفافة مع علبة', 
          image: sitePhoto18, 
          price: 5200,
          type: 'with_box',
          additionalImages: [chrome4, chrome5, chrome6, sitePhoto18]
        }
      ]
    }
  },
  // Updated SP5DER TSHIRT with sizes
  {
    id: '5',
    name: 'SP5DER TSHIRT',
    description: 'تيشيرت سبايدر بجودة عالية وتصميم مميز - متوفر بمقاسات مختلفة.',
    price: 2000,
    stock: 20,
    category: 'تي شيرتات',
    imageUrl: SPIDER1,
    images: [SPIDER1, SPIDER2, SPIDER3, SPIDER4],
    specifications: {
      material: 'قطن 100% عالي الجودة',
      dimensions: '15*30*9',
      weight: '0.3 كغ',
      warranty: '1 month',
    },
    requiresSize: true,
    variants: {
      type: 'size',
      options: [
        { id: 'spider1', name: 'SP5DER Black', image: SPIDER1, price: 2000, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'spider2', name: 'SP5DER Red', image: SPIDER2, price: 2000, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'spider3', name: 'SP5DER White', image: SPIDER3, price: 2000, sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'spider4', name: 'SP5DER Limited', image: SPIDER4, price: 2000, sizes: ['S', 'M', 'L', 'XL'] }
      ]
    }
  },
  // Heat Mask
  {
    id: '6',
    name: 'Heat Mask PROMO',
    description: 'قناع حراري مريح وفعال متوفر بعدة ألوان.',
    price: 2000,
    stock: 25,
    category: 'أقنعة',
    imageUrl: heatMaskGrey,
    images: [heatMaskGrey, heatMaskGreen, heatMaskBlue],
    specifications: {
      material: 'قماش حراري عالي الجودة',
      dimensions: 'مقاس واحد يناسب الجميع',
      weight: '0.05 كغ',
      warranty: 'ضمان جودة لمدة 3 أشهر',
    },
    variants: {
      type: 'color',
      options: [
        { id: 'grey', name: 'رمادي', image: heatMaskGrey, price: 2000 },
        { id: 'green', name: 'أخضر', image: heatMaskGreen, price: 2000 },
        { id: 'blue', name: 'أزرق', image: heatMaskBlue, price: 2000 }
      ]
    }
  },
  // Stanley Cup
  {
    id: '7',
    name: 'Stanley Cup',
    description: 'كأس ستانلي عملي وأنيق متوفر بعدة موديلات.',
    price: 6000,
    stock: 18,
    category: 'كؤوس',
    imageUrl: stanleyTayla,
    images: [stanleyTayla, stanleyBlueMarble, stanleyHelloKitty, stanleyPink],
    specifications: {
      material: 'فولاذ مقاوم للصدأ',
      dimensions: 'سعة 1 لتر',
      weight: '0.4 كغ',
      warranty: 'ضمان جودة لمدة عام واحد',
    },
    variants: {
      type: 'model',
      options: [
        { id: 'tayla', name: 'Tayla', image: stanleyTayla, price: 7000 },
        { id: 'blue_marble', name: 'Blue Marble', image: stanleyBlueMarble, price: 6500 },
        { id: 'hello_kitty', name: 'Hello Kitty', image: stanleyHelloKitty, price: 6400 },
        { id: 'pink', name: 'Pink', image: stanleyPink, price: 6000 }
      ]
    }
  },
  {
    id: '8',
    name: 'SAC COACH PROMO',
    description: 'the best on the market',
    price: 2000,
    stock: 5,
    category: 'SAC COACH',
    imageUrl: coach1,
    images: [coach1, coach2, coach3, coach4],
    specifications: {
      material: 'Excellent',
      dimensions: '29*19*9',
      weight: '0.3 كغ',
      warranty: '1 month',
    }
  }
];

export default products;