const commerce = window.COFFEE_CONTENT.commerce;
const commerceColumns = ['platform','country','product_type','system','title','product_url','period_start','period_end','units','unit','sales_amount','currency','evidence_type','source_url','observed_at'];
const commerceState = {platform:'amazon',country:'US',product:'reusable',system:'original',query:'',start:'',end:'',records:[],message:''};
function localDate(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
{ const end=new Date(); end.setDate(end.getDate()-1); const start=new Date(end); start.setDate(start.getDate()-29); commerceState.start=localDate(start); commerceState.end=localDate(end); }
function commerceKeyword() {
  if (commerceState.query.trim()) return commerceState.query.trim();
  const product={reusable:'reusable coffee capsule',prefilled:'coffee capsules',accessories:'coffee capsule accessories'}[commerceState.product];
  const system={original:'Nespresso Original',vertuo:'Nespresso Vertuo','dolce-gusto':'Dolce Gusto','k-cup':'Keurig K-Cup',tassimo:'Tassimo T DISC',senseo:'Senseo',other:'',all:''}[commerceState.system];
  return `${system} ${product}`.trim();
}
function commerceLinks() {
  const p=commerce.platforms.find(p=>p.id===commerceState.platform);
  const template=p.search?.[commerceState.country];
  const url=template?.replace('{q}',encodeURIComponent(commerceKeyword()));
  return {platform:p,url,notice:p.countryNotices?.[commerceState.country],sold:p.id==='ebay'&&url?url+'&LH_Sold=1&LH_Complete=1':null};
}
function commerceOptions(values, selected) { return Object.entries(values).map(([id,name])=>`<option value="${esc(id)}" ${selected===id?'selected':''}>${esc(name)}</option>`).join(''); }
function commerceRows() {
  return commerceState.records.filter(r=>r.platform===commerceState.platform&&r.country===commerceState.country&&r.product_type===commerceState.product&&(commerceState.system==='all'||r.system===commerceState.system)&&r.period_start===commerceState.start&&r.period_end===commerceState.end&&(!commerceState.query||r.title.toLowerCase().includes(commerceState.query.toLowerCase())));
}
function commerceTotals(rows, evidence, amount) {
  const groups=new Map();
  for(const row of rows.filter(r=>r.evidence_type===evidence)) {
    const value=amount?row.sales_amount:row.units;
    if(value===null) continue;
    const unit=amount?row.currency:row.unit;
    groups.set(unit,(groups.get(unit)||0)+value);
  }
  return groups.size?[...groups].map(([unit,value])=>`${Number(value.toFixed(2)).toLocaleString('zh-CN')} ${esc(unit)}`).join('<br>'):'—';
}
function commerceRanking() {
  const ranking=commerce.europeanRanking;
  return `<section class="commerce-europe" aria-label="欧洲跨境电商平台排名"><div class="section-head"><div><span class="eyebrow">EUROPEAN MARKETPLACES · ${esc(ranking.checkedOn)}</span><h2>${esc(ranking.title)}</h2><p>${esc(ranking.scope)}</p></div></div><p class="data-note">${esc(ranking.publisher)} · ${esc(ranking.report)} · 公告 ${esc(ranking.announcedOn)}</p><ol class="commerce-ranking">${ranking.entries.map((entry,index)=>{const p=commerce.platforms.find(p=>p.id===entry.platform);return `<li class="panel"><span class="tag">第 ${index+1} 名 · ${esc(p.kind)}</span><h3>${esc(p.name)}</h3><p>${esc(entry.use)}</p><div class="download-row"><button class="text-link" data-commerce-platform="${p.id}">在查询中选择</button><a class="text-link" href="${esc(p.home)}" target="_blank" rel="noopener noreferrer">官网 ↗</a>${p.reference?`<a class="text-link" href="${esc(p.reference.url)}" target="_blank" rel="noopener noreferrer">官方业务／规则 ↗</a>`:''}</div></li>`;}).join('')}</ol><details class="panel commerce-ranking-source"><summary>排名依据与原文出处</summary><p>${esc(ranking.methodology.join('、'))}，以及商业模式等次级指标。${esc(ranking.caveat)}</p><div class="download-row"><a class="text-link" href="${esc(ranking.url)}" target="_blank" rel="noopener noreferrer">发布方官方榜单与方法 ↗</a><a class="text-link" href="${esc(ranking.submittedArticleURL)}" target="_blank" rel="noopener noreferrer">${esc(ranking.submittedArticleTitle)} ↗</a></div><p class="data-note">微信文章：${esc(ranking.submittedArticlePublisher)} · ${esc(ranking.submittedArticleOn)}；本网站已对照发布方名单核验。</p></details></section>`;
}
function renderCommerce() {
  const links=commerceLinks(),rows=commerceRows(),keyword=commerceKeyword();
  const link=(url,label)=>`<a class="pill" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  page.innerHTML=heading('电商市场查询','研究可填充胶囊、预填充胶囊和配件。先选国家与系统，再进入官方商品或成交研究入口。','MARKET RESEARCH')+
  `<p class="scope-note">免费查询版 · 已收录 ${commerce.platforms.length} 个平台入口，包含欧洲跨境电商 TOP 10。当前未连接全市场销量数据库；销量和金额只展示你导入且注明来源的竞品样本，不代表整个国家或平台。</p>
  <p class="scope-note"><a href="#research/reviews">查看已采集的商品评论、痛点与原 ${window.COFFEE_CONTENT.evidence.platforms.length} 平台进度 →</a> · 另有 ${commerce.platforms.filter(p=>!window.COFFEE_CONTENT.evidence.platforms.some(e=>e.id===p.id)).length} 个平台尚未纳入评论采集。</p>
  ${commerceRanking()}
  <form id="commerce-query" class="commerce-form">
    <label>国家／市场<select name="country">${commerceOptions(commerce.countries,commerceState.country)}</select></label>
    <label>平台<select name="platform">${commerce.platforms.map(p=>`<option value="${p.id}" ${p.id===commerceState.platform?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label>
    <label>产品范围<select name="product">${commerceOptions(commerce.products,commerceState.product)}</select></label>
    <label>兼容系统<select name="system">${commerceOptions(commerce.systems,commerceState.system)}</select></label>
    <label>统计开始<input type="date" name="start" value="${esc(commerceState.start)}" required></label>
    <label>统计结束<input type="date" name="end" value="${esc(commerceState.end)}" required></label>
    <label class="commerce-keyword">补充关键词（可选）<input name="query" maxlength="160" value="${esc(commerceState.query)}" placeholder="品牌、型号或具体商品名称"></label>
    <button class="primary" type="submit">查询已导入样本</button>
  </form>
  <section class="panel commerce-results" aria-label="当前市场查询结果">
    <h2>${esc(commerce.countries[commerceState.country])} · ${esc(links.platform.name)}</h2>
    <p class="data-note">${esc(commerce.products[commerceState.product])} · ${esc(commerce.systems[commerceState.system])} · ${esc(commerceState.start)}—${esc(commerceState.end)}</p>
    <div class="download-row">${links.url?link(links.url,'打开该国商品检索'):link(links.notice?.url||links.platform.home,links.notice?'查看该国运营公告':'进入平台官网')}${links.sold?link(links.sold,'查询已售商品'):''}${links.platform.research?link(links.platform.research,links.platform.id==='ebay'?'官方成交研究（需 eBay 登录）':'官方需求研究'):''}</div>
    <p class="data-note">${links.notice?esc(links.notice.text):links.url?'检索词：'+esc(keyword)+'。国家对应平台站点，不等于买家所在国家；请在平台继续筛选。':'尚未配置该国的直接商品检索；官网入口不会自动套用国家、日期或关键词。'} ${esc(links.platform.note)}${links.notice?'':' 商品检索链接不携带统计日期，成交研究中需另设日期。'}</p>
    <div class="commerce-metrics" aria-label="竞品样本统计">
    ${[['公开披露销量',commerceTotals(rows,'public',false)],['公开披露销售额',commerceTotals(rows,'public',true)],['第三方估算销量',commerceTotals(rows,'estimate',false)],['第三方估算销售额',commerceTotals(rows,'estimate',true)]].map(([name,value])=>`<div><span>${name}</span><strong>${value}</strong></div>`).join('')}</div>
    <p class="data-note">当前匹配 ${rows.length} 条样本（已导入 ${commerceState.records.length} 条）。仅统计起止日期完全一致的记录；金额保留原币种，件／套／颗／盒分别累计。合计只包含有值记录，未披露不补零，也不根据售价推算销售额；无值显示“—”。记录之间的重叠商品或变体仍需核验。</p>
    ${rows.length?table(['商品／证据','销量与单位','销售金额','数据性质'],rows.map(r=>[`${r.title} · ${r.source_url}`,r.units===null?'未披露':`${r.units} ${r.unit}`,r.sales_amount===null?'未披露':`${r.sales_amount} ${r.currency}`,r.evidence_type==='public'?'公开披露样本':'第三方估算样本']),'竞品样本明细'):'<p class="commerce-empty">尚无匹配的可核验销量。可先查询 eBay 已售商品，或登录 eBay 官方 Product Research；亚马逊页面的“过去一个月购买”是提示值，不能计算精确成交金额。</p>'}
  </section>
  <section class="panel commerce-import"><h2>整理你查到的竞品数据</h2><p class="data-note">按模板记录产品链接、来源、统计期、数量单位和原币种，再导入汇总。数据只在当前页面内存处理，不上传、不跨电脑保存，刷新后清空。仅接受明确统计期内的数量，不接受累计订单或“100+”下限当作精确销量。</p><div class="download-row"><button class="pill" data-commerce-template>下载 CSV 空白模板</button><label class="pill">导入 CSV <input id="commerce-import" type="file" accept=".csv,text/csv"></label><button class="pill" data-commerce-clear>清空本次样本</button></div><p role="status" id="commerce-message">${esc(commerceState.message)}</p><details><summary>模板填写规则</summary><p class="data-note">platform 用下方平台 ID；country 用 US、DE、FR 等国家代码；product_type 用 reusable、prefilled、accessories；system 用 original、vertuo、dolce-gusto、k-cup、tassimo、senseo 或 other。units 与 sales_amount 至少填一项；unit 用件／套／颗／盒；currency 用 USD／EUR／GBP 等三位币种代码；evidence_type 用 public（公开披露）或 estimate（第三方估算）。period_start、period_end、observed_at 用 YYYY-MM-DD。每条必须有 HTTPS 商品链接和证据来源链接。公开购买量的“100+”不能填成 100。</p></details></section>
  <div class="section-head"><div><h2>全部平台入口</h2><p>这是访问和研究入口，未宣称已取得这些平台的销量权限。</p></div></div><div class="commerce-platforms">${commerce.platforms.map(p=>`<article class="panel"><span class="tag">${esc(p.kind)}</span><h3>${esc(p.name)}</h3><small>ID：${p.id}</small><p>${esc(p.note)}</p><div class="download-row"><button class="text-link" data-commerce-platform="${p.id}">在查询中选择</button>${link(p.home,'官网')}</div></article>`).join('')}</div><p class="data-note">说明依据：${commerce.references.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)} ↗</a>`).join(' · ')}</p>`;
}
function parseCommerceCsv(text) {
  const rows=[]; let row=[],value='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"') { if(quoted&&text[i+1]==='"') {value+='"';i++;} else if(quoted) quoted=false; else if(value==='') quoted=true; else throw new Error('CSV 引号格式错误'); }
    else if(c===','&&!quoted) {row.push(value);value='';}
    else if((c==='\n'||c==='\r')&&!quoted) {if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(v=>v.trim()))rows.push(row);row=[];value='';}
    else value+=c;
  }
  if(quoted) throw new Error('CSV 引号未闭合');
  row.push(value); if(row.some(v=>v.trim())) rows.push(row);
  const header=rows.shift()?.map(v=>v.trim());
  if(!header||header.length!==commerceColumns.length||new Set(header).size!==header.length||commerceColumns.some(k=>!header.includes(k))) throw new Error('表头不匹配，请使用空白模板');
  if(rows.length>5000) throw new Error('单次最多导入 5000 条');
  const seen=new Set(),validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
  return rows.map((values,i)=>{
    const fail=message=>{throw new Error(`第 ${i+2} 行：${message}`);};
    if(values.length!==header.length) fail('列数不匹配');
    const r=Object.fromEntries(header.map((k,index)=>[k,values[index].trim()]));
    if(!commerce.platforms.some(p=>p.id===r.platform)||!commerce.countries[r.country]||!commerce.products[r.product_type]||!commerce.systems[r.system]||r.system==='all') fail('平台、国家、产品或系统代码不正确');
    if(!r.title||r.title.length>500) fail('商品名必填且不超过 500 字');
    for(const key of ['product_url','source_url']) {try {const u=new URL(r[key]);if(u.protocol!=='https:'||u.username||u.password)fail('链接必须是无凭据的 HTTPS 地址');}catch {fail('商品及来源链接必须填写有效 HTTPS 地址');}}
    if(!['period_start','period_end','observed_at'].every(k=>validDate(r[k]))||r.period_start>r.period_end||r.period_end>r.observed_at||r.observed_at>localDate(new Date())) fail('日期无效、统计期颠倒或超出观察日期');
    if(!['public','estimate'].includes(r.evidence_type)) fail('数据性质必须为 public 或 estimate');
    if(r.units!==''&&!/^\d+$/.test(r.units)) fail('销量只接受明确整数，不接受 100+ 等下限或累计标记');
    if(r.sales_amount!==''&&!/^\d+(\.\d{1,2})?$/.test(r.sales_amount)) fail('销售额须为非负数，最多两位小数');
    r.units=r.units===''?null:Number(r.units); r.sales_amount=r.sales_amount===''?null:Number(r.sales_amount);
    if((r.units===null&&r.sales_amount===null)||(r.units!==null&&!Number.isSafeInteger(r.units))||(r.sales_amount!==null&&(!Number.isFinite(r.sales_amount)||r.sales_amount>1e12))) fail('至少填写一项有效销量或销售金额');
    if(r.units!==null&&!['件','套','颗','盒'].includes(r.unit)) fail('数量单位须为件、套、颗或盒');
    if(r.sales_amount!==null&&!/^[A-Z]{3}$/.test(r.currency)) fail('金额需要三位大写币种代码');
    const key=[r.platform,r.country,r.product_url,r.period_start,r.period_end,r.evidence_type].join('|');
    if(seen.has(key))fail('同一商品与统计期重复，请先合并核验');seen.add(key);
    return r;
  });
}
document.addEventListener('submit',event=>{
  if(event.target.id!=='commerce-query')return;
  event.preventDefault(); const form=new FormData(event.target);
  for(const key of ['platform','country','product','system','query','start','end'])commerceState[key]=String(form.get(key)||'');
  if(commerceState.start>commerceState.end){commerceState.message='统计开始日期不能晚于结束日期。';renderCommerce();return;}
  commerceState.message='查询已完成；外部平台的检索结果请点击官方入口查看。';renderCommerce();
});
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.commercePlatform){commerceState.platform=button.dataset.commercePlatform;renderCommerce();window.scrollTo({top:0,behavior:'instant'});}
  if(button.hasAttribute('data-commerce-clear')){commerceState.records=[];commerceState.message='本次样本已清空。';renderCommerce();}
  if(button.hasAttribute('data-commerce-template')){
    const url=URL.createObjectURL(new Blob(['\uFEFF'+commerceColumns.join(',')+'\r\n'],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='coffee-market-template.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
});
document.addEventListener('change',async event=>{
  if(event.target.id!=='commerce-import')return;
  const file=event.target.files[0];if(!file)return;
  try{if(file.size>1024*1024)throw new Error('文件不能超过 1 MB'); const records=parseCommerceCsv(await file.text()); commerceState.records=records;commerceState.message=`已导入 ${records.length} 条样本。请选择对应国家、产品、系统和完全一致的统计日期查询。`;}
  catch(error){commerceState.message='导入未生效：'+error.message;}
  if(state.view==='commerce')renderCommerce();
});
