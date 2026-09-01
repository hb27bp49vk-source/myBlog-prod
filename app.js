const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileMenu.hidden = isOpen;
  menuButton.textContent = isOpen ? '菜单' : '关闭';
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.hidden = true;
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = '菜单';
  });
});