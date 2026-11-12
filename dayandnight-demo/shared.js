/* Day & Night — أدوات مشتركة بين صفحة العملاء ولوحة المحل */
(function(){
const CFG = window.DN_CONFIG || {};
const LIVE = !!(CFG.API_URL && /^https:\/\//.test(CFG.API_URL));

const store = {
  get(k, d){ try{ const v = localStorage.getItem('dn_' + k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('dn_' + k, JSON.stringify(v)); }catch(e){} }
};
function riyadhNow(){ const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 180) * 60000); }
const pad = n => String(n).padStart(2, '0');
function fmtHour(h){ const hh = Math.floor(h), mm = Math.round((h - hh) * 60); const ap = hh >= 12 && hh < 24 ? 'م' : 'ص'; return `${(hh % 12) || 12}${mm ? ':' + pad(mm) : ''} ${ap}`; }
const DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
function normPhone(p){ p = String(p || '').replace(/[^\d]/g, ''); if (p.indexOf('966') === 0) p = '0' + p.slice(3); if (p.length === 9 && p[0] === '5') p = '0' + p; return p; }
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- بيانات وضع العرض (بدون شيت) ---------- */
const SEED = {
  menu: [
    {id:'dn',name:'D&N Matcha',price:24,on:true,desc:'ماتشا فاخرة بكريمة ونجوم فضية',badge:'Best Seller',img:'dn.webp',milk:'free',adds:['extra','syrup','sweet','blue','pink','party']},
    {id:'classic',name:'Classic Matcha',price:20,on:true,desc:'ماتشا كلاسيك بالثلج',badge:'',img:'classic.webp',milk:'paid',adds:['extra','syrup','sweet','blue','pink','party']},
    {id:'icecream',name:'Ice Cream Matcha',price:24,on:true,desc:'ماتشا مع آيس كريم ماتشا',badge:'جديد',img:'icecream.webp',milk:'original',adds:['syrup']},
    {id:'bday',name:'Celebration Matcha',price:35,on:true,desc:'كوب ميلاد بصورتك وزينتك',badge:'للمناسبات',img:'bday.webp',milk:'none',adds:[]},
    {id:'drip',name:'Ice Drip',price:20,on:true,desc:'قهوة مقطّرة باردة',badge:'',img:'drip.webp',milk:'none',adds:[]},
    {id:'v60',name:'Hot V60',price:18,on:true,desc:'قهوة مختصة حارة',badge:'',img:'v60.webp',milk:'none',adds:[]}
  ],
  adds: [
    {id:'extra',name:'Extra Matcha',price:3,on:true},{id:'syrup',name:'Syrup',price:2,on:true},
    {id:'sweet',name:'Sweet Foam',price:2,on:true},{id:'blue',name:'Blue Foam',price:2,on:true},
    {id:'pink',name:'Pink Foam',price:2,on:true},{id:'party',name:'Party Pick',price:1,on:true}
  ],
  milks: [
    {id:'original',name:'Original Milk',price:0,on:true},{id:'vanilla',name:'Vanilla Milk',price:2,on:true},
    {id:'coconut',name:'Coconut Milk',price:2,on:true},{id:'oat',name:'Oat Milk',price:2,on:true}
  ],
  settings: {name:'Day & Night',open:15,close:22,off:'',accepting:true,banner:'',hideOut:true,freeAt:3,
    place:'حي الملك فهد، المدينة المنورة',whatsapp:'966538897274',transfer:''}
};
const DEMO_PASS = 'dn';

/* سعر المشروب: نفس حساب الخادم */
function priceItem(m, it, data){
  let unit = m.price; const parts = [];
  if (m.milk === 'paid' || m.milk === 'free'){
    const mk = data.milks.find(x => x.id === it.milk && x.on) || data.milks.find(x => x.on);
    if (mk){ parts.push(mk.name); if (m.milk === 'paid') unit += mk.price; }
  } else if (m.milk === 'original') parts.push('Original Milk');
  (it.adds || []).forEach(id => {
    if (m.adds.indexOf(id) < 0) return;
    const a = data.adds.find(x => x.id === id && x.on); if (!a) return;
    unit += a.price; parts.push(a.name);
  });
  if (m.id === 'bday'){
    if ((it.tops || []).length) parts.push('الزينة: ' + it.tops.join('، '));
    if (it.bname) parts.push('الاسم: ' + it.bname);
  }
  return {unit, text: parts.join(' · ')};
}

function db(){ const d = store.get('db', null); if (d && d.v === 2) return d; const n = {v:2, data: JSON.parse(JSON.stringify(SEED)), orders: [], stars: {}}; store.set('db', n); return n; }
function save(d){ store.set('db', d); }
function today(){ const n = riyadhNow(); return `${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}`; }
function stamp(){ const n = riyadhNow(); return `${today()} ${pad(n.getHours())}:${pad(n.getMinutes())}`; }

const mock = {
  get(p){
    const d = db();
    if (p.a === 'data') return d.data;
    if (p.a === 'track'){ const o = d.orders.find(x => x.no === p.no); return o ? {ok:true,status:o.status} : {ok:false}; }
    if (p.a === 'stars') return {ok:true,stars:d.stars[normPhone(p.phone)] || 0,freeAt:d.data.settings.freeAt};
    return {ok:true};
  },
  post(b){
    const d = db(), s = d.data.settings;
    if (b.a === 'order'){
      if (!s.accepting) return {ok:false,msg:'متوقفين عن استقبال الطلبات حاليًا'};
      const ph = normPhone(b.phone); if (!/^05\d{8}$/.test(ph)) return {ok:false,msg:'اكتبي رقم جوال صحيح'};
      let total = 0, cups = 0, cheapest = Infinity; const lines = [];
      (b.items || []).forEach(it => { const m = d.data.menu.find(x => x.id === it.id); if (!m || !m.on) return;
        const q = Math.max(1, +it.q || 1), pr = priceItem(m, it, d.data); total += pr.unit * q; cups += q; cheapest = Math.min(cheapest, pr.unit);
        lines.push(`${q}× ${m.name}${pr.text ? ` (${pr.text})` : ''} = ${pr.unit * q}`); });
      if (!lines.length) return {ok:false,msg:'المشروبات المطلوبة خلصت'};
      let stars = d.stars[ph] || 0, reward = 0;
      if (b.reward && stars >= s.freeAt){ reward = cheapest; total -= reward; stars -= s.freeAt; }
      stars += cups; d.stars[ph] = stars;
      const no = 'DN-' + (101 + d.orders.length);
      d.orders.push({no,at:stamp(),time:b.time,name:b.name || 'ضيف',phone:ph,items:lines.join('\n'),total,pay:b.pay === 'تحويل' ? 'تحويل بنكي' : 'كاش',status:'جديد',cups,note:b.note || '',photo:b.photo ? '(صورة مرفقة — في النسخة الفعلية تنحفظ في قوقل درايف)' : '',reward:reward ? '-' + reward + ' ر.س' : ''});
      save(d); return {ok:true,no,total,reward,stars,freeAt:s.freeAt,place:s.place,map:'',transfer:s.transfer};
    }
    if (b.pass !== DEMO_PASS) return {ok:false,error:'auth'};
    if (b.a === 'admin'){ const t = today(), to = d.orders.filter(o => o.at.indexOf(t) === 0 && o.status !== 'ملغي');
      return {ok:true,today:{orders:to.length,cups:to.reduce((a,o)=>a+o.cups,0),total:to.reduce((a,o)=>a+o.total,0)},
        orders:d.orders.filter(o => o.status !== 'استلم' && o.status !== 'ملغي').slice().reverse(),
        menu:d.data.menu,adds:d.data.adds,milks:d.data.milks,settings:s,stars:d.stars}; }
    if (b.a === 'status'){ const o = d.orders.find(x => x.no === b.no); if (o){ o.status = b.status; save(d); } return {ok:!!o}; }
    if (b.a === 'stock'){ const list = b.kind === 'add' ? d.data.adds : b.kind === 'milk' ? d.data.milks : d.data.menu;
      const m = list.find(x => x.id === b.id); if (m){ m.on = !!b.on; save(d); } return {ok:!!m}; }
    if (b.a === 'accepting'){ s.accepting = !!b.on; save(d); return {ok:true}; }
    if (b.a === 'redeem'){ const ph = normPhone(b.phone); if ((d.stars[ph] || 0) < s.freeAt) return {ok:false,msg:'ما عندها نجوم كافية'}; d.stars[ph] -= s.freeAt; save(d); return {ok:true,stars:d.stars[ph]}; }
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
  v = String(v || '').trim(); if (!v) return '';
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

window.DN = {LIVE, store, riyadhNow, pad, fmtHour, DAYS, normPhone, esc, apiGet, apiPost, imgUrl, waLink, priceItem, DEMO_PASS};
})();
