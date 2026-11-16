/* ماتشا وكّن الجمل — أدوات مشتركة بين صفحة العملاء ولوحة المحل */
(function(){
const CFG = window.WK_CONFIG || {};
const LIVE = !!(CFG.API_URL && /^https:\/\//.test(CFG.API_URL));

const store = {
  get(k, d){ try{ const v = localStorage.getItem('wk_' + k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('wk_' + k, JSON.stringify(v)); }catch(e){} }
};
function riyadhNow(){ const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 180) * 60000); }
const pad = n => String(n).padStart(2, '0');
function fmtHour(h){ h = h % 24; const hh = Math.floor(h), mm = Math.round((h - hh) * 60); const ap = hh >= 12 ? 'م' : 'ص'; return `${(hh % 12) || 12}${mm ? ':' + pad(mm) : ''} ${ap}`; }
const DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
function normPhone(p){ p = String(p || '').replace(/[^\d]/g, ''); if (p.indexOf('966') === 0) p = '0' + p.slice(3); if (p.length === 9 && p[0] === '5') p = '0' + p; return p; }
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PAYS = ['كاش عند الاستلام', 'شبكة أو Apple Pay عند الاستلام', 'تحويل بنكي'];

/* ---------- بيانات وضع العرض (بدون شيت) — نفس محتوى الشيت الأولي ---------- */
const M = (id, name, cat, price, cal, img, milk, badge = '', desc = '', adds = []) => ({id, name, cat, price, cal, on:true, desc, badge, img, milk, adds});
const SEED = {
  menu: [
    M('latte','ايس ماتشا لاتيه','ماتشا',20,187,'latte.webp','paid','الأكثر طلبًا'),
    M('ccaramel','ايس ماتشا كريم كراميل','ماتشا',20,220,'ccaramel.webp','paid'),
    M('wmocha','ايس ماتشا وايت موكا','ماتشا',20,335,'wmocha.webp','paid'),
    M('vhoney','ايس ماتشا فانيلا عسل','ماتشا',20,180,'vhoney.webp','paid','🍯'),
    M('coconut','ايس ماتشا ماء جوز الهند','ماتشا',22,70,'coconut.webp','none','خفيف','بدون حليب'),
    M('spanish','ايس سبانش السحابة','قهوة باردة',19,190,'spanish.webp','paid','☁️'),
    M('toffee','ايس توفي لاتيه','قهوة باردة',19,330,'toffee.webp','paid'),
    M('k_wmocha','ايس وايت موكا','قهوة باردة',19,160,'k_wmocha.webp','paid'),
    M('k_ccaramel','ايس كريم كراميل لاتيه','قهوة باردة',20,250,'k_ccaramel.webp','paid'),
    M('coldfoam','امريكانو كولد فوم','قهوة باردة',20,110,'cold_foam.webp','none'),
    M('freddo','الفريدو','قهوة باردة',14,'','freddo.webp','none'),
    M('drip','ايس دريب','قهوة باردة',19,'','cold_day.webp','none'),
    M('cold_day','قهوة اليوم بارد بالشمام','قهوة باردة',10,'','cold_day.webp','none'),
    M('v60','V60','قهوة حارة',17,'','hot_day.webp','none'),
    M('hot_day','قهوة اليوم بالشمام','قهوة حارة',10,'','hot_day.webp','none'),
    M('cele_matcha','ماتشا احتفالية','احتفالي',25,178,'cele_matcha.webp','paid','🎉','بشنطة هدية وزينة المناسبة',['print']),
    M('cele_spanish','ايس سبانش احتفالي','احتفالي',20,110,'cele_spanish.webp','paid','🎁','هدية جاهزة لأي مناسبة',['print']),
    M('crunchy','كرانشي كيك','حلويات',25,490,'crunchy.webp','none'),
    M('lava','لافا كيك','حلويات',25,360,'lava.webp','none'),
    M('matilda','ماتيلدا بيكان كوب','حلويات',20,380,'matilda.webp','none'),
    M('powder30','بوكس ماتشا باودر 30 جرام','ماتشا باودر',86,'','powder.webp','none','','ماتشا احتفالية يابانية'),
    M('powder60','بوكس ماتشا باودر 60 جرام','ماتشا باودر',105,'','powder.webp','none','','ماتشا احتفالية يابانية'),
    M('powder100','بوكس ماتشا باودر 100 جرام','ماتشا باودر',170,'','powder.webp','none','أوفر','ماتشا احتفالية يابانية')
  ],
  adds: [{id:'print',name:'طباعة صورة خاصة',price:15,on:true}],
  milks: [
    {id:'regular',name:'حليب عادي',price:0,on:true},{id:'lactose',name:'حليب خالي اللاكتوز',price:3,on:true},
    {id:'oat',name:'حليب الشوفان',price:4,on:true},{id:'coconut',name:'حليب جوز الهند',price:4,on:true}
  ],
  settings: {name:'ماتشا وكّن الجمل',open:16,close:24,off:'',accepting:true,banner:'',hideOut:false,
    branches:['خميس مشيط','أبها - أحد رفيدة'],occasions:['تخرج','عيد ميلاد','نجاح','بدون مناسبة'],
    pays:PAYS.slice(),contact:'966509116220',transfer:'الآيبان: SA1780000107608016907588'}
};
const DEMO_PASS = 'wk';

/* سعر المنتج: نفس حساب الخادم */
function priceItem(m, it, data){
  let unit = m.price; const parts = [];
  if (m.milk === 'paid' || m.milk === 'free'){
    const mk = data.milks.find(x => x.id === it.milk && x.on) || data.milks.find(x => x.on);
    if (mk){ parts.push(mk.name); if (m.milk === 'paid') unit += mk.price; }
  }
  (it.adds || []).forEach(id => {
    if (m.adds.indexOf(id) < 0) return;
    const a = data.adds.find(x => x.id === id && x.on); if (!a) return;
    unit += a.price; parts.push(a.name);
  });
  if (m.cat === 'احتفالي'){
    if (it.occ) parts.push('المناسبة: ' + it.occ);
    if (it.card) parts.push('الكرت: ' + it.card);
  }
  return {unit, text: parts.join(' · ')};
}

function db(){ const d = store.get('db', null); if (d && d.v === 1) return d; const n = {v:1, data: JSON.parse(JSON.stringify(SEED)), orders: []}; store.set('db', n); return n; }
function save(d){ store.set('db', d); }
function today(){ const n = riyadhNow(); return `${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}`; }
function stamp(){ const n = riyadhNow(); return `${today()} ${pad(n.getHours())}:${pad(n.getMinutes())}`; }

const mock = {
  get(p){
    const d = db();
    if (p.a === 'data') return d.data;
    if (p.a === 'track'){ const o = d.orders.find(x => x.no === p.no); return o ? {ok:true,status:o.status} : {ok:false}; }
    return {ok:true};
  },
  post(b){
    const d = db(), s = d.data.settings;
    if (b.a === 'order'){
      if (!s.accepting) return {ok:false,msg:'متوقفين عن استقبال الطلبات حاليًا'};
      const ph = normPhone(b.phone); if (!/^05\d{8}$/.test(ph)) return {ok:false,msg:'اكتب رقم جوال صحيح'};
      let total = 0, count = 0; const lines = [];
      (b.items || []).forEach(it => { const m = d.data.menu.find(x => x.id === it.id); if (!m || !m.on) return;
        const q = Math.max(1, +it.q || 1), pr = priceItem(m, it, d.data); total += pr.unit * q; count += q;
        lines.push(`${q}× ${m.name}${pr.text ? ` (${pr.text})` : ''} = ${pr.unit * q}`); });
      if (!lines.length) return {ok:false,msg:'المنتجات المطلوبة خلصت'};
      const branch = s.branches.includes(b.branch) ? b.branch : s.branches[0];
      const pay = s.pays.includes(b.pay) ? b.pay : s.pays[0];
      const no = 'WK-' + (101 + d.orders.length);
      d.orders.push({no,at:stamp(),branch,time:b.time,name:b.name || 'ضيف',phone:ph,items:lines.join('\n'),total,pay,status:'جديد',count,note:b.note || '',photo:b.photo ? '(صورة مرفقة — في النسخة الفعلية تنحفظ في قوقل درايف)' : ''});
      save(d); return {ok:true,no,total,branch,map:'',pay,transfer:pay === 'تحويل بنكي' ? s.transfer : ''};
    }
    if (b.pass !== DEMO_PASS) return {ok:false,error:'auth'};
    if (b.a === 'admin'){ const t = today(), to = d.orders.filter(o => o.at.indexOf(t) === 0 && o.status !== 'ملغي');
      return {ok:true,today:{orders:to.length,count:to.reduce((a,o)=>a+o.count,0),total:to.reduce((a,o)=>a+o.total,0)},
        orders:d.orders.filter(o => o.status !== 'استلم' && o.status !== 'ملغي').slice().reverse(),
        menu:d.data.menu,adds:d.data.adds,milks:d.data.milks,settings:s}; }
    if (b.a === 'status'){ const o = d.orders.find(x => x.no === b.no); if (o){ o.status = b.status; save(d); } return {ok:!!o}; }
    if (b.a === 'stock'){ const list = b.kind === 'add' ? d.data.adds : b.kind === 'milk' ? d.data.milks : d.data.menu;
      const m = list.find(x => x.id === b.id); if (m){ m.on = !!b.on; save(d); } return {ok:!!m}; }
    if (b.a === 'accepting'){ s.accepting = !!b.on; save(d); return {ok:true}; }
    return {ok:false};
  }
};

async function apiGet(params){
  if (!LIVE) return new Promise(r => setTimeout(() => r(mock.get(params)), 120));
  const r = await fetch(CFG.API_URL + '?' + new URLSearchParams(params).toString(), {redirect:'follow'}); return r.json();
}
async function apiPost(body){
  if (!LIVE) return new Promise(r => setTimeout(() => r(mock.post(body)), 300));
  const r = await fetch(CFG.API_URL, {method:'POST', redirect:'follow', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(body)});
  return r.json();
}

/* صور المنتجات: رابط قوقل درايف، أو رابط https، أو اسم ملف في مجلد images */
function imgUrl(v){
  v = String(v || '').trim(); if (!v) return 'images/logo1.webp';
  const g = v.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
  if (g) return 'https://drive.google.com/thumbnail?id=' + g[1] + '&sz=w800';
  if (/^https:\/\//.test(v)) return v;
  return 'images/' + v.replace(/^\/?(images\/)?/, '');
}
function waLink(phone, text){
  let p = String(phone || '').replace(/[^\d]/g, '');
  if (p.indexOf('05') === 0) p = '966' + p.slice(1); else if (p.length === 9 && p[0] === '5') p = '966' + p;
  return 'https://wa.me/' + p + '?text=' + encodeURIComponent(text);
}

window.WK = {LIVE, store, riyadhNow, pad, fmtHour, DAYS, normPhone, esc, apiGet, apiPost, imgUrl, waLink, priceItem, DEMO_PASS, PAYS};
})();
