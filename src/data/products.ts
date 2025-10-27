export interface Product {
  code: string;
  description: string;
  price: number;
  category: string;
}

export const products: Product[] = [
  // T-shirts
  { code: "TS1", description: "T-shirt - Basic", price: 250, category: "T-shirt" },
  { code: "TS2", description: "T-shirt - Premium", price: 275, category: "T-shirt" },
  { code: "TS3", description: "T-shirt - Deluxe", price: 300, category: "T-shirt" },
  
  // Round Neck T-shirts
  { code: "RN1", description: "Round Neck T-shirt - Basic", price: 150, category: "Round Neck T-shirt" },
  { code: "RN2", description: "Round Neck T-shirt - Standard", price: 200, category: "Round Neck T-shirt" },
  { code: "RN3", description: "Round Neck T-shirt - Premium", price: 225, category: "Round Neck T-shirt" },
  { code: "RN4", description: "Round Neck T-shirt - Deluxe", price: 250, category: "Round Neck T-shirt" },
  
  // Shorts
  { code: "S1", description: "Shorts - Basic", price: 200, category: "Shorts" },
  { code: "S2", description: "Shorts - Standard", price: 225, category: "Shorts" },
  { code: "S3", description: "Shorts - Premium", price: 250, category: "Shorts" },
  { code: "S4", description: "Shorts - Deluxe", price: 275, category: "Shorts" },
  { code: "S5", description: "Shorts - Ultra", price: 300, category: "Shorts" },
  
  // Track
  { code: "T1", description: "Track - Basic", price: 250, category: "Track" },
  { code: "T2", description: "Track - Standard", price: 275, category: "Track" },
  { code: "T3", description: "Track - Premium", price: 300, category: "Track" },
  { code: "T4", description: "Track - Ultra", price: 400, category: "Track" },
  
  // Sleeve
  { code: "SL1", description: "Sleeve - Basic", price: 150, category: "Sleeve" },
  { code: "SL2", description: "Sleeve - Standard", price: 200, category: "Sleeve" },
  { code: "SL3", description: "Sleeve - Premium", price: 225, category: "Sleeve" },
  
  // Tights
  { code: "TI1", description: "Tights - Basic", price: 200, category: "Tights" },
  { code: "TI2", description: "Tights - Standard", price: 250, category: "Tights" },
  { code: "TI3", description: "Tights - Premium", price: 300, category: "Tights" },
  { code: "TI4", description: "Tights - Ultra", price: 350, category: "Tights" },
];

export const getProductByCode = (code: string): Product | undefined => {
  return products.find((p) => p.code === code);
};
