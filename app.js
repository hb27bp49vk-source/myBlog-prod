const safe = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const pageLinks = [
  ['首页', './index.html', 'home'], ['文章', './articles.html', 'articles'], ['短记', './notes.html', 'notes'], ['专题', './topics.html', 'topics'], ['关于', './about.html', 'about']
];
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const currentPage = document.body.dataset.page;
document.querySelectorAll('.primary-nav a, .mobile-menu a').forEach((link) => {
  if (link.href.endsWith(`/${currentPage}.html`) || (currentPage === 'home' && link.href.endsWith('/index.html'))) link.setAttribute('aria-current', 'page');
});
menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileMenu.hidden = isOpen;
  menuButton.textContent = isOpen ? '菜单' : '关闭';
});
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { mobileMenu.hidden = true; menuButton?.setAttribute('aria-expanded', 'false'); if (menuButton) menuButton.textContent = '菜单'; }));
const content = window.blogContent || { articles: [], notes: [], topics: [] };
const articleRow = (item) => `<a class="article-row" href="./articles.html"><div><span class="item-type">${safe(item.type)}</span><h3>${safe(item.title)}</h3><p>${safe(item.summary)}</p></div><time>${safe(item.date)}</time><span class="row-arrow">→</span></a>`;
if (document.querySelector('#latest-articles')) document.querySelector('#latest-articles').innerHTML = content.articles.slice(0, 3).map(articleRow).join('');
if (document.querySelector('#all-articles')) document.querySelector('#all-articles').innerHTML = content.articles.map((item) => `<article class="article-detail"><div class="article-meta"><span>${safe(item.type)}</span><time>${safe(item.date)}</time></div><h2>${safe(item.title)}</h2><p class="article-summary">${safe(item.summary)}</p><p>${safe(item.body)}</p></article>`).join('');
if (document.querySelector('#all-notes')) document.querySelector('#all-notes').innerHTML = content.notes.map((item) => `<article class="note-entry"><p>${safe(item.text)}</p><footer><span>${safe(item.label)}</span><time>${safe(item.date)}</time></footer></article>`).join('');
if (document.querySelector('#all-topics')) document.querySelector('#all-topics').innerHTML = content.topics.map((item) => `<article class="topic-entry"><span class="topic-status">${safe(item.status)}</span><h2>${safe(item.title)}</h2><p>${safe(item.text)}</p></article>`).join('');
if (document.querySelector('#latest-note')) { const item = content.notes[0]; if (item) document.querySelector('#latest-note').innerHTML = `<article class="note-entry"><p>${safe(item.text)}</p><footer><span>${safe(item.label)}</span><time>${safe(item.date)}</time></footer></article>`; }


