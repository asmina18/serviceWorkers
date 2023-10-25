document.addEventListener('DOMContentLoaded', function () {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, { edge: 'right' });
  // add recipe form
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, { edge: 'left' });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../sw.js')
    .then(reg => console.log('service worker registered', reg))
    .catch(err => console.error('service worker not registered', err))
}
