const pageUrl = new URL(location.href);
if (pageUrl.searchParams.has('v')) {
  pageUrl.searchParams.delete('v');
  history.replaceState(history.state, '', pageUrl);
}
const { source, articles, systems, countries } = window.COFFEE_CONTENT;
const year = window.COFFEE_YEAR_DATA;
Object.assign(source, year.sources);
const manualNews = year.events.map(n => ({...n,tags:[...(n.tags || []),'人工选编']}));
const news = [...manualNews];
let collection = null, feedError = '', feedLoaded = false;
let newsLimit = 30;
let newsMonth = '';
let lastNewsRefresh=0;
const names = { home: '发现首页', wiki: '咖啡百科', news: '热点追踪', markets: '年度数据', research: '胶囊研究', commerce: '电商查询', saved: '我的收藏' };
let state = { view: 'home', query: '', filter: '全部', detail: null };
let saved = [];
try { const value = JSON.parse(localStorage.getItem('coffee-prototype-saved') || '[]'); if (Array.isArray(value)) saved = value.filter(id => articles.some(a => a.id === id)); } catch {}
const page = document.querySelector('#page');
const search = document.querySelector('#search');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const match = item => JSON.stringify(item).toLowerCase().includes(state.query.toLowerCase());
function refs(keys) {
  return `<span class="source-links">${keys.map(key => source[key] ? `<a href="${esc(source[key].url)}" target="_blank" rel="noopener noreferrer">${esc(source[key].name)} ↗</a>` : '').join('')}</span>`;
}
function empty(title = '没有找到相关内容', text = '试试其他关键词或分类。') { return `<div class="empty"><b>${title}</b>${text}</div>`; }
function heading(title, sub, kicker = 'COFFEE INDUSTRY OBSERVER') { return `<header class="page-title"><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${sub}</p></header>`; }
function filters(items) { return `<div class="filters" role="group" aria-label="分类筛选">${items.map(item => `<button class="pill ${state.filter === item ? 'active' : ''}" data-filter="${esc(item)}" aria-pressed="${state.filter === item}">${esc(item)}</button>`).join('')}</div>`; }
function table(headers, rows, label = '资料对照') { return `<div class="table-scroll" role="region" aria-label="${esc(label)}" tabindex="0"><table><thead><tr>${headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
function systemTable(compact = false) {
  const list = compact ? systems.filter(match) : systems;
  return `<div class="table-scroll" role="region" aria-label="单份咖啡系统对照" tabindex="0"><table class="system-table"><thead><tr><th scope="col">系统 / 中文说明</th><th scope="col">核心区别</th><th scope="col">${compact ? '研究胶囊与配件时，别漏掉' : '原厂说明与经营含义'}</th></tr></thead><tbody>${list.map(s => `<tr><td><button data-article="${s.article}" class="table-title">${esc(s.name)}</button><small>${esc(s.brand)}</small></td><td>${esc(s.mechanism)}<small>${esc(s.format)}</small></td><td>${esc(s.caution)}${compact ? '' : `<p class="analysis-line">解读：${esc(s.implication)}</p>`}${refs(s.sources)}</td></tr>`).join('')}</tbody></table></div>` + (list.length ? '' : empty());
}
function countryTable() { return table(['市场', '2023 年人均咖啡消费', '口径'], countries.map(c => [c.country, `${c.kg.toFixed(1)} 公斤／人／年`, 'ICO 2023 消费量、世界银行 2022 人口']), '历史国家消费比较') + `<p class="data-note">历史背景：ECF 2024/25 报告第 56 页。这里的年份是 2023，不作为近一年消费变化；该指标也不是胶囊份额。</p>` + refs(['eu']); }
function metricTable(list = year.metrics) {
  return `<div class="table-scroll" role="region" aria-label="近一年发布的统计与企业披露" tabindex="0"><table><thead><tr><th scope="col">市场 / 对象</th><th scope="col">指标</th><th scope="col">数值</th><th scope="col">实际统计期</th><th scope="col">口径与出处</th></tr></thead><tbody>${list.map(m => `<tr><td>${esc(m.region)}<small>${esc(m.subject)}</small></td><td>${esc(m.metric)}</td><td class="number-cell">${Number(m.value).toLocaleString('zh-CN')}<small>${esc(m.unit)}</small></td><td>${esc(m.period)}<small>发布：${source[m.source].date}</small></td><td>${esc(m.note)}${refs([m.source])}</td></tr>`).join('')}</tbody></table></div>` + (list.length ? '' : empty());
}
function pricePanel() {
  const values = year.prices.map(p => p.value);
  const min = Math.floor(Math.min(...values) / 20) * 20;
  const max = Math.ceil(Math.max(...values) / 20) * 20;
  const points = year.prices.map((p, i) => `${48 + i * 63},${205 - (p.value - min) / (max - min) * 155}`);
  const change = (values.at(-1) / values[0] - 1) * 100;
  return `<section class="panel price-panel"><div class="section-head"><div><h2>过去 12 个完整月，生豆价格怎样变化？</h2><p>国际咖啡组织 ICO 综合指标 I-CIP · 月均值 · 美分／磅</p></div><strong class="price-change">${change.toFixed(1)}%<small>首尾月均值变化</small></strong></div><div class="chart-wrap"><svg viewBox="0 0 790 255" role="img" aria-label="2025年10月至2026年9月ICO综合指标月均价折线图，具体数据见下方表格"><title>ICO I-CIP 月均价：2025-10 至 2026-09</title>${[min, (min + max) / 2, max].map(v => { const y = 205 - (v - min) / (max - min) * 155; return `<line x1="43" x2="756" y1="${y}" y2="${y}" stroke="#e7eadf"/><text x="7" y="${y + 4}" font-size="11" fill="#7c887b">${v}</text>`; }).join('')}<polygon points="48,205 ${points.join(' ')} 741,205" fill="#dbe7d5" opacity=".6"/><polyline points="${points.join(' ')}" fill="none" stroke="#30634b" stroke-width="2.5"/>${year.prices.map((p, i) => { const [x, y] = points[i].split(','); return `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#30634b" stroke-width="2"><title>${p.month}：${p.value.toFixed(2)} 美分／磅</title></circle><text x="${x}" y="234" text-anchor="middle" font-size="10" fill="#788674">${p.month.slice(2).replace('-', '/')}</text>`; }).join('')}</svg></div><p class="data-note">2025-10—2026-09 完整月度序列；2025-10 含日窗口之前的日期，2026-10 尚未完整。国际指标不等于你的熟豆或胶囊采购价，首尾变化也不是年度均价同比。</p><details><summary>展开 12 个月的数值与逐月出处</summary>${priceTable()}</details></section>`;
}
function priceTable() { return `<div class="table-scroll" role="region" aria-label="ICO逐月价格与来源" tabindex="0"><table><thead><tr><th scope="col">月份</th><th scope="col">I-CIP 月均价（美分／磅）</th><th scope="col">原始报告</th></tr></thead><tbody>${year.prices.map(p => `<tr><td>${p.month}</td><td class="number-cell">${p.value.toFixed(2)}</td><td><a href="${esc(p.source_url)}" target="_blank" rel="noopener noreferrer">ICO 月报 · ${esc(p.locator)} ↗</a></td></tr>`).join('')}</tbody></table></div>`; }
function articleCard(a) { const isSaved = saved.includes(a.id); return `<article class="article-card">${a.image?officialImage(a.image,true):''}<div class="card-top"><span class="tag">${esc(a.category)}</span><span aria-hidden="true" style="color:#93a18c;font-size:21px">${a.icon}</span></div><h3><button data-article="${a.id}">${esc(a.title)}</button></h3><p>${esc(a.desc)}</p><div class="card-footer"><span>${a.time} · ${a.sources.length} 个原始出处</span><button class="save ${isSaved ? 'saved' : ''}" data-save="${a.id}" aria-label="${isSaved ? '取消收藏' : '收藏'}：${esc(a.title)}" aria-pressed="${isSaved}">${isSaved ? '★' : '☆'}</button></div></article>`; }
function newsCard(n, compact = false) {
  return `<article class="news-card ${compact ? 'compact' : ''}"><div class="news-meta"><span class="tag">${esc(n.category)}</span><time datetime="${n.date}">${n.date}</time><span>${esc(n.region)}</span><span class="source-status">${esc(n.status)}</span></div><h3><a href="#news/${n.id}">${esc(n.title)}</a></h3><p>${esc(n.desc)}</p>${compact || n.automatic ? '' : `<p class="impact"><b>关注价值</b> ${esc(n.impact)}</p>`}<div class="news-bottom"><span>${esc(source[n.source].name.split('｜')[0])}${n.automatic ? (n.translated ? ' · 中文摘要' : ' · 原文摘要') : ' · ' + esc(n.period)}</span><a href="#news/${n.id}" class="text-link">${n.automatic ? '查看摘要与原文' : '阅读事件与解读'} →</a></div></article>`;
}
function digestPanel() {
  const d=collection.digest;
  if (!d?.enabled) return '<p>中文摘要尚未开启；自动条目保留来源原文摘要，未经人工核验。</p>';
  const batch=d.backfill;
  const active=batch?.status==='active';
  const finished=batch?.status==='completed';
  const quota=active ? `本次补齐 ${batch.used} / ${batch.limit} 次请求 · 剩余 ${d.remaining} 次` : finished ? `本次 ${batch.total} 条已补齐 · 用量 ${batch.used} / ${batch.limit} 次请求` : `过去 24 小时 ${d.used} / ${d.limit} 次请求 · 剩余 ${d.remaining} 次`;
  return `<div class="digest-status"><b>DeepSeek 中文整理 · ${d.pending===0 ? '已完成' : d.paused ? '已暂停' : d.active ? '后台运行中' : '队列未运行'}</b><p>${quota} · 已完成 ${d.completed} 条 · 待处理 ${d.pending} 条</p>${active ? `<p>本次目标 ${batch.total} 条，已补齐 ${batch.total-batch.remaining} 条；完成后自动恢复每天 200 次。</p>` : finished ? `<p>已恢复每天 ${d.limit} 次。过去 24 小时共 ${d.used} 次（含本次批量），常规额度剩余 ${d.remaining} 次；额度释放后继续处理新资料。</p>` : ''}<p>按原始发布日期从新到旧处理，每条同时生成中文标题与摘要。失败请求也计入限额；额度用尽后等待恢复。AI 整理不代表人工核验。</p>${d.error ? `<p class="digest-error">${esc(d.error)}</p>` : ''}${d.warning ? `<p>${esc(d.warning)}</p>` : ''}</div>`;
}
function collectionPanel() {
  if (!feedLoaded) return '<p class="scope-note" role="status">正在读取自动采集资讯…</p>';
  if (feedError) return `<p class="scope-note" role="status">${esc(feedError)} <button class="text-link" data-refresh-news>重新读取</button></p>`;
  if (collection.mode === 'snapshot') return `<section class="collection-panel" aria-label="公开资讯快照"><b>已发布资讯 · ${news.length} 条资料</b><p>收录窗口：${esc(collection.from)}—${esc(collection.to)}。最近发布：${esc(new Date(collection.exportedAt).toLocaleString('zh-CN'))}。</p><p>这是公开阅读版，采集与中文整理在发布者的后台运行，重新同步发布后更新；本页不运行采集或模型。</p><button class="text-link" data-refresh-news>刷新发布内容</button></section>`;
  const statuses = Object.values(collection.sources);
  const success = statuses.filter(s => s.lastSuccess).length;
  const latest = statuses.map(s => s.lastSuccess).filter(Boolean).sort().at(-1);
  return `<section class="collection-panel" aria-label="自动采集状态"><div><b>${collection.active ? '自动采集已开启' : '采集服务未运行'}</b><span> · ${news.length} 条资料 · ${success} 个信源读取成功</span></div><p>近一年窗口：${collection.from}—${collection.to}。按原始发布日期收录；专业媒体每 2 小时、机构每 12—24 小时检查。最近成功：${latest ? esc(new Date(latest).toLocaleString('zh-CN')) : '暂无'}。</p>${digestPanel()}<details><summary>信源状态与覆盖范围</summary>${statuses.map(s => `<p><b>${esc(s.name)}</b> · ${s.error ? esc(s.error) + '，等待下次计划检查' : `最近读取 ${s.fetched ?? 0} 条，符合收录规则 ${s.accepted ?? 0} 条`} · ${s.intervalMinutes / 60} 小时／次</p>`).join('')}<p>Daily Coffee News 使用公开历史档案；World Coffee Research 跟随历史分页；ECF 使用订阅中仍可读取的报告。其他机构报告继续人工核验。此列表不代表全行业完整覆盖。</p></details><button class="text-link" data-refresh-news>刷新已入库资讯</button></section>`;
}
function regionMatch(region) { return state.filter === '全部' || state.filter === region || (region === '欧美' && ['美国', '欧洲'].includes(state.filter)) || (state.filter === '欧洲' && ['德国', '法国', '意大利', '西班牙'].includes(region)); }
function render() {
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-current', b.dataset.view === state.view ? 'page' : 'false'));
  document.querySelector('#breadcrumb').textContent = '产业研究 / ' + names[state.view];
  const hint = state.query ? `<p class="search-hint">搜索：“${esc(state.query)}” <button data-clear class="text-link">清除</button></p>` : '';
  if (state.view === 'research') { renderResearch(state.detail || 'compatibility'); return; }
  if (state.view === 'commerce' && state.detail) { renderCommercePlatform(state.detail); return; }
  if (state.detail) { renderDocument(); return; }
  document.title = names[state.view] + ' · 咖啡产业观察';
  if (state.view === 'home') {
    renderHome(hint);
  } else if (state.view === 'wiki' || state.view === 'saved') {
    renderKnowledge(state.view === 'saved', hint);
  } else if (state.view === 'commerce') {
    renderCommerce();
  } else if (state.view === 'news') {
    const list = news.filter(n => (!newsMonth || n.date.startsWith(newsMonth)) && match(n) && (regionMatch(n.region) || state.filter === n.category || n.tags?.includes(state.filter)));
    const months = [...new Set(news.map(n => n.date.slice(0,7)))].sort().reverse();
    page.innerHTML = heading('热点追踪', '近一年咖啡产业动态、原始报告与专业媒体资讯，按原始发布日期排列。', 'A YEAR IN COFFEE') + collectionPanel() + filters(['全部','人工选编','自动采集','中文摘要','美国','欧洲','加拿大','胶囊系统','消费报告','企业动态','设备配件','供应链','政策回收','研究与产区']) + `<label class="month-filter">按月份 <select id="news-month"><option value="">近一年全部</option>${months.map(month => `<option value="${month}" ${newsMonth === month ? 'selected' : ''}>${month}（${news.filter(n => n.date.startsWith(month)).length} 条）</option>`).join('')}</select></label><p class="search-hint">符合筛选 ${list.length} 条 · 已展示 ${Math.min(newsLimit, list.length)} 条</p>` + hint + (list.slice(0, newsLimit).map(n => newsCard(n)).join('') || empty()) + (list.length > newsLimit ? '<button class="pill load-more" data-more-news>再看 30 条</button>' : '');
  } else {
    const list = year.metrics.filter(m => regionMatch(m.region) && match(m));
    page.innerHTML = heading('近一年数据观察', '先看连续价格，再看消费与企业披露。所有数据保留单位、统计期与原始来源。', 'DATA / 2025.10—2026.10') + `<p class="scope-note">${esc(year.window.basis)}</p>` + pricePanel() + `<div class="section-head"><div><h2>近一年发布的 ${year.metrics.length} 项关键统计</h2><p>各指标单位和分母不同，分别阅读，不作混合市场排名。</p></div><button class="text-link" data-download="metrics">下载统计 CSV ↓</button></div>` + filters(['全部','美国','欧洲','加拿大','全球']) + hint + metricTable(list) + `<div class="download-row"><button class="pill" data-download="prices">下载 12 个月价格 CSV ↓</button><button class="pill" data-download="events">下载资料与动态 CSV ↓</button><button class="pill" data-article="market-reports">历史国家消费比较（2023） →</button></div><p class="data-note">${esc(year.coverage)}</p>`;
  }
}
function sectionContent(s) {
  let body = `<section><div class="reader-section-title"><h3>${esc(s.title)}</h3>${s.kind ? `<span class="tag">${esc(s.kind)}</span>` : ''}</div>`;
  if (s.text) body += `<p>${esc(s.text)}</p>`;
  if (s.calculator) body += costCalculator();
  if (s.table === 'systems') body += systemTable();
  if (s.table === 'countries') body += countryTable();
  if (s.rows) body += table(s.headers, s.rows, s.title);
  if (s.bullets) body += `<ul>${s.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`;
  if (s.timeline) body += `<ol class="timeline">${s.timeline.map(t => `<li><b>${esc(t.year)}</b><p>${esc(t.text)}</p>${refs(t.refs)}</li>`).join('')}</ol>`;
  if (s.refs) body += refs(s.refs);
  return body + '</section>';
}
function openArticle(id) { location.hash = 'wiki/' + id; }
function navigate(route) {
  const [view, detail] = route.split('/');
  state.view = names[view] ? view : 'home'; state.detail = detail || null;
  state.filter = '全部'; state.query = ''; newsLimit = 30; newsMonth = ''; search.value = ''; render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function toast(text) { const target = document.querySelector('#toast'); target.textContent = text; target.classList.remove('hidden'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => target.classList.add('hidden'), 1800); }
function download(kind) {
  const rows = kind === 'prices' ? [['月份','I-CIP 月均价','单位','原始报告'],...year.prices.map(p => [p.month,p.value,p.unit,p.source_url])] : kind === 'metrics' ? [['市场','对象','指标','数值','单位','统计期','发布日期','口径说明','来源'],...year.metrics.map(m => [m.region,m.subject,m.metric,m.value,m.unit,m.period,source[m.source].date,m.note,source[m.source].url])] : [['发布日期','统计期','标题','事实摘要','经营解读','来源'],...news.map(n => [n.date,n.period,n.title,n.desc,n.impact,source[n.source].url])];
  const csv = '\uFEFF' + rows.map(row => row.map(value => '"' + String(value ?? '').replaceAll('"','""') + '"').join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `coffee-year-${kind}.csv`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.addEventListener('click', event => {
  const b = event.target.closest('button'); if (!b) return;
  if (b.hasAttribute('data-check-update')) { const fresh = new URL('latest.html', location.href); fresh.hash = location.hash; location.assign(fresh.href); return; }
  if (b.dataset.view || b.dataset.go) { const view = b.dataset.view || b.dataset.go; if (location.hash === '#' + view) navigate(view); else location.hash = view; }
  if (b.dataset.filter) { state.filter = b.dataset.filter; newsLimit = 30; render(); }
  if (b.hasAttribute('data-more-news')) { newsLimit += 30; render(); }
  if (b.hasAttribute('data-refresh-news')) void refreshNews();
  if (b.hasAttribute('data-clear')) { state.query = ''; search.value = ''; render(); }
  if (b.dataset.article) openArticle(b.dataset.article);
  if (b.dataset.dossier) { state.filter = b.dataset.dossier; render(); }
  if (b.dataset.section) document.getElementById(b.dataset.section)?.scrollIntoView({behavior:'smooth',block:'start'});
  if (b.dataset.download) download(b.dataset.download);
  if (b.dataset.save) { const id = b.dataset.save; saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved,id]; let persistent = true; try { localStorage.setItem('coffee-prototype-saved', JSON.stringify(saved)); } catch { persistent = false; } render(); toast(persistent ? (saved.includes(id) ? '已加入收藏' : '已取消收藏') : '本次收藏已更新，浏览器未允许持久保存'); }
});
search.addEventListener('input', () => {
  if (state.view === 'research') {
    if (state.detail?.startsWith('company-')) state.detail = 'companies';
    if (state.detail?.startsWith('machine-')) state.detail = 'compatibility';
    history.replaceState(null, '', '#research/' + (state.detail || 'compatibility'));
  } else if (state.detail) { state.detail = null; history.replaceState(null, '', '#' + state.view); }
  state.query = search.value.trim(); newsLimit = 30; render();
});
document.addEventListener('change', event => { if (event.target.id === 'news-month') { newsMonth = event.target.value; newsLimit = 30; render(); } });
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
window.addEventListener('pageshow', event => { if (event.persisted && ['http:', 'https:'].includes(location.protocol)) location.reload(); });
navigate(location.hash.slice(1) || 'home');

async function refreshNews() {
  lastNewsRefresh=Date.now();
  try {
    const feedUrl = document.querySelector('meta[name="coffee-feed"]')?.content || '/api/coffee-news';
    const response = await fetch(new URL(feedUrl, document.baseURI), {cache:'no-store',signal:AbortSignal.timeout(10000)});
    if (!response.ok) throw new Error('资讯库暂时不可用，当前仅显示人工选编。');
    const data = await response.json();
    collection = data.collection;
    const categories = {capsules:'胶囊系统',equipment:'设备配件',industry:'企业动态',consumption:'消费报告','supply-chain':'供应链',policy:'政策回收',research:'研究与产区',history:'产业历史'};
    const manualUrls = new Set(year.events.map(n => source[n.source].url.replace(/\/$/,'')));
    const automatic = data.items.filter(n => !manualUrls.has(n.links.original.replace(/\/$/,''))).map(n => {
      const key = 'auto-' + n.id;
      const date = n.publishedAt.slice(0,10);
      source[key] = {name:n.source.name,url:n.links.original,date};
      const originalTitle=n.originalTitle || n.title;
      const translated=n.summaryOrigin==='model' && n.summaryModel==='coffee-digest';
      const region = /\b(U\.?S\.?|United States|American)\b/i.test(originalTitle) ? '美国' : /\b(Canada|Canadian)\b/i.test(originalTitle) ? '加拿大' : /\b(Europe|European|Germany|German|France|French|Italy|Italian|UK|United Kingdom|Britain|British|Spain|Spanish)\b/i.test(originalTitle) ? '欧洲' : '全球';
      return {id:key,automatic:true,translated,originalTitle,title:n.title,desc:n.summary,date,region,source:key,category:categories[n.category] || '企业动态',tags:['自动采集',...(translated?['中文摘要']:[])],status:translated?'DeepSeek 中文摘要 · 待核验':'原文摘要 · 待处理',period:'原始发布日期 ' + date,impact:translated?'DeepSeek 仅依据来源标题和短摘要整理，未经人工核验；请结合原文判断。':'原文摘要未经人工核验，等待中文整理；请结合来源全文判断。',sections:[{title:translated?'中文事实摘要':'来源摘要',text:n.summary,refs:[key]},...(translated?[{title:'原文标题',text:originalTitle}]:[]),{title:'阅读说明',text:'摘要不等于完整报告。地区由标题关键词初分，可能需要修正；数字口径、事件状态及经营影响请以原始资料为准。'}]};
    });
    news.splice(0,news.length,...manualNews,...automatic);
    news.sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
    feedError = data.truncated ? '资讯超过单次 2000 条上限，请缩小归档范围。' : '';
    const footer = document.querySelector('.footer span:last-child');
    if (footer) footer.textContent = '人工选编 + 自动采集 · 发布日期与统计期分开记录';
  } catch (error) { feedError = ['TimeoutError','AbortError'].includes(error.name) ? '资讯库响应超时，当前仅显示人工选编。' : error.message || '读取失败，请稍后重试。'; }
  feedLoaded = true;
  if (state.view !== 'commerce' && !(state.view === 'research' && ['watchlist','records'].includes(state.detail))) render();
}
void refreshNews();
// Refreshing only reads published records; collection runs independently in the server.
setInterval(() => { if (!document.hidden && ['news','home'].includes(state.view) && !state.detail && Date.now()-lastNewsRefresh >= (collection?.digest?.backfill?.status === 'active' ? 5000 : 60000)) void refreshNews(); }, 5000);
