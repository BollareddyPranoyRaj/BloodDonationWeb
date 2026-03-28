const SELECTED_EVENT_KEY = 'selectedBloodDonationEvent';

export const getStoredSelectedEvent = () => {
  try {
    const storedValue = localStorage.getItem(SELECTED_EVENT_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch (error) {
    console.error('Failed to read selected event from storage:', error);
    return null;
  }
};

export const storeSelectedEvent = (event) => {
  try {
    localStorage.setItem(SELECTED_EVENT_KEY, JSON.stringify(event));
  } catch (error) {
    console.error('Failed to store selected event:', error);
  }
};

export const clearStoredSelectedEvent = () => {
  try {
    localStorage.removeItem(SELECTED_EVENT_KEY);
  } catch (error) {
    console.error('Failed to clear selected event:', error);
  }
};
