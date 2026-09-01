const safe = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const safeUrl = (value = '', image = false) => {
  const url = String(value).trim();
  if (!url || /[\u0000-\u001F\s]/.test(url)) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (/^(\.\/|\.\.\/|\/assets\/)/.test(url)) return url;
  return image ? '' : '';
};
const inlineMarkdown = (value = '') => {
  let html = safe(value);
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => {
    const source = safeUrl(url, true);
    return source ? `<img src="${source}" alt="${alt}" loading="lazy">` : `<span class="markdown-warning">图片地址无效</span>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = safeUrl(url);
    return href ? `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>` : label;
  });
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return html;
};
const renderMarkdown = (value = '') => {
  const lines = String(value).replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (/^```/.test(line)) { const code = []; index += 1; while (index < lines.length && !/^```/.test(lines[index])) code.push(lines[index++]); if (index < lines.length) index += 1; output.push(`<pre><code>${safe(code.join('\n'))}</code></pre>`); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { const level = heading[1].length + 1; output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); index += 1; continue; }
    if (/^>\s?/.test(line)) { const quote = []; while (index < lines.length && /^>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^>\s?/, '')); output.push(`<blockquote>${quote.map(inlineMarkdown).join('<br>')}</blockquote>`); continue; }
    const list = line.match(/^([-*+] |\d+\. )/);
    if (list) { const ordered = /^\d+\. /.test(line); const items = []; const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/; while (index < lines.length && pattern.test(lines[index])) items.push(lines[index++].replace(pattern, '$1')); const tag = ordered ? 'ol' : 'ul'; output.push(`<${tag}>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${tag}>`); continue; }
    if (line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] || '')) { const cells = (row) => row.replace(/^\s*\||\|\s*$/g, '').split('|').map((cell) => inlineMarkdown(cell.trim())); const headers = cells(line); index += 2; const rows = []; while (index < lines.length && lines[index].includes('|') && lines[index].trim()) rows.push(cells(lines[index++])); output.push(`<div class="markdown-table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue; }
    const paragraph = [line]; index += 1; while (index < lines.length && lines[index].trim() && !/^(#{1,3}\s|```|>\s?|[-*+]\s+|\d+\.\s+)/.test(lines[index])) paragraph.push(lines[index++]); output.push(`<p>${paragraph.map(inlineMarkdown).join('<br>')}</p>`);
  }
  return output.join('') || '<p>暂无正文。</p>';
};
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
if (document.querySelector('#all-articles')) document.querySelector('#all-articles').innerHTML = content.articles.map((item) => `<article class="article-detail"><div class="article-meta"><span>${safe(item.type)}</span><time>${safe(item.date)}</time></div><h2>${safe(item.title)}</h2><p class="article-summary">${safe(item.summary)}</p><div class="markdown-content article-body">${renderMarkdown(item.body)}</div></article>`).join('');
if (document.querySelector('#all-notes')) document.querySelector('#all-notes').innerHTML = content.notes.map((item) => `<article class="note-entry markdown-content">${renderMarkdown(item.text)}<footer><span>${safe(item.label)}</span><time>${safe(item.date)}</time></footer></article>`).join('');
if (document.querySelector('#all-topics')) document.querySelector('#all-topics').innerHTML = content.topics.map((item) => `<article class="topic-entry markdown-content"><span class="topic-status">${safe(item.status)}</span><h2>${safe(item.title)}</h2>${renderMarkdown(item.text)}</article>`).join('');
if (document.querySelector('#latest-note')) { const item = content.notes[0]; if (item) document.querySelector('#latest-note').innerHTML = `<article class="note-entry"><p>${safe(item.text)}</p><footer><span>${safe(item.label)}</span><time>${safe(item.date)}</time></footer></article>`; }


