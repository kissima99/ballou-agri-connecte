export const showSuccess = (message: string) => {
  console.log(`✅ Success: ${message}`);
};

export const showError = (message: string) => {
  console.error(`❌ Error: ${message}`);
};

export const clearPurchaseHistory = () => {
  localStorage.removeItem('purchase_history');
};