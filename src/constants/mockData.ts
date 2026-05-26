export interface SellerBuyer {
  id: string;
  name: string;
  role: 'buyer' | 'seller';
  crop: string;
  price: string;
  quantity: string;
  distance: string;
  location: string;
  state?: string;
  district?: string;
  mandal?: string;
  phone: string;
  rating: number;
  avatar: string;
}

export interface CropTimelineEvent {
  id: string;
  title: string;
  phase: string;
  dayRange: string;
  description: string;
  completed: boolean;
  type: 'sowing' | 'irrigation' | 'fertilization' | 'pesticide' | 'harvest';
}

export interface Disease {
  id: string;
  name: string;
  crop: string;
  confidence: string;
  symptoms: string[];
  treatments: string[];
  organicRemedy: string;
  chemicalRemedy: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'tools';
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  seller: string;
  description: string;
  image: string;
  inStock: boolean;
}

export interface GovtScheme {
  id: string;
  title: string;
  subsidy: string;
  description: string;
  eligibility: string;
  documentsNeeded: string[];
  link: string;
}

export const mockSellersBuyers: SellerBuyer[] = [
  {
    id: 'sb1',
    name: 'Rajesh Kumar',
    role: 'seller',
    crop: 'Wheat',
    price: '₹25/kg',
    quantity: '500kg',
    distance: '2.4 km away',
    location: 'Karnal Mandi',
    state: 'Haryana',
    district: 'Karnal',
    mandal: 'KARNAL',
    phone: '+919876543210',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'sb2',
    name: 'Sunita Devi',
    role: 'seller',
    crop: 'Rice',
    price: '₹68/kg',
    quantity: '1200kg',
    distance: '5.8 km away',
    location: 'Nellore Market Yard',
    state: 'Andhra Pradesh',
    district: 'Nellore',
    mandal: 'NELLORE',
    phone: '+919876543211',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'sb3',
    name: 'Amit Singh',
    role: 'seller',
    crop: 'Maize',
    price: '₹18/kg',
    quantity: '800kg',
    distance: '3.1 km away',
    location: 'Anand Cooperative',
    state: 'Gujarat',
    district: 'Anand',
    mandal: 'ANAND',
    phone: '+919876543212',
    rating: 4.5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'sb4',
    name: 'Sukhwinder Singh',
    role: 'seller',
    crop: 'Sugarcane',
    price: '₹35/kg',
    quantity: '5000kg',
    distance: '7.3 km away',
    location: 'Jalandhar Sugar Mill Yard',
    state: 'Punjab',
    district: 'Jalandhar',
    mandal: 'JALANDHAR',
    phone: '+919876543213',
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
  },
];

export const mockCropTimeline: Record<string, CropTimelineEvent[]> = {
  Rice: [
    {
      id: 'cr1',
      title: 'Nursery Bed Preparation & Sowing',
      phase: 'Sowing',
      dayRange: 'Day 1 - 15',
      description: 'Prepare wet nursery beds, sow treated seeds, and maintain thin layer of water.',
      completed: true,
      type: 'sowing',
    },
    {
      id: 'cr2',
      title: 'Transplanting to Main Field',
      phase: 'Transplanting',
      dayRange: 'Day 20 - 25',
      description: 'Transplant 21-25 days old seedlings with 2-3 seedlings per hill at shallow depth.',
      completed: true,
      type: 'sowing',
    },
    {
      id: 'cr3',
      title: 'First Irrigation & Weeding',
      phase: 'Vegetative',
      dayRange: 'Day 30 - 35',
      description: 'Maintain 2-5 cm standing water. Perform manual weeding or apply pre-emergence herbicide.',
      completed: false,
      type: 'irrigation',
    },
    {
      id: 'cr4',
      title: 'Top Dressing (Nitrogen/Urea)',
      phase: 'Tillering',
      dayRange: 'Day 45 - 50',
      description: 'Apply the second dose of Nitrogen fertilizer (Urea) at active tillering stage.',
      completed: false,
      type: 'fertilization',
    },
    {
      id: 'cr5',
      title: 'Stem Borer & Blast Disease Check',
      phase: 'Panicle Initiation',
      dayRange: 'Day 70 - 75',
      description: 'Monitor fields for stem borer moths and blast lesions. Apply organic neem oil spray if needed.',
      completed: false,
      type: 'pesticide',
    },
    {
      id: 'cr6',
      title: 'Drain Field & Final Harvest',
      phase: 'Maturity & Harvest',
      dayRange: 'Day 110 - 120',
      description: 'Drain the field 10 days before expected harvest. Harvest when grains turn golden-yellow.',
      completed: false,
      type: 'harvest',
    },
  ],
  Wheat: [
    {
      id: 'cw1',
      title: 'Field Preparation & Sowing',
      phase: 'Sowing',
      dayRange: 'Day 1 - 5',
      description: 'Prepare fine seedbed and sow seeds at 4-5 cm depth using a seed drill.',
      completed: true,
      type: 'sowing',
    },
    {
      id: 'cw2',
      title: 'Crown Root Initiation (CRI) Irrigation',
      phase: 'Tillering',
      dayRange: 'Day 20 - 25',
      description: 'CRITICAL STAGE: Provide first irrigation. Failing to irrigate now reduces yield by 30%.',
      completed: true,
      type: 'irrigation',
    },
    {
      id: 'cw3',
      title: 'First Top Dressing (Urea)',
      phase: 'Tillering',
      dayRange: 'Day 25 - 30',
      description: 'Broadcast Urea fertilizer immediately after the first irrigation.',
      completed: false,
      type: 'fertilization',
    },
    {
      id: 'cw4',
      title: 'Jointing Stage Irrigation & Weed Control',
      phase: 'Jointing',
      dayRange: 'Day 40 - 45',
      description: 'Give the second irrigation and remove broad-leaved weeds.',
      completed: false,
      type: 'irrigation',
    },
    {
      id: 'cw5',
      title: 'Flowering & Grain Filling Irrigation',
      phase: 'Flowering',
      dayRange: 'Day 75 - 80',
      description: 'Ensure soil has enough moisture during flowering and soft dough stages.',
      completed: false,
      type: 'irrigation',
    },
    {
      id: 'cw6',
      title: 'Harvesting',
      phase: 'Maturity',
      dayRange: 'Day 120 - 130',
      description: 'Harvest when the straw turns golden yellow, dry and brittle.',
      completed: false,
      type: 'harvest',
    },
  ],
};

export const mockDiseases: Disease[] = [
  {
    id: 'd1',
    name: 'Rice Blast (Magnaporthe oryzae)',
    crop: 'Rice',
    confidence: '94%',
    symptoms: [
      'Diamond or spindle-shaped lesions on leaves with gray/white centers and brown borders.',
      'Brown or black lesions on the neck of the panicle, causing it to fall over (neck blast).',
      'Grayish spots on grains.',
    ],
    treatments: [
      'Avoid excessive application of Nitrogen fertilizer.',
      'Maintain proper water level in the fields to prevent moisture stress.',
      'Use blast-resistant seed varieties in the next cycle.',
    ],
    organicRemedy: 'Spray Pseudomonas fluorescens formulation (10g/liter of water) or Neem Oil solution (3%) at the first sign of symptoms.',
    chemicalRemedy: 'Apply Tricyclazole 75 WP at 0.6 grams per liter of water, or Tricyclazole + Mancozeb combination.',
  },
  {
    id: 'd2',
    name: 'Tomato Late Blight (Phytophthora infestans)',
    crop: 'Tomato',
    confidence: '97%',
    symptoms: [
      'Dark, water-soaked spots on leaves that turn brown/black rapidly.',
      'White fungal growth on the underside of leaves in humid conditions.',
      'Large, firm, dark brown greasy lesions on tomato fruits.',
    ],
    treatments: [
      'Remove and destroy infected plants immediately (do not compost).',
      'Provide good aeration and avoid overhead watering (use drip irrigation).',
      'Apply mulch to prevent spores from splashing up from the soil.',
    ],
    organicRemedy: 'Apply copper-based organic fungicides or spray baking soda-based sprays weekly during high humidity.',
    chemicalRemedy: 'Spray Metalaxyl-M + Mancozeb (Ridomil Gold) at 2g per liter of water at 10-day intervals.',
  },
  {
    id: 'd3',
    name: 'Leaf Rust (Puccinia recondita)',
    crop: 'Wheat',
    confidence: '89%',
    symptoms: [
      'Small, round, orange-brown pustules on the upper surface of leaves.',
      'Pustules rub off on fingers leaving an orange rust-like powder.',
      'Early yellowing and premature drying of leaves.',
    ],
    treatments: [
      'Sow rust-resistant varieties approved for your region.',
      'Avoid late sowing to prevent exposing plants to high temperatures and humidity.',
      'Remove weed hosts from bunds.',
    ],
    organicRemedy: 'Foliar spray of garlic extract mixed with neem oil (5% concentration) to inhibit spore germination.',
    chemicalRemedy: 'Apply Propiconazole 25 EC (Tilt) at 1 ml per liter of water as soon as rust pustules appear.',
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Hybrid Paddy Seeds (Sardar 29)',
    category: 'seeds',
    price: '₹550',
    originalPrice: '₹650',
    rating: 4.6,
    reviews: 120,
    seller: 'Mahalaxmi Agro Center',
    description: 'High-yielding hybrid paddy seeds, drought-resistant, matures in 115 days. Yield potential of 28-30 quintals/acre.',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=300&auto=format&fit=crop',
    inStock: true,
  },
  {
    id: 'p2',
    name: 'Organic Neem Fertilizer Cake',
    category: 'fertilizers',
    price: '₹350',
    originalPrice: '₹400',
    rating: 4.8,
    reviews: 84,
    seller: 'EcoGrow Organic Solutions',
    description: '100% organic neem oil cake meal. Acts as both a natural nitrogen-rich fertilizer and pest repellent protecting roots from nematodes.',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=300&auto=format&fit=crop',
    inStock: true,
  },
  {
    id: 'p3',
    name: 'Power Sprayer (16L Battery Operated)',
    category: 'tools',
    price: '₹2,200',
    originalPrice: '₹2,800',
    rating: 4.4,
    reviews: 215,
    seller: 'Krishi Tools Ltd.',
    description: 'Dual-mode battery-operated and manual back sprayer. Includes a 12V 8AH battery, high-pressure pump, and 4 nozzles.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=300&auto=format&fit=crop',
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Broad-Spectrum Bio-Pesticide (Neem Shield)',
    category: 'pesticides',
    price: '₹480',
    originalPrice: '₹520',
    rating: 4.7,
    reviews: 62,
    seller: 'Green Earth Bio Tech',
    description: 'Concentrated cold-pressed neem oil bio-pesticide with 1500 PPM Azadirachtin. Controls sucking and chewing insects naturally.',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop',
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Drip Irrigation Kit (1 Acre Setup)',
    category: 'tools',
    price: '₹8,500',
    originalPrice: '₹9,999',
    rating: 4.9,
    reviews: 38,
    seller: 'Krishi Tools Ltd.',
    description: 'Complete drip irrigation starter kit including main supply pipe, lateral tubes, emitters, filters, and connectors for up to 1 acre of vegetable farm.',
    image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=300&auto=format&fit=crop',
    inStock: false,
  },
];

export const mockGovtSchemes: GovtScheme[] = [
  {
    id: 's1',
    title: 'PM-KISAN Samman Nidhi',
    subsidy: '₹6,000 / year cash benefit',
    description: 'Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families across the country.',
    eligibility: 'All landholding farmer families with cultivable land in their names.',
    documentsNeeded: ['Aadhaar Card', 'Land Ownership Documents (Khatauni)', 'Bank Account Details'],
    link: 'https://pmkisan.gov.in',
  },
  {
    id: 's2',
    title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    subsidy: '40% - 50% Subsidy on Farm Machinery',
    description: 'Financial assistance for purchasing tractors, power tillers, rotavators, sprayers, and harvesting machinery to promote mechanization.',
    eligibility: 'Individual small and marginal farmers, women farmers, and Self-Help Groups (SHGs).',
    documentsNeeded: ['Aadhaar Card', 'Land proof', 'Category Certificate (SC/ST/OBC)', 'Bank details'],
    link: 'https://agrimachinery.nic.in',
  },
  {
    id: 's3',
    title: 'PM Krishi Sinchayee Yojana (Micro-Irrigation)',
    subsidy: 'Up to 80% Subsidy on Drip/Sprinkler Systems',
    description: 'Encouraging farmers to adopt water-saving micro-irrigation systems like drip and sprinkler with substantial capital subsidy.',
    eligibility: 'Farmers having cultivable land with operational water source. Groups of farmers and cooperatives are also eligible.',
    documentsNeeded: ['Soil/Water source certificate', 'Land map (Patta/Adangal)', 'Aadhaar Card', 'Quotations from approved irrigation suppliers'],
    link: 'https://pmksy.gov.in',
  },
];
