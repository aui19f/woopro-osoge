self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "접수 알림", {
      body: data.body ?? "새 대기 접수가 있습니다.",
      icon: "/images/osoge_main_01.png",
      badge: "/images/osoge_main_01.png",
      tag: "reception-waiting",
      renotify: true,
      data: { url: data.url ?? "/master/reception/waiting" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/master/reception/waiting";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
