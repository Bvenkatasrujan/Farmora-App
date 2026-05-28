export interface CropCategory {
  category: string;
  items: string[];
}

export const cropCategories: CropCategory[] = [
  {
    category: "Cereals and Grains",
    items: [
      "Rice",
      "Wheat",
      "Maize",
      "Barley",
      "Millet",
      "Sorghum",
      "Ragi",
      "Bajra",
      "Jowar",
      "Oats",
      "Quinoa",
      "Buckwheat",
      "Foxtail Millet",
      "Little Millet",
      "Kodo Millet",
      "Barnyard Millet",
      "Proso Millet"
    ]
  },
  {
    category: "Pulses and Legumes",
    items: [
      "Red Gram",
      "Green Gram",
      "Black Gram",
      "Bengal Gram",
      "Horse Gram",
      "Cowpea",
      "Peas",
      "Kidney Beans",
      "Lentils",
      "Soybean",
      "Field Beans",
      "Moth Beans",
      "Rajma",
      "Chickpea",
      "Pigeon Pea",
      "Lima Beans",
      "Cluster Beans"
    ]
  },
  {
    category: "Oil Seeds",
    items: [
      "Groundnut",
      "Mustard",
      "Sunflower",
      "Sesame",
      "Castor",
      "Linseed",
      "Soybean",
      "Safflower",
      "Niger Seed",
      "Coconut",
      "Oil Palm",
      "Cottonseed"
    ]
  },
  {
    category: "Vegetables",
    items: [
      "Tomato",
      "Potato",
      "Onion",
      "Brinjal",
      "Cabbage",
      "Cauliflower",
      "Carrot",
      "Radish",
      "Beetroot",
      "Spinach",
      "Fenugreek",
      "Coriander",
      "Okra",
      "Bottle Gourd",
      "Bitter Gourd",
      "Ridge Gourd",
      "Snake Gourd",
      "Pumpkin",
      "Cucumber",
      "Capsicum",
      "Green Chilli",
      "Garlic",
      "Ginger",
      "Sweet Potato",
      "Drumstick",
      "Beans",
      "Peas",
      "Turnip",
      "Lettuce",
      "Broccoli"
    ]
  },
  {
    category: "Cash and Industrial Crops",
    items: [
      "Cotton",
      "Sugarcane",
      "Jute",
      "Tobacco",
      "Coffee",
      "Tea",
      "Rubber",
      "Cocoa",
      "Arecanut",
      "Betel Leaf",
      "Betel Nut",
      "Cashew",
      "Indigo",
      "Bamboo",
      "Hemp"
    ]
  },
  {
    category: "Fruits",
    items: [
      "Mango",
      "Banana",
      "Apple",
      "Orange",
      "Papaya",
      "Pineapple",
      "Grapes",
      "Watermelon",
      "Muskmelon",
      "Guava",
      "Pomegranate",
      "Sapota",
      "Custard Apple",
      "Jackfruit",
      "Lychee",
      "Strawberry",
      "Blueberry",
      "Cherry",
      "Pear",
      "Peach",
      "Plum",
      "Kiwi",
      "Dragon Fruit",
      "Avocado",
      "Lemon",
      "Sweet Lime",
      "Coconut",
      "Fig",
      "Dates"
    ]
  }
];

// Flat array of all crops for backward compatibility and simple selection lookups
export const crops: string[] = cropCategories.reduce<string[]>((acc, cat) => {
  return [...acc, ...cat.items];
}, []);
