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

// Function to generate next bill number with dynamic leading zeros
export const getNextBillNumber = (): string => {
  let lastNumber = 0;
  
  if (billRecords.length > 0) {
    // Extract numeric part from last bill number
    const lastBill = billRecords[billRecords.length - 1];
    const match = lastBill.billNo.match(/\d+/);
    if (match) {
      lastNumber = parseInt(match[0]);
    }
  }
  
  // Increment
  const nextNumber = lastNumber + 1;
  
  // Calculate dynamic padding based on number size
  // 1-9: 2 digits (01-09), 10-99: 2 digits (10-99), 100-999: 3 digits (100-999), etc.
  const numDigits = nextNumber.toString().length;
  const minDigits = Math.max(2, numDigits); // Minimum 2 digits
  const paddedNumber = nextNumber.toString().padStart(minDigits, '0');
  
  return `SPS${paddedNumber}`;
};
