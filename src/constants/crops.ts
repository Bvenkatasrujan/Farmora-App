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
      "Oats",
      "Sorghum",
      "Millet",
      "Rye"
    ]
  },
  {
    category: "Pulses and Legumes",
    items: [
      "Chickpeas",
      "Lentils",
      "Green peas",
      "Soybeans",
      "Kidney beans",
      "Black gram",
      "Green gram"
    ]
  },
  {
    category: "Oilseeds",
    items: [
      "Mustard",
      "Groundnuts",
      "Sunflower",
      "Rapeseed",
      "Sesame",
      "Linseed",
      "Castor"
    ]
  },
  {
    category: "Vegetables",
    items: [
      "Potato",
      "Tomato",
      "Onion",
      "Cabbage",
      "Cauliflower",
      "Carrot",
      "Radish",
      "Eggplant"
    ]
  },
  {
    category: "Cash and Industrial Crops",
    items: [
      "Sugarcane",
      "Cotton",
      "Jute",
      "Tobacco",
      "Rubber"
    ]
  },
  {
    category: "Fruits",
    items: [
      "Mango",
      "Banana",
      "Apple",
      "Orange",
      "Grapes",
      "Papaya",
      "Guava"
    ]
  }
];

// Flat array of all crops for backward compatibility and simple selection lookups
export const crops: string[] = cropCategories.reduce<string[]>((acc, cat) => {
  return [...acc, ...cat.items];
}, []);
