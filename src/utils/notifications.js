// src/utils/notifications.js
export const showSuccessNotification = (message) => {
  // You can replace this with a proper notification library later
  alert(`Success: ${message}`);
  console.log('Success:', message);
};

export const showErrorNotification = (message) => {
  // You can replace this with a proper notification library later
  alert(`Error: ${message}`);
  console.error('Error:', message);
};

// If browser notifications are wanted instead
export const showBrowserNotification = (title, message, type = 'info') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: type === 'error' ? '/error-icon.png' : '/success-icon.png'
    });
  } else {
    // Fallback to console or alert
    console.log(`${type.toUpperCase()}: ${title} - ${message}`);
  }
};