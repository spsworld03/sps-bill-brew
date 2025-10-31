// Global bill records storage
export interface StoredBillItem {
  name: string;
  qty: number;
  price: number;
}

export interface StoredBillRecord {
  billNo: string;
  date: string;
  customer: string;
  phone: string;
  paymentMode: string;
  subtotal: number;
  discount: number;
  total: number;
  items: StoredBillItem[];
}

// Global array to store bill records
export const billRecords: StoredBillRecord[] = [];

// Function to add a new bill record
export const addBillRecord = (record: StoredBillRecord) => {
  billRecords.push(record);
  
  // Also save to localStorage for persistence
  try {
    localStorage.setItem('billRecords', JSON.stringify(billRecords));
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('billsUpdated'));
  } catch (error) {
    console.error('Failed to save bill records to localStorage:', error);
  }
};

// Function to load bill records from localStorage on app start
export const loadBillRecords = () => {
  try {
    const saved = localStorage.getItem('billRecords');
    if (saved) {
      const records = JSON.parse(saved);
      billRecords.length = 0; // Clear array
      billRecords.push(...records); // Add all saved records
    }
  } catch (error) {
    console.error('Failed to load bill records from localStorage:', error);
  }
};

// Function to get all bill records
export const getAllBillRecords = (): StoredBillRecord[] => {
  return [...billRecords];
};
