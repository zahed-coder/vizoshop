import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { CartContext } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext'; // Assuming you have a LanguageContext
import WilayaTownSelector from '../components/WilayaTownSelector'; // Import the new component

// Firebase imports specific to CheckoutPage (for saving orders)
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Embedded Algerian Wilaya and Town Data (from WilayaTownSelector for consistency) ---
// This data structure maps each Wilaya (Province) to its list of associated Towns/Communes.
// We're bringing it here for easy access to define shipping costs based on wilaya.
const algeriaLocations = [
    { "wilaya": "Adrar", "towns": ["Adrar", "Tamest", "Reggane", "Bordj Badji Mokhtar", "Timimoun", "Aoulef", "Fenoughil", "Tinerkouk"] },
    { "wilaya": "Chlef", "towns": ["Chlef", "El Karimia", "Ouled Fares", "Tenes", "Boukadir", "Sobha", "Oued Fodda", "Ain Merane"] },
    { "wilaya": "Laghouat", "towns": ["Laghouat", "Aflou", "Ksar El Hirane", "Ain Madhi", "Guelt Es Stell"] },
    { "wilaya": "Oum El Bouaghi", "towns": ["Oum El Bouaghi", "Ain Beida", "Ain M'lila", "Ain Fakroun", "Meskhiana"] },
    { "wilaya": "Batna", "towns": ["Batna", "Barika", "Arris", "Merouana", "Ain Touta", "Tazoult", "Djezzar"] },
    { "wilaya": "Béjaïa", "towns": ["Béjaïa", "Akbou", "Amizour", "Kherrata", "El Kseur", "Sidi Aïch", "Tichy"] },
    { "wilaya": "Biskra", "towns": ["Biskra", "Ouled Djellal", "Sidi Okba", "Tolga", "Foughala", "El Kantara"] },
    { "wilaya": "Béchar", "towns": ["Béchar", "Abadla", "Beni Ounif", "Taghit", "Lahmar"] },
    { "wilaya": "Blida", "towns": ["Blida", "Boufarik", "Larbaa", "Meftah", "Mouzaia", "Oued El Alleug"] },
    { "wilaya": "Bouira", "towns": ["Bouira", "Lakhdaria", "Sour El Ghozlane", "Ain Bessem", "El Hachimia"] },
    { "wilaya": "Tamanrasset", "towns": ["Tamanrasset", "Abalessa", "Tazrouk", "Idles", "Tin Zaouatine"] },
    { "wilaya": "Tébessa", "towns": ["Tébessa", "Bir El Ater", "Cheria", "Ouenza", "El Ma Labiodh"] },
    { "wilaya": "Tlemcen", "towns": ["Tlemcen", "Ghazaouet", "Maghnia", "Remchi", "Sebdou", "Hennaya"] },
    { "wilaya": "Tiaret", "towns": ["Tiaret", "Frenda", "Ain Deheb", "Sougueur", "Mahdia"] },
    { "wilaya": "Tizi Ouzou", "towns": ["Tizi Ouzou", "Ain El Hammam", "Azazga", "Bouzeguene", "Draâ Ben Khedda"] },
    { "wilaya": "Alger", "towns": ["Alger Centre", "Bab Ezzouar", "Bir Mourad Raïs", "Chéraga", "Dar El Beïda", "Hussein Dey", "Rouïba"] },
    { "wilaya": "Djelfa", "towns": ["Djelfa", "Ain Oussara", "Messaad", "Charef", "Dar Chioukh"] },
    { "wilaya": "Jijel", "towns": ["Jijel", "Taher", "El Milia", "Chekfa", "Ziamah"] },
    { "wilaya": "Sétif", "towns": ["Sétif", "El Eulma", "Bousselam", "Ain Oulmene", "Mezloug", "Beni Ouartilane"] },
    { "wilaya": "Saïda", "towns": ["Saïda", "Ain El Hadjar", "Sidi Boubkeur", "Youb"] },
    { "wilaya": "Skikda", "towns": ["Skikda", "Ramdane Djamel", "El Harrouch", "Azzaba", "Collo"] },
    { "wilaya": "Sidi Bel Abbès", "towns": ["Sidi Bel Abbès", "Ras El Ma", "Sfisef", "Telagh", "Ain El Berd"] },
    { "wilaya": "Annaba", "towns": ["Annaba", "El Bouni", "Sidi Amar", "Chetaïbi", "Berrahal"] },
    { "wilaya": "Guelma", "towns": ["Guelma", "Héliopolis", "Oued Zenati", "Bouchegouf", "Khezaras"] },
    { "wilaya": "Constantine", "towns": ["Constantine", "El Khroub", "Ain Smara", "Hamma Bouziane", "Didouche Mourad"] },
    { "wilaya": "Médéa", "towns": ["Médéa", "Berrouaghia", "Ksar Boukhari", "Chahbounia", "Tablat"] },
    { "wilaya": "Mostaganem", "towns": ["Mostaganem", "Hassi Mameche", "Ain Tedles", "Mesra", "Bouguirat"] },
    { "wilaya": "M'Sila", "towns": ["M'Sila", "Bou Saada", "Magra", "Sidi Aïssa", "Ouled Derradj"] },
    { "wilaya": "Mascara", "towns": ["Mascara", "Mohammadia", "Sig", "Tighenif", "Ghriss"] },
    { "wilaya": "Ouargla", "towns": ["Ouargla", "Touggourt", "Hassi Messaoud", "Rouissat", "Nezla"] },
    { "wilaya": "Oran", "towns": ["Oran", "Arzew", "Bir El Djir", "Es Senia", "Gdyel", "Hassi Bounif", "Mers El Kébir"] },
    { "wilaya": "El Bayadh", "towns": ["El Bayadh", "Bougtob", "Chellala", "Brezina", "Rogassa"] },
    { "wilaya": "Illizi", "towns": ["Illizi", "Djanet", "Debdeb", "Bordj Omar Driss"] },
    { "wilaya": "Bordj Bou Arréridj", "towns": ["Bordj Bou Arréridj", "Ras El Oued", "Ain Taghrout", "Mansoura", "Bordj Ghedir"] },
    { "wilaya": "Boumerdès", "towns": ["Boumerdès", "Dellys", "Boudouaou", "Khemis El Khechna", "Thenia"] },
    { "wilaya": "El Tarf", "towns": ["El Tarf", "El Kala", "Ben M'hidi", "Drean", "Bouteldja"] },
    { "wilaya": "Tindouf", "towns": ["Tindouf", "Oum El Assel"] },
    { "wilaya": "Tissemsilt", "towns": ["Tissemsilt", "Theniet El Had", "Bordj Bounaama", "Lardjem"] },
    { "wilaya": "El Oued", "towns": ["El Oued", "Guemar", "Debila", "Robbah", "Magrane"] },
    { "wilaya": "Khenchela", "towns": ["Khenchela", "Chechar", "Ain Touila", "Kaïs", "Babar"] },
    { "wilaya": "Souk Ahras", "towns": ["Souk Ahras", "Sedrata", "Taoura", "M'daourouch", "Haddada"] },
    { "wilaya": "Tipaza", "towns": ["Tipaza", "Cherchell", "Fouka", "Hadjeret Ennous", "Kolea", "Staoueli"] },
    { "wilaya": "Mila", "towns": ["Mila", "Chelghoum Laïd", "Grarem Gouga", "Tadjenanet", "Rouached"] },
    { "wilaya": "Aïn Defla", "towns": ["Aïn Defla", "Khemis Miliana", "El Attaf", "Miliana", "Boumedfaa"] },
    { "wilaya": "Naâma", "towns": ["Naâma", "Mecheria", "Ain Sefra", "Tiout", "Moghrar"] },
    { "wilaya": "Ain Témouchent", "towns": ["Ain Témouchent", "Hammam Bou Hadjar", "Beni Saf", "El Amria", "Ain Kihal"] },
    { "wilaya": "Ghardaïa", "towns": ["Ghardaïa", "El Atteuf", "Berriane", "Daya Ben Dahoua", "Metlili"] },
    { "wilaya": "Relizane", "towns": ["Relizane", "Oued Rhiou", "Mazouna", "Zemoura", "Ain Rahma"] }
];


// VIZO color palette for consistency
const VizoColors = {
  PrimaryDark: '#1A2A3A',
  AccentOrange: '#E66B3B',
  LightText: '#FFFFFF',
  DarkText: '#333333', // Adjusted for better contrast on light backgrounds
  NeutralBlue: '#6A8DAD',
  OffWhite: '#F9F9F9',
  GradientPurple: '#9D50BB',
  GradientYellow: '#F2D50F',
  SoftHighlight: '#A0AEC0'
};

// Helper function to format currency as DZD
const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(2)} DZD`; // Ensure it's a float and display 2 decimal places
};

/**
 * CheckoutPage Component
 * This component guides the user through the final steps of the purchase,
 * displaying a summary of selected items, collecting customer information,
 * and processing the order. It features interactive forms, validation,
 * and a clear call to action.
 *
 * @param {object} props - The component's properties.
 * @param {Array<object>} props.selectedItems - An array of cart items chosen for checkout.
 * @param {function(object): void} props.onPlaceOrder - Callback to handle the order placement logic (in App.js).
 * @param {function(): void} props.onClearCart - Callback to clear the cart after a successful order.
 * @param {function(string, any?): void} props.onNavigate - Callback function to handle page navigation.
 * @param {object} props.db - The Firestore database instance.
 * @param {object} props.auth - The Firebase Auth instance.
 * @param {string} props.appId - The application ID used in Firestore collection paths.
 */
const CheckoutPage = ({ selectedItems, onPlaceOrder, onClearCart, onNavigate, db, auth, appId }) => {
  // --- State Management for Form Data ---
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    town: '',
    wilaya: '', // Represents a province/state in Algeria
  });
  const [formErrors, setFormErrors] = useState({}); // Stores validation errors for form fields.
  const [isSubmitting, setIsSubmitting] = useState(false); // Controls loading state for form submission.
  const [isOrderPlaced, setIsOrderPlaced] = useState(false); // Tracks if an order has been successfully placed.

  // State for dynamic shipping cost based on selected Wilaya
  const [shippingCost, setShippingCost] = useState(0); // Initial shipping cost

  const { t } = useLanguage(); // For internationalization

  // --- Derived State/Calculations ---
  // Calculate the total price of all selected items.
  const subtotal = useMemo(() =>
    selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [selectedItems]
  );
  const totalAmount = subtotal + shippingCost; // Final total for the order.

  // --- Shipping Cost Logic (Dynamic based on Wilaya) ---
  useEffect(() => {
    let calculatedCost = 0;
    const selectedWilayaData = algeriaLocations.find(loc => loc.wilaya === customerInfo.wilaya);

    if (customerInfo.wilaya) {
      // Example dynamic shipping costs:
      if (customerInfo.wilaya === "Blida" || customerInfo.wilaya === "Alger") {
        calculatedCost = 500; // Local rate
      } else if (selectedWilayaData && ["Oran", "Constantine", "Sétif"].includes(customerInfo.wilaya)) {
        calculatedCost = 700; // Regional rate
      } else if (selectedWilayaData) {
        calculatedCost = 1000; // Further wilayas
      }
    }
    setShippingCost(calculatedCost);
  }, [customerInfo.wilaya]); // Recalculate when selected wilaya changes

  // --- Form Validation Logic (Memoized) ---
  const validateForm = useCallback(() => {
    const errors = {};
    if (!customerInfo.fullName.trim()) errors.fullName = t('checkout.errors.fullNameRequired');
    if (!customerInfo.email.trim()) {
      errors.email = t('checkout.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      errors.email = t('checkout.errors.emailInvalid');
    }
    if (!customerInfo.phone.trim()) {
      errors.phone = t('checkout.errors.phoneRequired');
    } else if (!/^\+?[0-9]{8,15}$/.test(customerInfo.phone)) {
      errors.phone = t('checkout.errors.phoneInvalid');
    }
    if (!customerInfo.address.trim()) errors.address = t('checkout.errors.addressRequired');
    if (!customerInfo.town.trim()) errors.town = t('checkout.errors.townRequired');
    if (!customerInfo.wilaya.trim()) errors.wilaya = t('checkout.errors.wilayaRequired');

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [customerInfo, t]); // Add 't' to dependencies for i18n

  // --- Event Handlers ---

  /**
   * Handles changes in the customer information form fields.
   * Updates the `customerInfo` state and clears any related validation errors.
   * This is a generic handler for all text inputs.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - The change event object.
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCustomerInfo(prevInfo => ({ ...prevInfo, [name]: value }));
    setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' })); // Clear error on input change.
  }, []);

  /**
   * Handles changes specifically for the Wilaya field from WilayaTownSelector.
   * @param {string} wilaya - The new wilaya value.
   */
  const handleWilayaChange = useCallback((wilaya) => {
    setCustomerInfo(prevInfo => ({ ...prevInfo, wilaya: wilaya, town: '' })); // Clear town when wilaya changes
    setFormErrors(prevErrors => ({ ...prevErrors, wilaya: '' }));
  }, []);

  /**
   * Handles changes specifically for the Town field from WilayaTownSelector.
   * @param {string} town - The new town value.
   */
  const handleTownChange = useCallback((town) => {
    setCustomerInfo(prevInfo => ({ ...prevInfo, town: town }));
    setFormErrors(prevErrors => ({ ...prevErrors, town: '' }));
  }, []);


  /**
   * Handles the "Place Order" button click.
   * Performs form validation, constructs the order object, and calls `onPlaceOrder` prop.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmitOrder = useCallback(async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload).

    if (!validateForm()) {
      console.error(t('checkout.validationFailed'));
      // Optionally scroll to the first error or show a summary message.
      return;
    }

    if (!db || !auth || !auth.currentUser || !appId) {
      console.error(t('checkout.firebaseInitError'));
      alert(t('checkout.connectionErrorAlert'));
      return;
    }

    setIsSubmitting(true); // Set submitting state to true (for loading indicator).

    const orderData = {
      customerInfo: customerInfo,
      items: selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
      summary: {
        subtotal: subtotal,
        shipping: shippingCost,
        total: totalAmount,
      },
      userId: auth.currentUser.uid, // User ID of the person placing the order
      placedAt: serverTimestamp(), // Use serverTimestamp for precise server-side timestamp
      orderStatus: 'Pending Call', // Initial status for new orders
    };

    try {
      // Firestore path: artifacts/{appId}/public/data/orders
      const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);
      await addDoc(ordersCollectionRef, orderData);
      console.log(t('checkout.orderPlacedSuccessConsole'));
      setIsOrderPlaced(true); // Indicate success.
      onPlaceOrder(orderData); // Call parent's callback with order details.
      onClearCart(); // Clear the cart after successful order.
      setIsSubmitting(false); // Reset submitting state after success
    } catch (error) {
      console.error(t('checkout.orderPlacementErrorConsole'), error);
      alert(`${t('checkout.orderPlacementErrorAlert')} ${error.message}`); // Show error to user.
      setIsSubmitting(false); // Reset submitting state on error.
      setIsOrderPlaced(false); // Ensure order placed state is false on error.
    }
  }, [customerInfo, selectedItems, subtotal, shippingCost, totalAmount, validateForm, onPlaceOrder, onClearCart, db, auth, appId, t]);

  // --- Render Sections ---

  /**
   * Renders the order summary section.
   */
  const renderOrderSummary = () => (
    <div className={`bg-[${VizoColors.OffWhite}] p-6 rounded-xl shadow-lg border border-[${VizoColors.SoftHighlight}]/50 animate-fade-in-up md:sticky md:top-24`}>
      <h3 className={`text-2xl font-bold text-[${VizoColors.PrimaryDark}] mb-4 border-b pb-3 border-[${VizoColors.SoftHighlight}]/30`}>
        {t('checkout.orderSummaryTitle')}
      </h3>
      <div className={`space-y-3 text-[${VizoColors.NeutralBlue}]`}>
        {selectedItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-lg">
            <span className={`font-medium line-clamp-1 flex-grow pr-2 text-[${VizoColors.DarkText}]`}>{item.name} (x{item.quantity})</span>
            <span className={`font-semibold text-[${VizoColors.PrimaryDark}]`}>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className={`pt-3 border-t border-[${VizoColors.SoftHighlight}]/30 text-lg`}>
          <div className="flex justify-between py-1">
            <span>{t('checkout.subtotal')}:</span>
            <span className={`font-semibold text-[${VizoColors.DarkText}]`}>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>{t('checkout.shipping')}:</span>
            <span className={`font-semibold text-[${VizoColors.DarkText}]`}>
              {customerInfo.wilaya ? formatCurrency(shippingCost) : t('checkout.selectWilayaForShipping')}
            </span>
          </div>
          <div className={`flex justify-between items-center pt-3 border-t border-dashed border-[${VizoColors.SoftHighlight}]/50 text-xl font-bold text-[${VizoColors.PrimaryDark}]`}>
            <span>{t('checkout.total')}:</span>
            <span className={`text-[${VizoColors.AccentOrange}] text-3xl`}>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Renders the customer information form.
   */
  const renderCustomerInfoForm = () => (
    <form onSubmit={handleSubmitOrder} className={`bg-[${VizoColors.OffWhite}] p-6 md:p-8 rounded-xl shadow-xl border border-[${VizoColors.SoftHighlight}]/50 animate-fade-in-up delay-100`}>
      <h3 className={`text-2xl font-bold text-[${VizoColors.PrimaryDark}] mb-6 border-b pb-3 border-[${VizoColors.SoftHighlight}]/30`}>
        {t('checkout.shippingInformationTitle')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className={`block text-sm font-medium text-[${VizoColors.DarkText}] mb-2`}>{t('checkout.fullNameLabel')}</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={customerInfo.fullName}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-[${VizoColors.AccentOrange}] focus:border-transparent transition-all duration-200 ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('checkout.fullNamePlaceholder')}
          />
          {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
        </div>
        {/* Email */}
        <div>
          <label htmlFor="email" className={`block text-sm font-medium text-[${VizoColors.DarkText}] mb-2`}>{t('checkout.emailLabel')}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-[${VizoColors.AccentOrange}] focus:border-transparent transition-all duration-200 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('checkout.emailPlaceholder')}
          />
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
        </div>
        {/* Phone Number */}
        <div className="md:col-span-2">
          <label htmlFor="phone" className={`block text-sm font-medium text-[${VizoColors.DarkText}] mb-2`}>{t('checkout.phoneLabel')}</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-[${VizoColors.AccentOrange}] focus:border-transparent transition-all duration-200 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('checkout.phonePlaceholder')}
          />
          {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
        </div>
        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className={`block text-sm font-medium text-[${VizoColors.DarkText}] mb-2`}>{t('checkout.addressLabel')}</label>
          <input
            type="text"
            id="address"
            name="address"
            value={customerInfo.address}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-[${VizoColors.AccentOrange}] focus:border-transparent transition-all duration-200 ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={t('checkout.addressPlaceholder')}
          />
          {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
        </div>

        {/* Wilaya and Town Selectors (using WilayaTownSelector component) */}
        <WilayaTownSelector
          selectedWilaya={customerInfo.wilaya}
          selectedTown={customerInfo.town}
          onWilayaChange={handleWilayaChange}
          onTownChange={handleTownChange}
          wilayaError={formErrors.wilaya}
          townError={formErrors.town}
          locations={algeriaLocations} // Pass the locations data
          VizoColors={VizoColors} // Pass VizoColors for internal styling consistency
        />

      </div>
      {/* Place Order Button */}
      <div className="mt-8 text-center">
        <button
          type="submit"
          className={`
            bg-[${VizoColors.PrimaryDark}] text-[${VizoColors.LightText}] 
            px-10 py-4 rounded-full text-xl font-bold shadow-xl
            hover:bg-[${VizoColors.AccentOrange}] hover:shadow-2xl 
            transition-all duration-300 transform hover:scale-105
            focus:outline-none focus:ring-4 focus:ring-[${VizoColors.SoftHighlight}]/50
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md
            flex items-center justify-center mx-auto
          `}
          disabled={isSubmitting || selectedItems.length === 0 || isOrderPlaced} // Disable if submitting or no items or order placed
          aria-label={t('checkout.placeOrderButtonLabel')}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('checkout.placingOrder')}
            </>
          ) : isOrderPlaced ? (
            t('checkout.orderPlacedSuccessButton')
          ) : (
            `${t('checkout.placeOrderButton')} (${formatCurrency(totalAmount)})`
          )}
        </button>
        {isOrderPlaced && (
          <p className={`mt-4 text-green-600 font-semibold text-lg animate-fade-in`}>
            {t('checkout.orderPlacedThankYou')}
          </p>
        )}
      </div>
    </form>
  );

  // --- Main Render Logic ---
  if (selectedItems.length === 0 && !isOrderPlaced) {
    return (
      <div className={`text-center py-20 bg-[${VizoColors.OffWhite}] rounded-xl shadow-lg border border-[${VizoColors.SoftHighlight}]/50 m-4 md:m-8 w-full max-w-4xl animate-fade-in`}>
        <p className={`text-2xl font-semibold text-[${VizoColors.NeutralBlue}] mb-6`}>
          {t('checkout.noItemsSelected')}
        </p>
        <p className={`text-lg text-[${VizoColors.DarkText}] mb-8`}>
          {t('checkout.goBackToCartPrompt')}
        </p>
        <button
          onClick={() => onNavigate('cart')}
          className={`bg-[${VizoColors.PrimaryDark}] text-[${VizoColors.LightText}] 
            px-8 py-4 rounded-full text-lg font-semibold shadow-xl
            hover:bg-[${VizoColors.AccentOrange}] hover:shadow-2xl 
            transition-all duration-300 transform hover:scale-105
            focus:outline-none focus:ring-4 focus:ring-[${VizoColors.SoftHighlight}]/50`
          }
          aria-label={t('checkout.goToCartButton')}
        >
          {t('checkout.goToCartButton')}
        </button>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 md:p-8 bg-[${VizoColors.OffWhite}] rounded-xl shadow-lg m-4 md:m-8 w-full max-w-6xl border border-[${VizoColors.SoftHighlight}]/50 animate-fade-in`}>
      <h2 className={`text-4xl md:text-5xl font-bold text-[${VizoColors.PrimaryDark}] mb-8 text-center drop-shadow-sm`}>
        <span className={`text-[${VizoColors.AccentOrange}]`}>{t('checkout.titleHighlight')}</span> {t('checkout.titleRest')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {renderCustomerInfoForm()}
        {renderOrderSummary()}
      </div>

      {/* Global Styles for Font and Pattern (if needed, or move to App.js's style block) */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #f0f2f5; /* A light background for the page */
        }
        
        /* Custom form input and label styles for better consistency */
        .form-label {
          display: block;
          font-size: 0.875rem; /* text-sm */
          font-weight: 500; /* font-medium */
          color: ${VizoColors.DarkText};
          margin-bottom: 0.5rem; /* mb-2 */
        }
        
        .form-input {
          width: 100%;
          padding: 0.75rem; /* p-3 */
          border-width: 1px; /* border */
          border-radius: 0.375rem; /* rounded-md */
          border-color: ${VizoColors.SoftHighlight}; /* border-gray-300 */
          transition: all 0.2s ease-in-out; /* transition-all duration-200 */
        }
        
        .form-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px ${VizoColors.AccentOrange}; /* focus:ring-2 focus:ring-accent-orange */
          border-color: transparent; /* focus:border-transparent */
        }
        
        .form-input.border-red-500 {
          border-color: #ef4444; /* red-500 */
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;