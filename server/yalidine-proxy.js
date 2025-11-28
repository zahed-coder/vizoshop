const express = require('express');
const cors = require('cors');
const app = express();

// CORS for all your domains
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://zshop-a0b8c.web.app',
    'https://zshop-a0b8c.firebaseapp.com',
    'https://vizoshop.up.railway.app',  // 🎯 YOUR RAILWAY FRONTEND
    'https://*.railway.app',            // 🎯 ALL RAILWAY DOMAINS
    'https://*.railpack.app',
   'https://vizofashion.com',  // 🆕 ADD YOUR CUSTOM DOMAIN
    'https://www.vizofashion.com' // 🆕 ADD WWW VERSION TOO
  ],
  credentials: true
}));

app.use(express.json());

// Complete Wilaya ID Mapping (All 58 Wilayas)
const wilayaMapping = {
  'Adrar': 1, 'Chlef': 2, 'Laghouat': 3, 'Oum El Bouaghi': 4, 'Batna': 5,
  'Béjaïa': 6, 'Biskra': 7, 'Béchar': 8, 'Blida': 9, 'Bouira': 10,
  'Tamanrasset': 11, 'Tébessa': 12, 'Tlemcen': 13, 'Tiaret': 14, 'Tizi Ouzou': 15,
  'Alger': 16, 'Djelfa': 17, 'Jijel': 18, 'Sétif': 19, 'Saïda': 20,
  'Skikda': 21, 'Sidi Bel Abbès': 22, 'Annaba': 23, 'Guelma': 24, 'Constantine': 25,
  'Médéa': 26, 'Mostaganem': 27, 'M\'Sila': 28, 'Mascara': 29, 'Ouargla': 30,
  'Oran': 31, 'El Bayadh': 32, 'Illizi': 33, 'Bordj Bou Arréridj': 34, 'Boumerdès': 35,
  'El Tarf': 36, 'Tindouf': 37, 'Tissemsilt': 38, 'El Oued': 39, 'Khenchela': 40,
  'Souk Ahras': 41, 'Tipaza': 42, 'Mila': 43, 'Aïn Defla': 44, 'Naâma': 45,
  'Aïn Témouchent': 46, 'Ghardaïa': 47, 'Relizane': 48, 'El M\'Ghair': 49, 'El Menia': 50,
  'Ouled Djellal': 51, 'Bordj Baji Mokhtar': 52, 'Béni Abbès': 53, 'Timimoun': 54,
  'Touggourt': 55, 'Djanet': 56, 'In Salah': 57, 'In Guezzam': 58
};

// Common Communes ID Mapping
const communeMapping = {
  'Alger Centre': 1601, 'Sidi Mhamed': 1602, 'El Madania': 1603, 'Belouizdad': 1604,
  'Bab El Oued': 1605, 'Bordj El Kiffan': 1630, 'Dar El Beida': 1641, 'Rouiba': 1642,
  'Hussein Dey': 1606, 'Kouba': 1607, 'Djelfa': 1701, 'Aïn Oussera': 1702,
  'Hassi Bahbah': 1721, 'Oran': 3101, 'Es Senia': 3113, 'Constantine': 2501,
  'Annaba': 2301, 'Blida': 901, 'Oued El Alleug': 909, 'Setif': 1901,
  'El Eulma': 1920, 'Batna': 501, 'Mostaganem': 2701, 'Tlemcen': 1301,
  'Centre Ville': 1601, 'Ville': 1601
};

const getWilayaId = (wilayaName) => wilayaMapping[wilayaName] || 16;
const getCommuneId = (communeName) => communeMapping[communeName] || 1601;

// Yalidine API Proxy
app.post('/api/yalidine-orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    if (!orderData || orderData.length === 0) {
      throw new Error('No order data received');
    }

    const yalidineOrder = orderData[0];
    
    const fromWilayaId = getWilayaId(yalidineOrder.from_wilaya_name);
    const toWilayaId = getWilayaId(yalidineOrder.to_wilaya_name);
    const toCommuneId = getCommuneId(yalidineOrder.to_commune_name);

    const yalidinePayload = [{
      order_id: yalidineOrder.order_id,
      firstname: yalidineOrder.firstname,
      familyname: yalidineOrder.familyname || "",
      contact_phone: yalidineOrder.contact_phone,
      address: yalidineOrder.address || "Address not specified",
      to_commune_id: toCommuneId,
      to_commune_name: yalidineOrder.to_commune_name,
      to_wilaya_id: toWilayaId,
      to_wilaya_name: yalidineOrder.to_wilaya_name,
      from_wilaya_id: fromWilayaId,
      from_wilaya_name: yalidineOrder.from_wilaya_name,
      product_list: yalidineOrder.product_list,
      price: parseInt(yalidineOrder.price),
      do_insurance: false,
      declared_value: 0,
      height: 10,
      width: 20,
      length: 30,
      weight: 1,
      freeshipping: false,
      is_stopdesk: yalidineOrder.is_stopdesk || false,
      has_exchange: false
    }];

    const yalidineResponse = await fetch('https://api.yalidine.app/v1/parcels/', {
      method: 'POST',
      headers: {
        'X-API-ID': '84906738463760592260',
        'X-API-TOKEN': '2PEunXb3fj1W9ZecAKOw8iFtJHah6Spol0RsYCd5yxmGzvDrQ4VUI7gkBLMqTN',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(yalidinePayload)
    });

    if (!yalidineResponse.ok) {
      const errorText = await yalidineResponse.text();
      throw new Error(`Yalidine API error ${yalidineResponse.status}: ${errorText}`);
    }

    const result = await yalidineResponse.json();
    res.json(result);
  } catch (error) {
    console.error('Yalidine API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '🚀 Yalidine Proxy Server Running', 
    domains: [
      'localhost:3000',
      'zshop-a0b8c.web.app', 
      'vizoshop.up.railway.app'
    ]
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Yalidine Proxy Server running on port ${PORT}`);
  console.log(`🔗 CORS enabled for: Railway, Firebase, Localhost`);
});