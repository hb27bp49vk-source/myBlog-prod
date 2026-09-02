const safe = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const normalizeMarkdownImages=(value='')=>String(value).replace(/!\[([^\]]+)\]\s*!\[([^\]]*)\]\(([^)]+)\)/g,'![$1]($3)');
const safeUrl=(value='')=>{const url=String(value).trim();if(/[\u0000-\u001F\s]/.test(url))return'';if(/^\/assets\//.test(url))return '.'+url;return /^(https?:\/\/|\.\/|\.\.\/)/.test(url)?url:''};
const inlineMarkdown=(value='')=>{let html=safe(value);html=html.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(_,alt,url)=>{const source=safeUrl(url);return source?`<img src="${source}" alt="${alt}" loading="lazy">`:'<span class="markdown-warning">图片地址无效</span>'});html=html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,label,url)=>{const href=safeUrl(url);return href?`<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`:label});return html.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(?<!\*)\*([^*]+)\*(?!\*)/g,'<em>$1</em>')};
const renderMarkdown=(value='')=>{const lines=normalizeMarkdownImages(value).replace(/\r\n?/g,'\n').split('\n');const out=[];let i=0;while(i<lines.length){const line=lines[i];if(!line.trim()){i++;continue}if(/^```/.test(line)){const code=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))code.push(lines[i++]);if(i<lines.length)i++;out.push(`<pre><code>${safe(code.join('\n'))}</code></pre>`);continue}const h=line.match(/^(#{1,3})\s+(.+)$/);if(h){out.push(`<h${h[1].length+1}>${inlineMarkdown(h[2])}</h${h[1].length+1}>`);i++;continue}const list=line.match(/^([-*+] |\d+\. )/);if(list){const ordered=/^\d+\. /.test(line);const re=ordered?/^\d+\.\s+(.+)$/:/^[-*+]\s+(.+)$/;const items=[];while(i<lines.length&&re.test(lines[i]))items.push(lines[i++].replace(re,'$1'));const tag=ordered?'ol':'ul';out.push(`<${tag}>${items.map(x=>`<li>${inlineMarkdown(x)}</li>`).join('')}</${tag}>`);continue}const p=[line];i++;while(i<lines.length&&lines[i].trim()&&!/^(#{1,3}\s|```|[-*+]\s+|\d+\.\s+)/.test(lines[i]))p.push(lines[i++]);out.push(`<p>${p.map(inlineMarkdown).join('<br>')}</p>`)}return out.join('')||'<p>暂无正文。</p>'};
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
if (document.querySelector('#all-articles')) document.querySelector('#all-articles').innerHTML = content.articles.map((item) => `<article class="article-detail"><div class="article-meta"><span>${safe(item.type)}</span><time>${safe(item.date)}</time></div><h2>${safe(item.title)}</h2><p class="article-summary">${safe(item.summary)}</p><div class="markdown-content">${renderMarkdown(item.body)}</div></article>`).join('');
if (document.querySelector('#all-notes')) document.querySelector('#all-notes').innerHTML = content.notes.map((item) => `<article class="note-entry markdown-content">${renderMarkdown(item.text)}<footer><span>${safe(item.label)}</span><time>${safe(item.date)}</time></footer></article>`).join('');
if (document.querySelector('#all-topics')) document.querySelector('#all-topics').innerHTML = content.topics.map((item) => `<article class="topic-entry markdown-content"><span class="topic-status">${safe(item.status)}</span><h2>${safe(item.title)}</h2>${renderMarkdown(item.text)}</article>`).join('');
if (document.querySelector('#latest-note')) { const item = content.notes[0]; if (item) document.querySelector('#latest-note').innerHTML = `<article class="note-entry"><p>${safe(item.text)}</p><footer><span>${safe(item.label)}</span><time>${safe(item.date)}</time></footer></article>`; }


