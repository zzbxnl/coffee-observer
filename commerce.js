const commerce = window.COFFEE_CONTENT.commerce;
const commerceGuidebook = commerce.guidebook;
const storeResearch = commerce.storeResearch;
const storeTableState = { traffic:'all', market:'all', system:'all', type:'all' };
const storeTrafficNames = {paid:'付费推广',organic:'自然展示（免费位）',unknown:'无法判断'};
const storeTypeNames = {reusable:'可填充胶囊／滤杯',prefilled:'预填充胶囊',accessories:'周边配件／耗材'};
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
function commerceSearchURL(template) {
  return template.replace('{q}',encodeURIComponent(commerce.productQuery.keyword)).replace('{slug}',encodeURIComponent(commerce.productQuery.keyword.trim().replace(/\s+/g,'-')));
}
function commerceProductTarget(platform) {
  const entries=Object.entries(platform.search||{}).filter(([country])=>platform.countryNotices?.[country]?.status!=='closed');
  const [country,template]=entries.find(([country])=>country==='US')||entries[0];
  const url=commerceSearchURL(template);
  return {country,url,entries,sold:platform.id==='ebay'?url+'&LH_Sold=1&LH_Complete=1':null};
}
function commerceProductLink(platform) {
  const target=commerceProductTarget(platform);
  return `<a class="pill commerce-sales-button" href="${esc(target.url)}" target="_blank" rel="noopener noreferrer">查看此平台销售情况 ↗</a>`;
}
function commerceMarketLinks(platform) {
  const target=commerceProductTarget(platform);
  return `<p class="data-note">${esc(commerce.countries[target.country])}${target.country==='WW'?'':'站'} · ${esc(commerce.productQuery.label)}</p>${target.entries.length>1?`<details class="commerce-markets"><summary>其他国家／市场</summary><div>${target.entries.map(([country,template])=>`<a href="${esc(commerceSearchURL(template))}" target="_blank" rel="noopener noreferrer">${esc(commerce.countries[country])} ↗</a>`).join('')}</div></details>`:''}${target.sold||platform.research?`<div class="commerce-entry-links">${target.sold?`<a class="text-link" href="${esc(target.sold)}" target="_blank" rel="noopener noreferrer">查看已售商品 ↗</a>`:''}${platform.research?`<a class="text-link" href="${esc(platform.research)}" target="_blank" rel="noopener noreferrer">官方成交研究（需登录） ↗</a>`:''}</div>`:''}`;
}
function commercePlatformCard(platform) {
  const guide=commerceGuidebook.profiles[platform.id],gmv=guide.gmv,rules=commerceGuidebook.sources[guide.rulesRef];
  return `<article class="panel commerce-platform-card"><span class="tag">${esc(platform.kind)}</span><h3>${esc(platform.name)}</h3><div class="commerce-entry-links">${commerceProductLink(platform)}<a class="pill" href="#commerce/${platform.id}">入驻规则与费用（简述）</a><a class="pill store-table-entry" href="#commerce/stores-${platform.id}">店铺与 SKU 对比（${storeResearch.stores.filter(s=>s.platform===platform.id).length}/10 店）</a><a class="text-link" href="${esc(rules.url)}" target="_blank" rel="noopener noreferrer">官方入驻／规则入口 ↗</a></div>${commerceMarketLinks(platform)}<div class="commerce-gmv"><strong>${esc(commerceGMVText(gmv))}</strong><small>${esc(gmv.amount===null?gmv.reason:gmv.region+' · '+gmv.entity+' · '+gmv.scope)}</small>${commerceGuideRefs([gmv.ref,...(gmv.extraRefs||[])])}</div><p>${esc(platform.note)}</p><small>规则核对：${esc(commerceGuidebook.checkedOn)} · ID：${platform.id}</small><div class="download-row"><a class="text-link" href="${esc(platform.home)}" target="_blank" rel="noopener noreferrer">官网 ↗</a>${platform.reference?`<a class="text-link" href="${esc(platform.reference.url)}" target="_blank" rel="noopener noreferrer">官方业务／规则 ↗</a>`:''}</div></article>`;
}
function renderCommercePlatform(id) {
  const platform=commerce.platforms.find(p=>p.id===id);
  if(!platform){document.title='平台资料未找到 · 咖啡产业观察';page.innerHTML=heading('平台资料未找到','可返回现有平台列表重新选择。')+'<a class="pill" href="#commerce">返回平台列表</a>';return;}
  const guide=commerceGuidebook.profiles[id],gmv=guide.gmv,rules=commerceGuidebook.sources[guide.rulesRef];
  document.title=platform.name+' · 入驻规则与费用（简述） · 咖啡产业观察';
  page.innerHTML=`<a class="text-link" href="#commerce">← 返回电商平台列表</a>`+heading(esc(platform.name),esc(platform.note),'SELLER GUIDE · '+esc(commerceGuidebook.checkedOn))+`<section class="panel commerce-guide-hero" aria-label="官方入驻规则入口"><span class="tag">${esc(guide.market)}</span><div class="commerce-entry-links">${commerceProductLink(platform)}</div>${commerceMarketLinks(platform)}<h2>平台入驻规则与要求</h2><div class="commerce-entry-links"><a class="pill commerce-rules-button" href="${esc(rules.url)}" target="_blank" rel="noopener noreferrer">打开官方入驻／规则页 ↗</a><a class="pill" href="${esc(platform.home)}" target="_blank" rel="noopener noreferrer">平台官网 ↗</a></div><p class="data-note">${esc(rules.name)} · 本轮核对 ${esc(commerceGuidebook.checkedOn)}。下列费用只适用于标明的市场、身份和经营模式；未核实的金额保留空缺。</p>${Object.values(platform.countryNotices||{}).map(n=>`<p class="scope-note">${esc(n.text)} <a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">官方运营公告 ↗</a></p>`).join('')}</section><section class="panel commerce-guide-section" aria-label="个人与企业入驻资格"><h2>谁能入驻</h2><dl><dt>个人／个体经营者</dt><dd>${esc(guide.individual)}</dd><dt>企业</dt><dd>${esc(guide.business)}</dd><dt>中国大陆卖家</dt><dd>${esc(guide.china)}</dd></dl><h3>入驻门槛与资料</h3><ul>${guide.requirements.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p class="commerce-guide-sources">${commerceGuideRefs(guide.refs.filter(key=>!guide.fees.some(f=>f.refs.includes(key))))||commerceGuideRefs([guide.rulesRef])}</p></section><section class="panel commerce-guide-section" aria-label="平台收费明细"><h2>年费、月费、保证金与平台抽点</h2><p class="data-note">月费折算 12 个月只用于预算，不代表平台另外收一项年费。平台佣金、支付、仓储、物流、广告与税费要分开计算。</p>${guide.fees.map(f=>`<article class="commerce-fee"><h3>${esc(f.item)}</h3><p>${esc(f.value)}</p><p class="commerce-guide-sources">${commerceGuideRefs(f.refs)}</p></article>`).join('')}</section><section class="panel commerce-guide-section"><h2>运营与履约模式</h2><ul>${guide.models.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p class="commerce-guide-sources">${commerceGuideRefs(guide.refs)}</p>${guide.limits.length?`<h3>本次核验仍有的缺口</h3><ul>${guide.limits.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</section><section class="panel commerce-guide-section" aria-label="年度成交额与统计口径"><h2>年度成交额（GMV）与排序口径</h2><strong class="commerce-guide-amount">${esc(commerceGMVText(gmv))}</strong>${gmv.amount===null?`<p>${esc(gmv.reason)}</p>`:`<dl><dt>披露主体</dt><dd>${esc(gmv.entity)}</dd><dt>统计期间</dt><dd>${esc(gmv.from)}—${esc(gmv.to)}</dd><dt>覆盖地区</dt><dd>${esc(gmv.region)}</dd><dt>业务范围与指标定义</dt><dd>${esc(gmv.scope)}</dd><dt>排序参考值</dt><dd>约 ${(commerceGMVUSD(platform)/1e8).toLocaleString('zh-CN',{maximumFractionDigits:3})} 亿 USD；原始数值及币种保留如上。</dd></dl>`}${gmv.context?`<p class="scope-note">${esc(gmv.context)}</p>`:''}<p class="commerce-guide-sources">${commerceGuideRefs([gmv.ref,...(gmv.extraRefs||[])])}</p><p class="data-note">${esc(commerceGuidebook.fx.note)} <a href="${esc(commerceGuidebook.fx.url)}" target="_blank" rel="noopener noreferrer">${esc(commerceGuidebook.fx.name)} ↗</a></p></section><a class="pill" href="#commerce">返回平台列表</a>`;
}
function renderCommerce() {
  const amounts=Object.values(commerceGuidebook.profiles).map(p=>p.gmv).filter(gmv=>gmv.amount!==null),estimates=amounts.filter(gmv=>gmv.quality.startsWith('机构估算')).length;
  page.innerHTML=heading('全部平台入口','点击卡片查看可重复填充咖啡胶囊商品、店铺及入驻规则。','MARKETPLACES')+
  `<p class="data-note">${commerce.platforms.length} 个平台 · 年度成交额已收录 ${amounts.length} 家（${amounts.length-estimates} 条官方披露、${estimates} 条机构估算），按 GMV／GMS 从高到低排列，缺值后置。</p><div class="commerce-platforms">${sortedCommercePlatforms().map(commercePlatformCard).join('')}</div><p class="data-note">${esc(commerceGuidebook.sortBasis)} <a href="${esc(commerceGuidebook.fx.url)}" target="_blank" rel="noopener noreferrer">${esc(commerceGuidebook.fx.name)} ↗</a>。平台总成交额不代表咖啡胶囊销量；商品页中点击卖家名称可进入店铺，公开购买提示不等于真实店铺销售报表。</p><p class="data-note">说明依据：${commerce.references.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)} ↗</a>`).join(' · ')}</p>`;
}

function storeTableItems(platformId) {
  return storeResearch.stores.filter(s=>platformId==='all'||s.platform===platformId).flatMap(store=>store.items.map(item=>({store,item}))).filter(({store,item})=>
    (storeTableState.traffic==='all'||item.placement.type===storeTableState.traffic)&&
    (storeTableState.market==='all'||store.market===storeTableState.market)&&
    (storeTableState.system==='all'||item.system===storeTableState.system)&&
    (storeTableState.type==='all'||item.type===storeTableState.type)&&match({store:store.name,platform:store.platform,market:store.market,item}));
}
function storeTablePicture(item) {
  const image=window.COFFEE_CONTENT.visuals.images[item.image];
  return image?`<figure class="store-sku-figure"><a href="${esc(image.file)}" target="_blank" rel="noopener noreferrer" aria-label="放大商品图：${esc(item.name)}"><img class="store-sku-image" src="${esc(image.file)}" alt="${esc(item.name)} · 对应平台商品原图" width="108" height="108" loading="lazy" decoding="async"></a><figcaption><a href="${esc(image.provenanceURL||image.source)}" target="_blank" rel="noopener noreferrer">${image.provenanceURL?'历史档案中的平台原图':'平台商品原图'} ↗</a></figcaption></figure>`:`<span class="data-note">${esc(item.imageGap)}</span>`;
}
function storePriceCell(item){
  const p=item.price;
  if(!p)return `<td class="store-price-cell"><span>${esc(item.priceGap||'报价尚待补录')}</span><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">查看此商品当地报价 ↗</a></td>`;
  const amount=value=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:p.currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
  const at=p.observedAt||item.checkedAt,date=new Date(at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});
  return `<td class="store-price-cell"><b class="store-price-value">${esc(amount(p.amount))}${p.maxAmount?' – '+esc(amount(p.maxAmount)):p.starting?' 起':''} <small>${esc(p.currency)}</small></b><small>${esc(p.offerType||'展示标价')}${p.quality==='indexed'?' · 历史索引':''}</small>${item.sourceSnapshot?`<p class="data-note">${esc(item.sourceSnapshot.label)} · ${esc(item.sourceSnapshot.dateNote)}</p>`:''}${item.availabilityNote?`<p class="data-note"><b>${esc(item.availabilityNote)}</b></p>`:''}${p.pack?`<p>${esc(p.pack)}</p>`:''}${(p.promotions||[]).map(x=>`<p class="store-price-promo">${esc(x.label)} ${esc(amount(x.amount))}<small>${esc(x.condition)}</small></p>`).join('')}<small>${p.quality==='indexed'?'索引核对':'报价读取'}：<time datetime="${esc(at)}">${esc(date)}</time>（北京时间）</small><a href="${esc(p.source||item.url)}" target="_blank" rel="noopener noreferrer">报价原文 ↗</a><details><summary>税运费与报价口径</summary><p>${esc(p.basis)}</p><p>${esc(p.shipping||'税费／运费按收货地址核对；优惠券与到手价未核验')}</p></details></td>`;
}
function storeTableRow({store,item}) {
  const platform=commerce.platforms.find(p=>p.id===store.platform),p=item.placement;
  return `<tr data-store-key="${esc(store.id)}" data-placement="${esc(p.type)}"><th scope="row"><a href="${esc(store.url)}" target="_blank" rel="noopener noreferrer">${esc(store.name)} ↗</a>${store.identityKind==='business-name'||store.urlKind==='listing'?'<small>主体依据链接（商品页），独立店铺链接未取得</small>':''}<small>${esc(platform.name)} · ${esc(commerce.countries[store.market]||store.market)}</small><small>${store.sellerId?'卖家 ID：'+esc(store.sellerId):(store.sellerName?'原页卖家名称：'+esc(store.sellerName):'公开经营主体：'+esc(store.businessName))+'（平台编号未取得）'}</small><a class="store-source-link" href="${esc(store.identitySource)}" target="_blank" rel="noopener noreferrer">销售主体依据 ↗</a>${item.sourceSnapshot?.kind==='third-party-archive'?'<p class="data-note"><b>历史店铺候选，当前经营状态未核验</b></p>':''}${store.shopSales?`<p class="data-note">店铺累计销售提示：${esc(store.shopSales.text)}<br>全店历史口径，非本商品月销量。</p>`:''}</th>
    <td>${storeTablePicture(item)}</td><td class="store-product-name"><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.name)} ↗</a><small>（${esc(item.zh)}）</small><code>${esc(item.listingIdType)}：${esc(item.listingId)}</code><small>卖家 SKU：${esc(item.sellerSKU||'未公开')}</small><details><summary>规格与取样说明</summary><p>${esc(item.variant)}</p><p>${esc(item.selection)}</p></details></td>
    <td>${esc(storeTypeNames[item.type])}<small>${esc(window.COFFEE_CONTENT.research.systems[item.system]||'系统待确认')}</small><small>平台／供应商声明，本站未实测</small></td>
    <td><span class="store-placement ${esc(p.type)}">${esc(storeTrafficNames[p.type])}</span><details><summary>展示位证据</summary><p>${esc(p.evidence)}</p><p>观察：${esc(p.observedAt.slice(0,10))}</p><a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">核对原始展示页 ↗</a></details></td>
    ${storePriceCell(item)}
    <td>${item.sales?`<b>${esc(item.sales.text)}</b><small>${esc(item.sales.basis)}</small>`:'本商品销售数量未公开／未取得'}<small>精确月销量：未取得</small></td>
    <td>未公开／未取得<small>未用当前标价乘购买提示推算</small></td>
    <td>${item.rating!==null?`<b>${esc(item.rating)} / 5</b>`:'评分未取得'}${item.ratingCount!==null?`<small>${esc(item.ratingCount.toLocaleString('zh-CN'))} 个评价／评分</small>`:''}<small>${esc(item.reviewScope)}</small></td>
    <td>${item.painRefs.length?item.painRefs.map(p=>`<p>${esc(p.summary)}</p><details><summary>改进建议与出处</summary><p>${esc(p.action)}</p><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.date)} 评论依据 ↗</a></details>`).join(''):'尚未取得可关联的痛点案例'}<small>评论样本不等于退货率</small></td>
    <td>${esc(item.shipping)}<small>库存／实际时效／售后：以收货地区与平台页面为准</small></td>
    <td><time>${esc(item.checkedAt.slice(0,10))}</time><small>${esc(item.freshnessNote||(item.freshness==='live'?'公开页面读取快照':'公开索引快照；不视为即时价格'))}</small><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">商品原文 ↗</a></td></tr>`;
}
function renderCommerceStores(platformId='all') {
  if(platformId!=='all'&&!commerce.platforms.some(p=>p.id===platformId)){renderCommercePlatform(platformId);return;}
  const rows=storeTableItems(platformId),platform=commerce.platforms.find(p=>p.id===platformId),unique=new Set(rows.map(r=>r.store.id));
  const target=storeResearch.platforms.find(p=>p.id===platformId),actual=storeResearch.stores.filter(s=>platformId==='all'||s.platform===platformId).length;
  document.title=(platform?platform.name+' · ':'')+'店铺与 SKU 对比 · 咖啡产业观察';
  const count=type=>new Set(storeResearch.stores.filter(s=>platformId==='all'||s.platform===platformId).flatMap(s=>s.items.filter(i=>i.placement.type===type).map(()=>s.id))).size;
  page.innerHTML=`<a class="text-link" href="#commerce">← 返回全部平台入口</a>`+heading('店铺与 SKU 对比',platform?platform.name+' · 每个平台目标 10 家不同店铺，同店多商品只计 1 家':'咖啡胶囊及周边配件 · 每个平台目标 10 家不同店铺','SELLER & SKU RESEARCH')+
    `<section class="panel store-table-intro"><p><b>${platform?`已录入 ${actual}/10 家店铺候选 · 尚缺 ${Math.max(0,10-actual)} 家`:`已录入 ${actual} 家不同店铺候选 · 覆盖 ${new Set(storeResearch.stores.map(s=>s.platform)).size}/${storeResearch.platforms.length} 个平台`}</b></p><p>公开相关候选，非销量前十。含 ${new Set(rows.filter(r=>r.item.sourceSnapshot?.kind==='third-party-archive').map(r=>r.store.id)).size} 家第三方历史档案候选；档案不能证明当前仍在经营或同价。推广分类仅描述取得证据的展示位，不代表店铺流量占比。</p><details><summary>取样、推广分类与图片口径</summary><p>${esc(storeResearch.method)}</p><p>“自然展示”指本次读取的商品展示位没有广告标识；不等于店铺没有付费投放，也不是免费流量占比。“无法判断”保持单独分类，未补造推广费用或流量。${esc(storeResearch.imagePolicy)}</p></details>${target?`<p class="data-note">${esc(target.accessNote)} · <a href="${esc(target.queryURL)}" target="_blank" rel="noopener noreferrer">对应公开检索入口 ↗</a></p>`:''}</section>
    <div class="research-toolbar store-table-filters"><label>平台<select id="store-table-platform">${commerceOptions({all:'全部平台',...Object.fromEntries(sortedCommercePlatforms().map(p=>[p.id,p.name+'（'+storeResearch.stores.filter(s=>s.platform===p.id).length+'/10 店）']))},platformId)}</select></label><label>国家站点<select id="store-table-market">${commerceOptions({all:'全部站点',...commerce.countries},storeTableState.market)}</select></label><label>兼容系统<select id="store-table-system">${commerceOptions({all:'全部系统',...window.COFFEE_CONTENT.research.systems,unconfirmed:'系统待确认'},storeTableState.system)}</select></label><label>商品类型<select id="store-table-type">${commerceOptions({all:'全部类型',...storeTypeNames},storeTableState.type)}</select></label></div>
    <div class="filters store-traffic-filters" role="group" aria-label="推广与自然展示筛选">${Object.entries({all:'全部',paid:`付费推广（${count('paid')} 店）`,organic:`自然展示／免费位（${count('organic')} 店）`,unknown:`无法判断（${count('unknown')} 店）`}).map(([key,label])=>`<button class="pill ${storeTableState.traffic===key?'active':''}" data-store-traffic="${key}" aria-pressed="${storeTableState.traffic===key}">${esc(label)}</button>`).join('')}</div>
    <div class="store-table-summary"><p role="status">当前 ${unique.size} 家不同店铺 · ${rows.length} 个商品记录 · ${rows.filter(r=>r.item.price).length} 个有报价（其中 ${rows.filter(r=>r.item.price?.quality==='indexed').length} 个历史索引）· 核对 ${esc(storeResearch.checkedOn)}</p><button class="pill" data-store-export>导出当前表格 CSV（含图片来源链接）</button></div><p class="data-note">可用顶部搜索框查店铺、商品、编号。表格可横向滚动；金额保留原币种，不把不同期间的销售提示混排成销量榜。未公开记为缺失，不填 0。</p>
    ${rows.length?`<div class="store-table-scroll" role="region" aria-label="店铺及商品销售证据表" tabindex="0"><table class="store-research-table"><caption>${esc(platform?.name||'全部平台')} · 按平台卖家 ID、原页卖家名称或公开经营主体去重，商品级数据不等于单店销售报表</caption><thead><tr>${['店铺／站点','SKU 商品图','商品、规格与编号','类型／系统','推广／自然展示','价格／优惠','销售数量证据','销售金额','商品评分','评论痛点','履约与售后','日期／原文'].map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${rows.map(storeTableRow).join('')}</tbody></table></div>`:empty('当前条件暂无已核对店铺','此处为空不代表平台没有商品或没有投放。可切换其他分类；下方保留实际缺口。')}
    <details class="store-coverage" ${actual===0?'open':''}><summary>各平台 10 店录入进度与缺口</summary><div class="store-table-scroll"><table><caption>所有平台均以 10 家不同店铺为目标；没有用重复店铺或无关商品补满</caption><thead><tr><th>平台</th><th>不同店铺</th><th>目标／缺口</th><th>本次读取情况</th></tr></thead><tbody>${sortedCommercePlatforms().map(p=>{const row=storeResearch.platforms.find(s=>s.id===p.id),n=storeResearch.stores.filter(s=>s.platform===p.id).length;return `<tr><th scope="row"><a href="#commerce/stores-${p.id}">${esc(p.name)}</a></th><td>${n}</td><td>10 / 缺 ${10-n}</td><td>${esc(row.accessNote)}<br><a href="${esc(row.queryURL)}" target="_blank" rel="noopener noreferrer">已检查的公开入口 ↗</a></td></tr>`;}).join('')}</tbody></table></div></details>`;
}
function exportStoreTable() {
  const platformId=state.detail==='stores'?'all':state.detail.slice(7),rows=storeTableItems(platformId);
  const fields=['平台','国家站点','店铺','卖家ID','公开经营主体','店铺链接','店铺累计销售提示','店铺销售统计口径','商品名','中文说明','平台编号类型','商品编号','卖家SKU','规格边界','系统','类型','展示分类','分类依据','展示证据URL','标价','币种','价格口径','包装数量','报价读取时间','报价性质','会员或其他优惠','报价来源','销售提示','数量统计口径','销售金额','评分','评分人数','评论痛点','物流','核对时间','数据时效说明','商品URL','原图URL','图片来源页','区间上限','原页卖家名称','档案来源类型','实际报价日期','报价日期局限','库存说明','图片档案出处'];
  const values=rows.map(({store:s,item:i})=>{const image=window.COFFEE_CONTENT.visuals.images[i.image];return [commerce.platforms.find(p=>p.id===s.platform).name,s.market,s.name,s.sellerId,s.businessName,s.url,s.shopSales?.text,s.shopSales?.basis,i.name,i.zh,i.listingIdType,i.listingId,i.sellerSKU,i.variant,i.system,storeTypeNames[i.type],storeTrafficNames[i.placement.type],i.placement.evidence,i.placement.source,i.price?.amount,i.price?.currency,i.price?.basis,i.price?.pack,i.price?.observedAt||i.checkedAt,i.price?.quality,(i.price?.promotions||[]).map(p=>p.label+' '+p.amount+' '+p.currency+' '+p.condition).join('；'),i.price?.source||i.url,i.sales?.text,i.sales?.basis,null,i.rating,i.ratingCount,i.painRefs.map(p=>p.summary).join('；'),i.shipping,i.checkedAt,i.freshnessNote||i.freshness,i.url,image?.imageURL,image?.source,i.price?.maxAmount,s.sellerName,i.sourceSnapshot?.label,i.sourceSnapshot?.dataAsOf,i.sourceSnapshot?.dateNote,i.availabilityNote,image?.provenanceURL];});
  const cell=value=>{const text=String(value??'未公开／未取得');return '"'+(/^[=+@\-\t\r]/.test(text)?"'":'')+text.replaceAll('"','""')+'"';};
  const url=URL.createObjectURL(new Blob(['\uFEFF'+[fields,...values].map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`coffee-stores-${platformId}-${storeResearch.checkedOn}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.hasAttribute('data-store-traffic')){storeTableState.traffic=b.dataset.storeTraffic;renderCommerceStores(state.detail==='stores'?'all':state.detail.slice(7));}if(b.hasAttribute('data-store-export'))exportStoreTable();});
document.addEventListener('change',event=>{const id=event.target.id;if(id==='store-table-platform'){location.hash=event.target.value==='all'?'commerce/stores':'commerce/stores-'+event.target.value;return;}const keys={'store-table-market':'market','store-table-system':'system','store-table-type':'type'};if(keys[id]){storeTableState[keys[id]]=event.target.value;renderCommerceStores(state.detail==='stores'?'all':state.detail.slice(7));}});
