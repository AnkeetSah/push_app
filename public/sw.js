self.addEventListener('push', (event) => {
    console.log('Push event received:', event);

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
            console.log('Push data:', data);
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    } else {
        data.message = 'This is a default notification body.';
    }

    const options = {
        body: data.message,
        icon: 'https://img.icons8.com/ios/452/notification.png',
        badge: 'https://img.icons8.com/ios/452/badge.png',
        actions: [
            {
                action: 'youtube-action',
                title: 'Go to YouTube',
                icon: 'https://img.icons8.com/ios-filled/50/000000/youtube-play.png'
            }
        ],
        data: {
            url: 'https://www.youtube.com'
        }
    };

    event.waitUntil(
        self.registration.showNotification('Push Notification', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
