self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png', // Você pode colocar a logo da GCM na pasta public depois
      badge: '/icon-192x192.png', // Você pode colocar a logo da GCM na pasta public depois
      vibrate: [200, 100, 200, 100, 200], // Faz o celular vibrar
      data: {
        url: data.url || '/'
      }
    };

    // Mostra a notificação na tela
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Quando o guarda clica na notificação, abre o sistema direto na página certa
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});