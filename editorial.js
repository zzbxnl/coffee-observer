function dossierNav() {
  return `<nav class="dossier-grid" aria-label="百科分类">${window.COFFEE_CONTENT.dossiers.map((d,i) => `<button class="dossier ${state.filter === d.id ? 'active' : ''}" data-dossier="${d.id}" aria-pressed="${state.filter === d.id}"><small>${String(i+1).padStart(2,'0')} · ${d.articles.length} 篇</small><b>${esc(d.title)} →</b><span>${esc(d.desc)}</span></button>`).join('')}</nav>`;
}

function renderKnowledge(isSaved, hint) {
  const dossiers = window.COFFEE_CONTENT.dossiers;
  const visible = articles.filter(a => match(a) && (!isSaved || saved.includes(a.id)));
  const groups = dossiers.filter(d => state.filter === '全部' || state.filter === d.id || state.filter === d.title).map(d => ({...d, entries: d.articles.map(id => visible.find(a => a.id === id)).filter(Boolean)})).filter(d => d.entries.length);
  page.innerHTML = heading(isSaved ? '我的收藏' : '咖啡百科', isSaved ? '保存在当前浏览器中的阅读资料。' : '从机器、咖啡豆和胶囊开始，再读配件、产业历史与市场经营。', 'KNOWLEDGE & EVIDENCE')
    + (isSaved ? filters(['全部',...dossiers.map(d => d.title)]) : `<div class="wiki-toolbar"><button class="pill ${state.filter === '全部' ? 'active' : ''}" data-filter="全部" aria-pressed="${state.filter === '全部'}">全部</button><span>${articles.length} 篇百科 · 按下方分类顺序阅读</span></div>` + dossierNav())
    + hint
    + (isSaved ? '' : '<p class="scope-note">从原理进入实际产品：<a href="#research/compatibility">机型兼容库 →</a> · <a href="#research/lab">问题假设与测试表 →</a> · <a href="#research/context">国家与集团档案 →</a></p>')
    + (groups.map(d => `<section class="knowledge-group" aria-label="${esc(d.title)}词条"><div class="section-head"><div><h2>${esc(d.title)} <small>${d.entries.length} 篇</small></h2><p>${esc(d.desc)}</p></div></div>${officialCatalog(d.title)}<div class="card-grid">${d.entries.map(articleCard).join('')}</div></section>`).join('') || empty(isSaved ? '还没有收藏词条' : '没有找到相关词条', isSaved ? '点击百科卡片的星标即可收藏。' : '试试其他关键词或分类。'));
}

function renderHome(hint) {
  const editorialOrder = ['alta-preview-2026','nca-fall-2026','kdp-q2-2026','germany-market-2025','nestle-fy2025','kdp-jde-acquisition','lavazza-fy2025','canada-consumption-2025','kdp-q3-2025','nca-specialty-2026','nca-spring-2026'];
  const featured = editorialOrder.map(id => news.find(n => n.id === id)).filter(n => match(n) && (state.filter === '全部' || n.category === state.filter || n.tags?.includes(state.filter)));
  const latestPrice = year.prices.at(-1);
  const monthlyChange = (latestPrice.value / year.prices.at(-2).value - 1) * 100;
  page.innerHTML = `
    <header class="edition-head"><div><span class="eyebrow">COFFEE INDUSTRY OBSERVER</span><h1>产业精选</h1><p>关注胶囊、咖啡豆与配件背后的真实变化。</p></div><div class="edition-date"><time>${year.checked_on}</time><span>近一年资料选编 · 欧美市场</span></div></header>
    <section class="research-entry" aria-label="胶囊经营研究台"><div><span class="eyebrow">资料核对 ${research.checkedOn}</span><h2>胶囊经营研究台</h2><p>${research.machines.length} 个机型档案 · ${research.products.length} 个竞品样本 · ${companies.entries.length} 份企业与财报档案</p></div><div><a href="#research/compatibility">查机型与兼容边界 →</a><a href="#research/watchlist">看竞品与记录价格 →</a><a href="#research/companies">查企业与财报 →</a><a href="#research/weekly">阅读本期经营简报 →</a></div></section>
    <div class="editorial-layout">
      <div class="editorial-main">
        <section class="lead-story">
          <div class="news-meta"><span class="tag gold">本期观察</span><span>消费 × 企业 × 成本</span></div>
          <h2><a href="#wiki/price-transmission">咖啡涨价之后，增长藏在哪里？</a></h2>
          <p class="lead-deck">德国烘焙咖啡销售额增长 <b>23.5%</b>，销量却下降 <b>1.5%</b>；Nespresso 的 <b>6.0%</b> 有机增长中，定价贡献 <b>4.4%</b>。看懂行业，要先拆开量、价与产品结构。</p>
          <div class="lead-reading"><b>对胶囊业务意味着什么</b><p>每杯价值值得重新计算，系统和地区则要分别看。北美 Vertuo、德国整豆，以及可填充器具的使用成本，指向的是不同的产品问题。</p></div>
          <div class="lead-bottom"><span>依据：德国咖啡协会、雀巢 2025 年披露</span><a href="#wiki/price-transmission">读完整分析 →</a></div>
        </section>
        <div class="insight-strip">
          <a href="#news/nca-fall-2026"><small>美国 · 消费渠道</small><b>居家需求稳，买咖啡的渠道在变</b><span>食品杂货店 42% → 35%；大众零售商 23% → 28%。</span></a>
          <a href="#news/kdp-q2-2026"><small>集团 · 并购后续</small><b>KDP 分部下降，先读统计边界</b><span>Peet’s K-Cup 归属改变，影响美国咖啡分部同比。</span></a>
          <a href="#wiki/reusable-economics"><small>胶囊 · 使用成本</small><b>可填充到底省多少？代入参数看</b><span>把豆粉、盖膜、清洗与器具分摊分别算清楚。</span></a>
        </div>
        <section class="home-feed"><div class="section-head"><div><h2>值得跟踪的变化</h2><p>原始资料、事件事实与本站解读一起读。</p></div><a href="#news" class="text-link">全部动态 →</a></div>
          ${filters(['全部','胶囊系统','消费报告','企业动态'])}${hint}
          ${featured.slice(0,6).map(n => newsCard(n)).join('') || empty()}
        </section>
        <section class="home-feed"><div class="section-head"><div><h2>最新采集</h2><p>原始资讯与 DeepSeek 中文摘要 · 待人工核验</p></div><a href="#news" class="text-link">${news.length} 条动态 →</a></div>${news.filter(n => n.automatic && match(n)).slice(0,3).map(n => newsCard(n,true)).join('') || '<p class="data-note">' + (feedError ? esc(feedError) : '正在读取资讯库…') + '</p>'}</section>
        <section><div class="section-head"><div><h2>从问题进入百科</h2><p>原理、对照表、产业背景与实际使用。</p></div><a href="#wiki" class="text-link">全部专题 →</a></div>
          <div class="card-grid">${articles.filter(match).filter(a => ['system-comparison','capsule-compatibility','us-consumption','group-history'].includes(a.id)).map(articleCard).join('') || empty()}</div>
        </section>
      </div>
      <aside class="research-rail" aria-label="数据与研究专题">
        <section class="rail-panel"><h2>数据温度计</h2><p class="rail-intro">各自保留期间与单位</p>
          <a class="rail-number" href="#wiki/price-transmission"><span>ICO 综合指标 · 2026-09</span><b>${latestPrice.value.toFixed(2)}<small> 美分／磅</small></b><em>环比 ${monthlyChange.toFixed(1)}% · 月均值</em></a>
          <a class="rail-number" href="#news/nestle-fy2025"><span>Nespresso · 2025 全年</span><b>1.6<small>% RIG</small></b><em>定价 ＋4.4%，有机增长 ＋6.0%</em></a>
          <a class="rail-number" href="#news/germany-market-2025"><span>德国整豆 · 2025 全年</span><b>19.38<small> 万吨</small></b><em>协会披露的销量纪录</em></a>
          <a href="#markets" class="rail-link">查看 ${year.metrics.length} 项统计与连续价格 →</a>
        </section>
        <section class="rail-panel"><h2>研究主线</h2>${window.COFFEE_CONTENT.dossiers.map(d => `<div class="rail-topic"><b>${esc(d.title)}</b>${d.articles.slice(0,2).map(id => { const a = articles.find(a => a.id === id); return `<a href="#wiki/${id}">${esc(a.title)} →</a>`; }).join('')}</div>`).join('')}</section>
        <section class="rail-note"><b>内容如何形成</b><p>人工选编优先协会调查、国际组织与企业原始披露；记录发布日期与实际统计期。本站解读单独标明。</p><p>自动采集补充专业媒体与机构资讯，DeepSeek 逐条整理中文摘要，标记待核验；状态见热点追踪。</p></section>
      </aside>
    </div>`;
}

function renderDocument() {
  const isEvent = state.view === 'news';
  const item = (isEvent ? news : articles).find(a => a.id === state.detail);
  if (!item) {
    page.innerHTML = `<a href="#${state.view}" class="back-link">← 返回${names[state.view]}</a>${empty(isEvent && !feedLoaded ? '正在读取资讯…' : '没有找到这篇内容',feedError || '请返回目录选择，或核对链接。')}`;
    document.title = '内容未找到 · 咖啡产业观察';
    return;
  }
  document.title = item.title + ' · 咖啡产业观察';
  const sections = item.sections;
  const keys = [...new Set([...(isEvent ? [item.source] : item.sources), ...sections.flatMap(s => [...(s.refs || []), ...(s.timeline || []).flatMap(t => t.refs || [])])])];
  const related = isEvent ? articles.filter(a => a.id === item.article) : articles.filter(a => a.id !== item.id && a.category === item.category).slice(0,3);
  page.innerHTML = `
    <a class="back-link" href="#${isEvent ? 'news' : 'wiki'}">← 返回${isEvent ? '热点追踪' : '咖啡百科'}</a>
    <div class="document-layout">
      <article class="document reader" aria-labelledby="document-title">
        <header class="document-header"><div class="news-meta"><span class="tag">${esc(item.category)}</span><span>${isEvent ? esc(item.region) + ' · ' + esc(item.status) : '专题解读 · ' + esc(item.time)}</span></div><h1 id="document-title">${esc(item.title)}</h1><p class="intro">${esc(item.desc)}</p><div class="document-meta">${isEvent ? `原始发布：<time datetime="${item.date}">${item.date}</time><span>统计／事件期：${esc(item.period)}</span>` : `核验：<time>${item.checked_on}</time><span>${keys.length} 个原始出处</span>`}</div></header>
        <div class="takeaway"><b>${item.automatic ? '自动收录说明' : isEvent ? '关注价值 · 本站解读' : '核心结论'}</b><p>${esc(isEvent ? item.impact : item.takeaway)}</p></div>
        ${officialGallery(item.images || (item.image?[item.image]:[]))}
        ${isEvent&&!item.automatic?eventBusinessReading(item):''}
        <nav class="mobile-toc" aria-label="本文目录">${sections.map((s,i) => `<button data-section="section-${i}">${i+1}. ${esc(s.title)}</button>`).join('')}</nav>
        ${sections.map((s,i) => `<div id="section-${i}" class="document-section">${sectionContent(s)}</div>`).join('')}
        <section class="sources"><h2>原始资料</h2><p>${item.automatic ? '以下链接指向发布者原文。自动摘要未经人工核验，AI 中文整理已另行标明。' : '以下链接指向资料发布者；本站提供摘要、整理与独立解读。'}</p>${refs(keys)}</section>
        <div class="related"><h2>${isEvent ? '相关背景' : '继续阅读'}</h2>${related.map(a => `<a href="#wiki/${a.id}">${esc(a.title)} →</a>`).join('')}</div>
      </article>
      <aside class="document-rail"><nav aria-label="本文目录"><small>本文内容</small>${sections.map((s,i) => `<button data-section="section-${i}"><span>${String(i+1).padStart(2,'0')}</span>${esc(s.title)}</button>`).join('')}</nav><div class="document-source"><b>${isEvent ? '发布日期与核验日分开记录' : '资料与分析分开呈现'}</b><p>${item.automatic ? '自动条目保留原始发布日期，不把历史回填作为今日新闻。未验证原文全部事实或统计口径。' : isEvent ? '资料核验至 ' + year.checked_on + '。历史公告记录当时状态，后续进展需另有出处。' : '原厂说明帮助解释原理；具体商品的兼容、耐用与口感仍需对应实测。'}</p></div></aside>
    </div>`;
  if (page.querySelector('#cost-form')) updateCost();
}

function costCalculator() {
  return `<div class="calculator"><p>默认值为演算假设，非市场报价。输入同一种币种；修改后仅在本页计算。</p><form id="cost-form" onsubmit="return false"><div class="cost-fields">${[
    ['capsule','预装胶囊每杯价格',0.6,0.01],['kit','器具一次性费用',20,0.01],['beans','豆粉每公斤价格',20,0.01],['dose','每杯粉量（克）',6,0.1],['film','每杯盖膜等耗材',0.03,0.01],['clean','每杯清洗支出',0.02,0.01],['uses','计划使用次数',100,1],
  ].map(([id,label,value,step]) => `<label>${label}<input name="${id}" type="number" value="${value}" min="${id === 'uses' || id === 'dose' ? step : 0}" step="${step}" required></label>`).join('')}</div><div id="cost-result" class="cost-result" aria-live="polite"></div></form><p class="data-note">不含人工时间、机器、运费、税费和失败出杯；粉量应遵照具体器具说明。现金回本与环境影响是不同问题。</p></div>`;
}

function updateCost() {
  const form = page.querySelector('#cost-form');
  if (!form) return;
  const result = page.querySelector('#cost-result');
  if (!form.checkValidity()) { result.textContent = '请填入有效的非负金额、正粉量和正使用次数。'; return; }
  const values = Object.fromEntries(new FormData(form));
  const p = Number(values.capsule), kit = Number(values.kit), uses = Number(values.uses);
  const variable = Number(values.beans) * Number(values.dose) / 1000 + Number(values.film) + Number(values.clean);
  const total = variable + kit / uses;
  const difference = p - variable;
  const breakeven = difference > 0 ? Math.ceil(kit / difference) : null;
  result.innerHTML = `<div><span>每杯变动成本</span><b>${variable.toFixed(3)}</b></div><div><span>含器具分摊／杯</span><b>${total.toFixed(3)}</b></div><div><span>现金回本杯数</span><b>${breakeven === null ? '不回本' : breakeven + ' 杯'}</b></div><p>${breakeven === null ? '当前每杯变动成本不低于预装价格，无法靠差额收回器具支出。' : '回本条件：相同输入持续成立，器具能完成相应使用次数。'} ${uses} 次合计现金差额：<strong>${(p * uses - variable * uses - kit).toFixed(2)}</strong>（正数表示可填充方案支出较少）。</p>`;
}
document.addEventListener('input', event => { if (event.target.closest('#cost-form')) updateCost(); });
