import React, { useState, useEffect, useCallback, useMemo } from 'react';

// =====================================================================
// --- Embedded Algerian Wilaya and Town Data (for self-containment) ---
// This data structure maps each Wilaya (Province) to its list of associated Towns/Communes.
// For larger datasets or if the data needs to be dynamic, it would typically be
// loaded from an external JSON file or an API.
// =====================================================================
const algeriaLocations = [
  {
    "wilaya": "Adrar",
    "towns": ["Adrar", "Tamest", "Reggane", "Bordj Badji Mokhtar", "Timimoun", "Aoulef", "Fenoughil", "Tinerkouk"]
  },
  {
    "wilaya": "Chlef",
    "towns": ["Chlef", "El Karimia", "Ouled Fares", "Tenes", "Boukadir", "Sobha", "Oued Fodda", "Ain Merane"]
  },
  {
    "wilaya": "Laghouat",
    "towns": ["Laghouat", "Aflou", "Ksar El Hirane", "Ain Madhi", "Guelt Es Stell"]
  },
  {
    "wilaya": "Oum El Bouaghi",
    "towns": ["Oum El Bouaghi", "Ain Beida", "Ain M'lila", "Ain Fakroun", "Meskhiana"]
  },
  {
    "wilaya": "Batna",
    "towns": ["Batna", "Barika", "Arris", "Merouana", "Ain Touta", "Tazoult", "Djezzar"]
  },
  {
    "wilaya": "Béjaïa",
    "towns": ["Béjaïa", "Akbou", "Amizour", "Kherrata", "El Kseur", "Sidi Aïch", "Tichy"]
  },
  {
    "wilaya": "Biskra",
    "towns": ["Biskra", "Ouled Djellal", "Sidi Okba", "Tolga", "Foughala", "El Kantara"]
  },
  {
    "wilaya": "Béchar",
    "towns": ["Béchar", "Abadla", "Beni Ounif", "Taghit", "Lahmar"]
  },
  {
    "wilaya": "Blida",
    "towns": ["Blida", "Blida", "Boufarik", "Larbaa", "Meftah", "Mouzaia", "Oued El Alleug"]
  },
  {
    "wilaya": "Bouira",
    "towns": ["Bouira", "Lakhdaria", "Sour El Ghozlane", "Ain Bessem", "El Hachimia"]
  },
  {
    "wilaya": "Tamanrasset",
    "towns": ["Tamanrasset", "Abalessa", "Tazrouk", "Idles", "Tin Zaouatine"]
  },
  {
    "wilaya": "Tébessa",
    "towns": ["Tébessa", "Bir El Ater", "Cheria", "Ouenza", "El Ma Labiodh"]
  },
  {
    "wilaya": "Tlemcen",
    "towns": ["Tlemcen", "Ghazaouet", "Maghnia", "Remchi", "Sebdou", "Hennaya"]
  },
  {
    "wilaya": "Tiaret",
    "towns": ["Tiaret", "Frenda", "Ain Deheb", "Sougueur", "Mahdia"]
  },
  {
    "wilaya": "Tizi Ouzou",
    "towns": ["Tizi Ouzou", "Ain El Hammam", "Azazga", "Bouzeguene", "Draâ Ben Khedda"]
  },
  {
    "wilaya": "Alger",
    "towns": ["Alger Centre", "Bab Ezzouar", "Bir Mourad Raïs", "Chéraga", "Dar El Beïda", "Hussein Dey", "Rouïba"]
  },
  {
    "wilaya": "Djelfa",
    "towns": ["Djelfa", "Ain Oussara", "Messaad", "Charef", "Dar Chioukh"]
  },
  {
    "wilaya": "Jijel",
    "towns": ["Jijel", "Taher", "El Milia", "Chekfa", "Ziamah"]
  },
  {
    "wilaya": "Sétif",
    "towns": ["Sétif", "El Eulma", "Bousselam", "Ain Oulmene", "Mezloug", "Beni Ouartilane"]
  },
  {
    "wilaya": "Saïda",
    "towns": ["Saïda", "Ain El Hadjar", "Sidi Boubkeur", "Youb"]
  },
  {
    "wilaya": "Skikda",
    "towns": ["Skikda", "Ramdane Djamel", "El Harrouch", "Azzaba", "Collo"]
  },
  {
    "wilaya": "Sidi Bel Abbès",
    "towns": ["Sidi Bel Abbès", "Ras El Ma", "Sfisef", "Telagh", "Ain El Berd"]
  },
  {
    "wilaya": "Annaba",
    "towns": ["Annaba", "El Bouni", "Sidi Amar", "Chetaïbi", "Berrahal"]
  },
  {
    "wilaya": "Guelma",
    "towns": ["Guelma", "Héliopolis", "Oued Zenati", "Bouchegouf", "Khezaras"]
  },
  {
    "wilaya": "Constantine",
    "towns": ["Constantine", "El Khroub", "Ain Smara", "Hamma Bouziane", "Didouche Mourad"]
  },
  {
    "wilaya": "Médéa",
    "towns": ["Médéa", "Berrouaghia", "Ksar Boukhari", "Chahbounia", "Tablat"]
  },
  {
    "wilaya": "Mostaganem",
    "towns": ["Mostaganem", "Hassi Mameche", "Ain Tedles", "Mesra", "Bouguirat"]
  },
  {
    "wilaya": "M'Sila",
    "towns": ["M'Sila", "Bou Saada", "Magra", "Sidi Aïssa", "Ouled Derradj"]
  },
  {
    "wilaya": "Mascara",
    "towns": ["Mascara", "Mohammadia", "Sig", "Tighenif", "Ghriss"]
  },
  {
    "wilaya": "Ouargla",
    "towns": ["Ouargla", "Touggourt", "Hassi Messaoud", "Rouissat", "Nezla"]
  },
  {
    "wilaya": "Oran",
    "towns": ["Oran", "Arzew", "Bir El Djir", "Es Senia", "Gdyel", "Hassi Bounif", "Mers El Kébir"]
  },
  {
    "wilaya": "El Bayadh",
    "towns": ["El Bayadh", "Bougtob", "Chellala", "Brezina", "Rogassa"]
  },
  {
    "wilaya": "Illizi",
    "towns": ["Illizi", "Djanet", "Debdeb", "Bordj Omar Driss"]
  },
  {
    "wilaya": "Bordj Bou Arréridj",
    "towns": ["Bordj Bou Arréridj", "Ras El Oued", "Ain Taghrout", "Mansoura", "Bordj Ghedir"]
  },
  {
    "wilaya": "Boumerdès",
    "towns": ["Boumerdès", "Dellys", "Boudouaou", "Khemis El Khechna", "Thenia"]
  },
  {
    "wilaya": "El Tarf",
    "towns": ["El Tarf", "El Kala", "Ben M'hidi", "Drean", "Bouteldja"]
  },
  {
    "wilaya": "Tindouf",
    "towns": ["Tindouf", "Oum El Assel"]
  },
  {
    "wilaya": "Tissemsilt",
    "towns": ["Tissemsilt", "Theniet El Had", "Bordj Bounaama", "Lardjem"]
  },
  {
    "wilaya": "El Oued",
    "towns": ["El Oued", "Guemar", "Debila", "Robbah", "Magrane"]
  },
  {
    "wilaya": "Khenchela",
    "towns": ["Khenchela", "Chechar", "Ain Touila", "Kaïs", "Babar"]
  },
  {
    "wilaya": "Souk Ahras",
    "towns": ["Souk Ahras", "Sedrata", "Taoura", "M'daourouch", "Haddada"]
  },
  {
    "wilaya": "Tipaza",
    "towns": ["Tipaza", "Cherchell", "Fouka", "Hadjeret Ennous", "Kolea", "Staoueli"]
  },
  {
    "wilaya": "Mila",
    "towns": ["Mila", "Chelghoum Laïd", "Grarem Gouga", "Tadjenanet", "Rouached"]
  },
  {
    "wilaya": "Aïn Defla",
    "towns": ["Aïn Defla", "Khemis Miliana", "El Attaf", "Miliana", "Boumedfaa"]
  },
  {
    "wilaya": "Naâma",
    "towns": ["Naâma", "Mecheria", "Ain Sefra", "Tiout", "Moghrar"]
  },
  {
    "wilaya": "Ain Témouchent",
    "towns": ["Ain Témouchent", "Hammam Bou Hadjar", "Beni Saf", "El Amria", "Ain Kihal"]
  },
  {
    "wilaya": "Ghardaïa",
    "towns": ["Ghardaïa", "El Atteuf", "Berriane", "Daya Ben Dahoua", "Metlili"]
  },
  {
    "wilaya": "Relizane",
    "towns": ["Relizane", "Oued Rhiou", "Mazouna", "Zemoura", "Ain Rahma"]
  }
];

/**
 * WilayaTownSelector Component
 * Provides two interconnected dropdowns for selecting a Wilaya (Province) and its
 * corresponding Town/Commune in Algeria. It dynamically updates the towns list
 * based on the selected wilaya and can display validation errors.
 *
 * @param {object} props - The component's properties.
 * @param {string} props.selectedWilaya - The currently selected Wilaya.
 * @param {string} props.selectedTown - The currently selected Town.
 * @param {function(string): void} props.onWilayaChange - Callback for when the Wilaya changes.
 * @param {function(string): void} props.onTownChange - Callback for when the Town changes.
 * @param {string} [props.wilayaError] - Optional error message for the Wilaya field.
 * @param {string} [props.townError] - Optional error message for the Town field.
 */
const WilayaTownSelector = ({
  selectedWilaya,
  selectedTown,
  onWilayaChange,
  onTownChange,
  wilayaError,
  townError
}) => {
  // Memoize the list of wilayas for efficiency.
  const wilayas = useMemo(() => algeriaLocations.map(location => location.wilaya).sort(), []);

  // Memoize the list of towns based on the currently selected wilaya.
  const towns = useMemo(() => {
    const foundWilaya = algeriaLocations.find(loc => loc.wilaya === selectedWilaya);
    return foundWilaya ? foundWilaya.towns.sort() : [];
  }, [selectedWilaya]); // Re-calculate towns only when selectedWilaya changes.

  // Effect to clear the selected town if the wilaya changes,
  // ensuring consistency and preventing selection of towns from old wilayas.
  useEffect(() => {
    // Only clear if the currently selected town is not found in the new list of towns,
    // or if the wilaya has changed and there's a selected town.
    if (selectedTown && !towns.includes(selectedTown)) {
      onTownChange(''); // Clear the town selection.
    }
  }, [selectedWilaya, selectedTown, towns, onTownChange]); // Dependencies for useEffect.

  /**
   * Handles the change event for the Wilaya dropdown.
   * Calls the `onWilayaChange` prop with the new wilaya value.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event.
   */
  const handleWilayaChange = useCallback((e) => {
    onWilayaChange(e.target.value);
  }, [onWilayaChange]); // `onWilayaChange` is a stable prop from CheckoutPage, could remove dependency array but keeping for strict lint.

  /**
   * Handles the change event for the Town dropdown.
   * Calls the `onTownChange` prop with the new town value.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event.
   */
  const handleTownChange = useCallback((e) => {
    onTownChange(e.target.value);
  }, [onTownChange]); // `onTownChange` is a stable prop from CheckoutPage, could remove dependency array but keeping for strict lint.

  return (
    // Grid layout for the two dropdowns, taking full width on small screens and half width on larger.
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
      {/* Wilaya (Province) Selector */}
      <div>
        <label htmlFor="wilaya-select" className="form-label">Wilaya (State)</label>
        <div className="relative">
          <select
            id="wilaya-select"
            name="wilaya"
            value={selectedWilaya}
            onChange={handleWilayaChange}
            className={`form-input appearance-none pr-10 cursor-pointer ${wilayaError ? 'border-red-500' : ''}`}
            required
            aria-required="true"
            aria-invalid={!!wilayaError}
            aria-describedby={wilayaError ? 'wilaya-error' : undefined}
          >
            <option value="" disabled>Select Wilaya</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya} value={wilaya}>
                {wilaya}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow SVG for better visual consistency */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#b3b3b3]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        {wilayaError && (
          <p id="wilaya-error" className="text-red-500 text-sm mt-1 animate-fade-in-down">{wilayaError}</p>
        )}
      </div>

      {/* Town/Commune Selector */}
      <div>
        <label htmlFor="town-select" className="form-label">Town</label>
        <div className="relative">
          <select
            id="town-select"
            name="town"
            value={selectedTown}
            onChange={handleTownChange}
            className={`form-input appearance-none pr-10 cursor-pointer ${townError ? 'border-red-500' : ''}`}
            disabled={!selectedWilaya} // Disable until a Wilaya is selected
            required
            aria-required="true"
            aria-invalid={!!townError}
            aria-describedby={townError ? 'town-error' : undefined}
          >
            <option value="" disabled>{selectedWilaya ? "Select Town" : "Select Wilaya first"}</option>
            {towns.map((town) => (
              <option key={town} value={town}>
                {town}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow SVG for better visual consistency */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#b3b3b3]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        {townError && (
          <p id="town-error" className="text-red-500 text-sm mt-1 animate-fade-in-down">{townError}</p>
        )}
      </div>
    </div>
  );
};

export default WilayaTownSelector;
