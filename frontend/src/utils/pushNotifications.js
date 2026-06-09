const API_URL = import.meta.env.VITE_API_URL || '';

// This is the public VAPID key generated from the backend
// In a real app, you might fetch this from an API or environment variable
const PUBLIC_VAPID_KEY = 'BDKgccK3Ml5uZJdc40KXVr1WX6ijkfu48aFb9ghxghAtvqch51Yn3IQrPz1bSrLsYOMXYkM_HQLWdy0qElbH0sU';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported by the browser.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted.');
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // Send subscription to backend
    const subscriptionData = subscription.toJSON();
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: subscriptionData.endpoint,
        keys: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth
        }
      })
    });

    console.log('Successfully subscribed to push notifications.');
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
  }
}

export async function unsubscribeFromPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
    }
    
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            const subscriptionData = subscription.toJSON();
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/push/unsubscribe`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ endpoint: subscriptionData.endpoint })
            });
            await subscription.unsubscribe();
            console.log('Successfully unsubscribed from push notifications.');
        }
    } catch (error) {
        console.error('Error unsubscribing', error);
    }
}
