const commerce = window.COFFEE_CONTENT.commerce;
const commerceGuidebook = commerce.guidebook;
function localDate(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function commerceOptions(values, selected) { return Object.entries(values).map(([id,name])=>`<option value="${esc(id)}" ${selected===id?'selected':''}>${esc(name)}</option>`).join(''); }
function commerceGMVUSD(platform) {
  const gmv=commerceGuidebook.profiles[platform.id].gmv;
  return gmv.amount===null?null:gmv.amount/commerceGuidebook.fx.rates[gmv.currency]*commerceGuidebook.fx.rates.USD;
}
function sortedCommercePlatforms() {
  return commerce.platforms.slice().sort((a,b)=>{
    const av=commerceGMVUSD(a),bv=commerceGMVUSD(b);
    return av===null?(bv===null?0:1):bv===null?-1:bv-av;
  });
}
function commerceGMVText(gmv) {
  return gmv.amount===null?'年度 GMV 待核实':`${gmv.quality} · ${(gmv.amount/1e8).toLocaleString('zh-CN',{maximumFractionDigits:3})} 亿 ${gmv.currency} · ${gmv.label} ${gmv.metric}`;
}
function commerceGuideRefs(keys) {
  return [...new Set(keys)].map(key=>{const s=commerceGuidebook.sources[key];return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`;}).join(' · ');
}
function commerceProductTarget(platform) {
  const entries=Object.entries(platform.search||{}).filter(([country])=>platform.countryNotices?.[country]?.status!=='closed');
  const [country,template]=entries.find(([country])=>country==='US')||entries[0]||[];
  const url=template?template.replace('{q}',encodeURIComponent(commerce.productQuery.keyword)):platform.home;
  return {country,url,entries,sold:platform.id==='ebay'&&template?url+'&LH_Sold=1&LH_Complete=1':null};
}
function commerceProductLink(platform) {
  const target=commerceProductTarget(platform);
  return `<a class="pill commerce-sales-button" href="${esc(target.url)}" target="_blank" rel="noopener noreferrer">${target.country?'查看我司产品销售情况':'进入平台查看商品／店铺'} ↗</a>`;
}
function commerceMarketLinks(platform) {
  const target=commerceProductTarget(platform);
  return `<p class="data-note">${target.country?esc(commerce.countries[target.country])+'站 · '+esc(commerce.productQuery.label):'官网入口 · 请在平台选择站点并搜索'+esc(commerce.productQuery.label)}</p>${target.entries.length>1?`<details class="commerce-markets"><summary>其他国家／市场</summary><div>${target.entries.map(([country,template])=>`<a href="${esc(template.replace('{q}',encodeURIComponent(commerce.productQuery.keyword)))}" target="_blank" rel="noopener noreferrer">${esc(commerce.countries[country])} ↗</a>`).join('')}</div></details>`:''}${target.sold||platform.research?`<div class="commerce-entry-links">${target.sold?`<a class="text-link" href="${esc(target.sold)}" target="_blank" rel="noopener noreferrer">查看已售商品 ↗</a>`:''}${platform.research?`<a class="text-link" href="${esc(platform.research)}" target="_blank" rel="noopener noreferrer">官方成交研究（需登录） ↗</a>`:''}</div>`:''}`;
}
function commercePlatformCard(platform) {
  const guide=commerceGuidebook.profiles[platform.id],gmv=guide.gmv,rules=commerceGuidebook.sources[guide.rulesRef];
  return `<article class="panel commerce-platform-card"><span class="tag">${esc(platform.kind)}</span><h3>${esc(platform.name)}</h3><div class="commerce-entry-links">${commerceProductLink(platform)}<a class="pill" href="#commerce/${platform.id}">入驻规则与费用</a><a class="text-link" href="${esc(rules.url)}" target="_blank" rel="noopener noreferrer">官方入驻／规则入口 ↗</a></div>${commerceMarketLinks(platform)}<div class="commerce-gmv"><strong>${esc(commerceGMVText(gmv))}</strong><small>${esc(gmv.amount===null?gmv.reason:gmv.region+' · '+gmv.entity+' · '+gmv.scope)}</small>${commerceGuideRefs([gmv.ref,...(gmv.extraRefs||[])])}</div><p>${esc(platform.note)}</p><small>规则核对：${esc(commerceGuidebook.checkedOn)} · ID：${platform.id}</small><div class="download-row"><a class="text-link" href="${esc(platform.home)}" target="_blank" rel="noopener noreferrer">官网 ↗</a>${platform.reference?`<a class="text-link" href="${esc(platform.reference.url)}" target="_blank" rel="noopener noreferrer">官方业务／规则 ↗</a>`:''}</div></article>`;
}
function renderCommercePlatform(id) {
  const platform=commerce.platforms.find(p=>p.id===id);
  if(!platform){document.title='平台资料未找到 · 咖啡产业观察';page.innerHTML=heading('平台资料未找到','可返回现有平台列表重新选择。')+'<a class="pill" href="#commerce">返回平台列表</a>';return;}
  const guide=commerceGuidebook.profiles[id],gmv=guide.gmv,rules=commerceGuidebook.sources[guide.rulesRef];
  document.title=platform.name+' · 入驻规则与费用 · 咖啡产业观察';
  page.innerHTML=`<a class="text-link" href="#commerce">← 返回电商平台列表</a>`+heading(esc(platform.name),esc(platform.note),'SELLER GUIDE · '+esc(commerceGuidebook.checkedOn))+`<section class="panel commerce-guide-hero" aria-label="官方入驻规则入口"><span class="tag">${esc(guide.market)}</span><div class="commerce-entry-links">${commerceProductLink(platform)}</div>${commerceMarketLinks(platform)}<h2>平台入驻规则与要求</h2><div class="commerce-entry-links"><a class="pill commerce-rules-button" href="${esc(rules.url)}" target="_blank" rel="noopener noreferrer">打开官方入驻／规则页 ↗</a><a class="pill" href="${esc(platform.home)}" target="_blank" rel="noopener noreferrer">平台官网 ↗</a></div><p class="data-note">${esc(rules.name)} · 本轮核对 ${esc(commerceGuidebook.checkedOn)}。下列费用只适用于标明的市场、身份和经营模式；未核实的金额保留空缺。</p>${Object.values(platform.countryNotices||{}).map(n=>`<p class="scope-note">${esc(n.text)} <a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">官方运营公告 ↗</a></p>`).join('')}</section><section class="panel commerce-guide-section" aria-label="个人与企业入驻资格"><h2>谁能入驻</h2><dl><dt>个人／个体经营者</dt><dd>${esc(guide.individual)}</dd><dt>企业</dt><dd>${esc(guide.business)}</dd><dt>中国大陆卖家</dt><dd>${esc(guide.china)}</dd></dl><h3>入驻门槛与资料</h3><ul>${guide.requirements.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p class="commerce-guide-sources">${commerceGuideRefs(guide.refs.filter(key=>!guide.fees.some(f=>f.refs.includes(key))))||commerceGuideRefs([guide.rulesRef])}</p></section><section class="panel commerce-guide-section" aria-label="平台收费明细"><h2>年费、月费、保证金与平台抽点</h2><p class="data-note">月费折算 12 个月只用于预算，不代表平台另外收一项年费。平台佣金、支付、仓储、物流、广告与税费要分开计算。</p>${guide.fees.map(f=>`<article class="commerce-fee"><h3>${esc(f.item)}</h3><p>${esc(f.value)}</p><p class="commerce-guide-sources">${commerceGuideRefs(f.refs)}</p></article>`).join('')}</section><section class="panel commerce-guide-section"><h2>运营与履约模式</h2><ul>${guide.models.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p class="commerce-guide-sources">${commerceGuideRefs(guide.refs)}</p>${guide.limits.length?`<h3>本次核验仍有的缺口</h3><ul>${guide.limits.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</section><section class="panel commerce-guide-section" aria-label="年度成交额与统计口径"><h2>年度成交额（GMV）与排序口径</h2><strong class="commerce-guide-amount">${esc(commerceGMVText(gmv))}</strong>${gmv.amount===null?`<p>${esc(gmv.reason)}</p>`:`<dl><dt>披露主体</dt><dd>${esc(gmv.entity)}</dd><dt>统计期间</dt><dd>${esc(gmv.from)}—${esc(gmv.to)}</dd><dt>覆盖地区</dt><dd>${esc(gmv.region)}</dd><dt>业务范围与指标定义</dt><dd>${esc(gmv.scope)}</dd><dt>排序参考值</dt><dd>约 ${(commerceGMVUSD(platform)/1e8).toLocaleString('zh-CN',{maximumFractionDigits:3})} 亿 USD；原始数值及币种保留如上。</dd></dl>`}${gmv.context?`<p class="scope-note">${esc(gmv.context)}</p>`:''}<p class="commerce-guide-sources">${commerceGuideRefs([gmv.ref,...(gmv.extraRefs||[])])}</p><p class="data-note">${esc(commerceGuidebook.fx.note)} <a href="${esc(commerceGuidebook.fx.url)}" target="_blank" rel="noopener noreferrer">${esc(commerceGuidebook.fx.name)} ↗</a></p></section><a class="pill" href="#commerce">返回平台列表</a>`;
}
function renderCommerce() {
  const amounts=Object.values(commerceGuidebook.profiles).map(p=>p.gmv).filter(gmv=>gmv.amount!==null),estimates=amounts.filter(gmv=>gmv.quality.startsWith('机构估算')).length;
  page.innerHTML=heading('全部平台入口','点击卡片查看可重复填充咖啡胶囊商品、店铺及入驻规则。','MARKETPLACES')+
  `<p class="data-note">${commerce.platforms.length} 个平台 · 年度成交额已收录 ${amounts.length} 家（${amounts.length-estimates} 条官方披露、${estimates} 条机构估算），按 GMV／GMS 从高到低排列，缺值后置。</p><div class="commerce-platforms">${sortedCommercePlatforms().map(commercePlatformCard).join('')}</div><p class="data-note">${esc(commerceGuidebook.sortBasis)} <a href="${esc(commerceGuidebook.fx.url)}" target="_blank" rel="noopener noreferrer">${esc(commerceGuidebook.fx.name)} ↗</a>。平台总成交额不代表咖啡胶囊销量；商品页中点击卖家名称可进入店铺，公开购买提示不等于真实店铺销售报表。</p><p class="data-note">说明依据：${commerce.references.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)} ↗</a>`).join(' · ')}</p>`;
}
