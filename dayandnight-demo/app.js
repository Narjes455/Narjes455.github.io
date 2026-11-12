/* Day & Night — صفحة العملاء */
(function(){
const K = window.DN, $ = s => document.querySelector(s), esc = K.esc;
const STAR = 'M0,-10 C1,-2 2,-1 10,0 C2,1 1,2 0,10 C-1,2 -2,1 -10,0 C-2,-1 -1,-2 0,-10Z';
const TOPPERS = [
  {id:'hat',n:'قبعة شمعة'},{id:'stars',n:'نجوم فضية'},{id:'tassel',n:'شراشيب'},
  {id:'disco',n:'ديسكو بول'},{id:'ribbon',n:'شريطة قلوب'},{id:'sprinkles',n:'قلوب ملونة'}
];
let DATA = null, cart = K.store.get('cart', []), bdPhoto = null, starsCache = null;

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2400)}
const nowH = () => { const n = K.riyadhNow(); return n.getHours() + n.getMinutes() / 60; };
const byId = id => DATA && DATA.menu.find(m => m.id === id);
const pimg = (m, cls='pimg') => `<img class="${cls}" src="${esc(K.imgUrl(m.img))}" alt="${esc(m.name)}" loading="lazy" referrerpolicy="no-referrer">`;

/* ---------- السماء الليلية ---------- */
(function(){let h='';for(let i=0;i<34;i++){const s=6+Math.random()*12;
  h+=`<svg class="tw" style="left:${Math.random()*100}%;top:${Math.random()*100}%;width:${s}px;height:${s}px;animation-delay:${(Math.random()*3).toFixed(2)}s" viewBox="-10 -10 20 20" aria-hidden="true"><path d="${STAR}" fill="currentColor"/></svg>`}
  $('#sky').innerHTML=h})();

/* ---------- نهار / ليل ---------- */
function setTheme(night, anim){
  document.body.classList.toggle('night', night);
  $('#mood').innerHTML = night ? 'الليل هادي… <b>وقت الفهد 🐆</b>' : 'صباح ناعم… <b>وقت البجعة 🦢</b>';
  if (anim){const l=$('#logo');l.classList.remove('spin');void l.offsetWidth;l.classList.add('spin');setTimeout(()=>l.classList.remove('spin'),1300)}
}
const autoNight = !(nowH() >= 6 && nowH() < 17);
setTheme(autoNight);
if (!autoNight) $('#intro').classList.add('day');
$('#themeBtn').onclick = () => setTheme(!document.body.classList.contains('night'), true);
function closeIntro(){$('#intro').classList.add('gone')}
$('#intro').onclick = closeIntro; setTimeout(closeIntro, 3400);

/* ---------- التنقل ---------- */
function go(s){
  document.querySelectorAll('section').forEach(x => x.classList.toggle('on', x.id === s));
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.s === s));
  if (s === 'cart') renderCart();
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => go(b.dataset.s));

/* ---------- الدوام ---------- */
function isOffDay(d){ return DATA.settings.off && K.DAYS[d.getDay()] === DATA.settings.off.trim(); }
function isOpen(){ const s = DATA.settings, h = nowH(); return !isOffDay(K.riyadhNow()) && h >= s.open && h < s.close; }
function renderStatus(){
  const s = DATA.settings, open = isOpen();
  $('#dot').classList.toggle('off', !open || !s.accepting);
  $('#statusTxt').textContent = !s.accepting ? 'الطلبات متوقفة مؤقتًا' : open ? 'مفتوح الآن · يقفل ' + K.fmtHour(s.close) : 'مقفل · نفتح ' + K.fmtHour(s.open);
  $('#hoursTxt').textContent = 'يوميًا ' + K.fmtHour(s.open) + ' – ' + K.fmtHour(s.close) + (s.off ? ' · ' + s.off + ' إجازة' : '');
  $('#placeTxt').textContent = '📍 ' + (s.place || 'المدينة المنورة');
  const b = $('#banner'); b.hidden = !s.banner; b.textContent = s.banner;
  const c = $('#closedBox');
  if (!s.accepting){ c.hidden = false; c.innerHTML = 'متوقفين عن استقبال الطلبات حاليًا، نرجع لكم قريب ✦'; }
  else if (!open){ c.hidden = false; c.innerHTML = 'مقفلين الحين ✦ تقدرين تطلبين مسبق وتختارين وقت الاستلام'; }
  else c.hidden = true;
}

/* ---------- المنيو ---------- */
function renderMenu(){
  const list = DATA.menu.filter(m => m.on || !DATA.settings.hideOut);
  if (!list.length){ $('#grid').innerHTML = '<div class="empty">المنيو يتجهز ✦</div>'; return; }
  $('#grid').innerHTML = list.map(m => m.id === 'bday'
    ? `<div class="item wide ${m.on?'':'dim'}" data-id="${esc(m.id)}" role="button" tabindex="0">${pimg(m)}<div class="txt"><div class="en">${esc(m.name)}</div><div class="ar">${esc(m.desc)}</div><div class="p">${m.price} ريال</div><div class="ar" style="margin-top:6px">✦ صمّميه بنفسك ←</div></div>${m.on?'':'<span class="soldout">خلص اليوم</span>'}</div>`
    : `<div class="item ${m.on?'':'dim'}" data-id="${esc(m.id)}" role="button" tabindex="0">${m.badge?`<span class="badge">${esc(m.badge)}</span>`:''}${pimg(m)}<div class="en">${esc(m.name)}</div><div class="ar">${esc(m.desc)}</div><div class="p">${m.price} ريال</div>${m.on?'':'<span class="soldout">خلص اليوم</span>'}</div>`).join('');
  document.querySelectorAll('.item').forEach(e => {
    const open = () => { const m = byId(e.dataset.id); if (!m || !m.on) return; m.id === 'bday' ? go('bday') : openItem(m); };
    e.onclick = open; e.onkeydown = ev => { if (ev.key === 'Enter') open(); };
  });
  const bd = byId('bday'); $('#bPrice').textContent = bd ? bd.price + ' ريال' : '—';
}

/* ---------- نافذة المشروب ---------- */
let cur = null;
function openItem(m){
  const milks = DATA.milks.filter(x => x.on);
  cur = {m, milk: milks[0] ? milks[0].id : '', adds: [], q: 1};
  drawSheet(); $('#sheet').classList.add('on'); $('#sheetBg').classList.add('on');
}
function closeSheet(){ $('#sheet').classList.remove('on'); $('#sheetBg').classList.remove('on'); }
$('#sheetBg').onclick = closeSheet;
function drawSheet(){
  const c = cur, m = c.m, pr = K.priceItem(m, c, DATA);
  const milks = DATA.milks.filter(x => x.on), adds = m.adds.map(id => DATA.adds.find(a => a.id === id && a.on)).filter(Boolean);
  $('#sheet').innerHTML = `<div class="grab"></div>
    <div style="text-align:center">${pimg(m).replace('class="pimg"','class="pimg" style="width:170px;height:210px;border-radius:22px;margin:0 auto"')}</div>
    <h3>${esc(m.name)}</h3><div class="desc">${esc(m.desc)}</div>
    ${(m.milk==='paid'||m.milk==='free')&&milks.length?`<div class="lbl">نوع الحليب</div><div class="chips">${milks.map(x=>`<button class="chip ${c.milk===x.id?'on':''}" data-milk="${esc(x.id)}">${esc(x.name)}<small>${m.milk==='free'||!x.price?'مجاني':'+'+x.price}</small></button>`).join('')}</div>`:''}
    ${m.milk==='original'?'<div class="milkinfo">الحليب: Original Milk</div>':''}
    ${adds.length?`<div class="lbl">إضافات</div><div class="chips">${adds.map(x=>`<button class="chip ${c.adds.includes(x.id)?'on':''}" data-add="${esc(x.id)}">${esc(x.name)}<small>+${x.price}</small></button>`).join('')}</div>`:''}
    <div class="qty"><button data-q="1" aria-label="زيادة">+</button><b>${c.q}</b><button data-q="-1" aria-label="نقص">−</button></div>
    <button class="btn" id="addBtn">أضيفي للسلة · ${pr.unit * c.q} ريال</button>`;
  $('#sheet').querySelectorAll('[data-milk]').forEach(b => b.onclick = () => { c.milk = b.dataset.milk; drawSheet(); });
  $('#sheet').querySelectorAll('[data-add]').forEach(b => b.onclick = () => { const i = b.dataset.add; c.adds = c.adds.includes(i) ? c.adds.filter(x => x !== i) : [...c.adds, i]; drawSheet(); });
  $('#sheet').querySelectorAll('[data-q]').forEach(b => b.onclick = () => { c.q = Math.max(1, Math.min(20, c.q + +b.dataset.q)); drawSheet(); });
  $('#addBtn').onclick = () => { addToCart({id:m.id, milk:(m.milk==='paid'||m.milk==='free')?c.milk:'', adds:c.adds, q:c.q}); closeSheet(); };
}

/* ---------- السلة ---------- */
function saveCart(){ K.store.set('cart', cart.map(x => ({...x}))); $('#count').textContent = cart.reduce((s,x) => s + x.q, 0) || ''; }
function addToCart(x){ cart.push(x); saveCart(); toast('انضاف للسلة ✦'); }
function cartLines(){
  return cart.map(it => { const m = byId(it.id); if (!m) return null; const pr = K.priceItem(m, it, DATA); return {it, m, unit: pr.unit, text: pr.text}; }).filter(Boolean);
}
function slots(){
  const s = DATA.settings, out = [], n = K.riyadhNow(), h = nowH();
  if (s.accepting && !isOffDay(n) && h < s.close - 0.25){
    if (isOpen()) out.push('في أقرب وقت');
    let t = Math.max(s.open, Math.ceil((h + 0.33) * 4) / 4);
    for (; t <= s.close - 0.25; t += 0.5) out.push('اليوم ' + K.fmtHour(t));
  }
  const tm = new Date(n.getTime() + 86400000);
  if (s.accepting && !isOffDay(tm)) for (let t = s.open; t <= s.close - 0.25; t += 0.5) out.push('بكرة ' + K.fmtHour(t));
  return out;
}
function renderCart(){
  const box = $('#cartBox');
  const lines = cartLines();
  if (!lines.length){ box.innerHTML = `<div class="empty">السلة فاضية<br>اختاري مشروبك من المنيو ✦<br><button class="btn ghost" style="margin-top:14px" id="toMenu">افتحي المنيو</button></div>`; $('#toMenu').onclick = () => go('menu'); return; }
  const sub = lines.reduce((a, l) => a + l.unit * l.it.q, 0);
  const cheapest = Math.min(...lines.map(l => l.unit));
  const canReward = starsCache && starsCache.stars >= starsCache.freeAt;
  const useR = canReward && $('#rw') ? $('#rw').checked : canReward;
  const total = sub - (useR ? cheapest : 0);
  const tl = slots(), saved = K.store.get('me', {});
  box.innerHTML = lines.map((l, i) => `<div class="line">${pimg(l.m)}<div class="info2"><b>${esc(l.m.name)} ×${l.it.q}</b><span>${esc(l.text) || 'بدون إضافات'}</span></div><div class="pr">${l.unit * l.it.q}</div><button class="x" data-rm="${i}" aria-label="حذف">✕</button></div>`).join('') +
    `<div class="field"><label for="cPhone">رقم الجوال</label><input type="tel" id="cPhone" inputmode="tel" placeholder="05xxxxxxxx" value="${esc(saved.phone || '')}"></div>
     <div id="rwBox">${canReward ? `<label class="reward"><input type="checkbox" id="rw" ${useR ? 'checked' : ''}> عندك ${starsCache.stars} نجوم ✦ خذي أرخص مشروب مجانًا</label>` : starsCache ? `<div class="note" style="margin:6px 0 0">✦ نجومك ${starsCache.stars}/${starsCache.freeAt} — هذا الطلب يضيف ${lines.reduce((a,l)=>a+l.it.q,0)}</div>` : ''}</div>
     <div class="field"><label for="cName">الاسم</label><input type="text" id="cName" maxlength="40" placeholder="اسمك" value="${esc(saved.name || '')}"></div>
     <div class="field"><label for="cTime">وقت الاستلام</label><select id="cTime">${tl.map(t => `<option>${esc(t)}</option>`).join('') || '<option value="">الطلبات متوقفة حاليًا</option>'}</select></div>
     <div class="field">طريقة الدفع<div class="pay"><label><input type="radio" name="pay" value="كاش" checked> كاش عند الاستلام</label><label><input type="radio" name="pay" value="تحويل"> تحويل بنكي</label></div></div>
     <div class="field"><label for="cNote">ملاحظات</label><textarea id="cNote" maxlength="300" placeholder="مثلاً: سكر خفيف"></textarea></div>
     <div class="sum"><span>المجموع</span><span>${useR ? `<s style="opacity:.5;font-weight:500">${sub}</s> ` : ''}${total} ريال</span></div>
     <button class="btn" id="send" ${tl.length ? '' : 'disabled'}>أرسلي الطلب ✦</button>
     <div class="err" id="err"></div>
     <div class="note">الاستلام من ${esc(DATA.settings.place || 'المحل')}</div>`;
  box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { cart.splice(+b.dataset.rm, 1); saveCart(); renderCart(); });
  const rw = $('#rw'); if (rw) rw.onchange = renderCart;
  const ph = $('#cPhone');
  ph.onchange = async () => { const me = K.store.get('me', {}); me.phone = ph.value; K.store.set('me', me); await lookupStars(ph.value); const keep = {name: $('#cName').value, note: $('#cNote').value}; renderCart(); $('#cName').value = keep.name; $('#cNote').value = keep.note; $('#cPhone').value = ph.value; };
  if (saved.phone && !starsCache) lookupStars(saved.phone).then(() => { if ($('#cart').classList.contains('on')) renderCart(); });
  $('#send').onclick = send;
}
async function lookupStars(phone){
  const p = K.normPhone(phone); if (!/^05\d{8}$/.test(p)){ starsCache = null; return null; }
  try { const r = await K.apiGet({a:'stars', phone:p}); starsCache = r && r.ok ? {stars:r.stars, freeAt:r.freeAt, phone:p} : null; } catch(e){ starsCache = null; }
  return starsCache;
}
function compress(file){
  return new Promise((res) => {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => {
      const s = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .8)); };
      im.onerror = () => res(null); im.src = fr.result; };
    fr.onerror = () => res(null); fr.readAsDataURL(file);
  });
}
async function send(){
  const phone = K.normPhone($('#cPhone').value), name = $('#cName').value.trim();
  const err = t => { $('#err').textContent = t; };
  if (!/^05\d{8}$/.test(phone)) return err('اكتبي رقم جوال صحيح يبدأ بـ 05');
  if (!name) return err('اكتبي اسمك');
  const btn = $('#send'); btn.disabled = true; btn.textContent = 'يرسل…'; err('');
  K.store.set('me', {phone, name});
  const body = {a:'order', name, phone, time:$('#cTime').value, pay:(document.querySelector('input[name=pay]:checked')||{}).value, note:$('#cNote').value,
    reward: !!($('#rw') && $('#rw').checked), items: cart.map(x => ({id:x.id, q:x.q, milk:x.milk, adds:x.adds, tops:x.tops, bname:x.bname}))};
  if (cart.some(x => x.id === 'bday' && x.photo) && bdPhoto) body.photo = bdPhoto;
  try {
    const r = await K.apiPost(body);
    if (!r || !r.ok){ btn.disabled = false; btn.textContent = 'أرسلي الطلب ✦'; return err((r && r.msg) || 'ما انرسل الطلب، جربي مرة ثانية'); }
    cart = []; saveCart(); bdPhoto = null; starsCache = {stars:r.stars, freeAt:r.freeAt, phone};
    K.store.set('last', {no:r.no, total:r.total, reward:r.reward, place:r.place, map:r.map, transfer:r.transfer, pay:body.pay, time:body.time});
    showTrack();
  } catch(e){ btn.disabled = false; btn.textContent = 'أرسلي الطلب ✦'; err('ما فيه اتصال، تأكدي من النت وجربي مرة ثانية'); }
}

/* ---------- تتبع الطلب ---------- */
const STEPS = [['جديد','وصلنا','✦'],['يتجهز','يتجهز','☕︎'],['جاهز','جاهز','✓'],['استلم','استلمتِ','♡']];
let trackT = null;
function showTrack(){
  const L = K.store.get('last', null); if (!L) return;
  go('track');
  const draw = st => {
    const idx = Math.max(0, STEPS.findIndex(x => x[0] === st));
    $('#trackBox').innerHTML = `<div class="okcard">
      <div class="sm serif">Thank you</div>
      ${st === 'ملغي' ? '<div style="font-weight:800;margin-top:8px">انلغى الطلب، تواصلي معنا لو فيه أي شي</div>' : '<div style="font-weight:800;font-size:18px;margin-top:6px">طلبك وصلنا ✦</div>'}
      <div class="no">${esc(L.no)}</div>
      <div style="font-weight:800">${L.total} ريال${L.reward ? ` <small style="color:#1fa855">(مشروب علينا ✦ -${L.reward})</small>` : ''}</div>
      ${st === 'ملغي' ? '' : `<div class="steps">${STEPS.map((s, i) => `<div class="step ${i <= idx ? 'on' : ''}"><i>${s[2]}</i>${s[1]}</div>`).join('')}</div>`}
      <div class="info">⏰ الاستلام: ${esc(L.time || '')}\n📍 ${esc(L.place || '')}${L.map ? `\n<a href="${esc(L.map)}" target="_blank" rel="noopener">افتحي اللوكيشن على الخريطة</a>` : ''}${L.pay === 'تحويل' ? '\n💳 ' + (L.transfer ? esc(L.transfer) : 'بنرسل لك بيانات التحويل') : '\n💵 الدفع كاش عند الاستلام'}</div>
      ${starsCache ? `<div class="note">✦ نجومك الحين: ${starsCache.stars} من ${starsCache.freeAt}</div>` : ''}
      <button class="btn ghost" style="margin-top:14px" id="newOrd">طلب جديد</button></div>`;
    $('#newOrd').onclick = () => { K.store.set('last', null); clearInterval(trackT); go('menu'); };
  };
  draw('جديد');
  const poll = async () => { try { const r = await K.apiGet({a:'track', no:L.no}); if (r && r.ok){ draw(r.status); if (r.status === 'استلم' || r.status === 'ملغي') clearInterval(trackT); } } catch(e){} };
  clearInterval(trackT); poll(); trackT = setInterval(poll, 15000);
}

/* ---------- النجوم ---------- */
function renderStars(n, freeAt){
  const big = `<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="${STAR}" fill="var(--silver)" stroke="var(--ink)" stroke-width=".6"/></svg>`;
  const shown = Math.min(freeAt, 6);
  $('#starTtl').textContent = `اجمعي ${freeAt} نجوم والمشروب الجاي علينا`;
  $('#slots').innerHTML = [...Array(shown)].map((_, i) => `<div class="slot ${i < n ? 'got' : ''}">${big}</div>`).join('<span class="plus">+</span>') + `<span class="plus">=</span><div class="free">المشروب<br>الجاي<br>علينا</div>`;
  if (n == null) return;
  $('#starMsg').innerHTML = n >= freeAt ? '<b>مبروك! ✦</b><br>عندك مشروب مجاني، فعّليه من السلة بطلبك الجاي' : `عندك <b>${n}</b> ${n === 1 ? 'نجمة' : 'نجوم'}، باقي لك <b>${freeAt - n}</b> وتاخذين مشروبك مجانًا`;
}
$('#starGo').onclick = async () => {
  const r = await lookupStars($('#starPhone').value);
  if (!r){ toast('اكتبي رقم جوال صحيح'); return; }
  renderStars(r.stars, r.freeAt);
};

/* ---------- اختبار: مين أنتِ اليوم؟ ---------- */
const QS = [
  {q:'الصبح بالنسبة لك…', a:[['هدوء وشمس وكوب على مهل','s'],['ما أصحى صح إلا بالليل','l']]},
  {q:'يومك المثالي اليوم؟', a:[['جلسة هادية مع صديقتي','s'],['طلعة وحماس وخطط مفاجئة','l']]},
  {q:'وش تحبين بمشروبك؟', a:[['ناعم وكريمي','s'],['قوي ومركّز','l']]}
];
const RES = {
  s:{cls:'',animal:'🦢',name:'Swan',ar:'أنتِ بجعة اليوم',txt:'هادئة وأنيقة ونهارك ناعم.<br>يومك يبيله شي يشبهك: خفيف وأخضر ومنعش.',drinks:['classic','dn','icecream']},
  l:{cls:'leopard',animal:'🐆',name:'Leopard',ar:'أنتِ فهد اليوم',txt:'طاقتك عالية وما يوقفك شي.<br>تحتاجين شي قوي يجاري سرعتك.',drinks:['drip','v60']}
};
let qi = 0, score = [];
function renderQuiz(){
  const box = $('#quizBox');
  if (qi < QS.length){
    const q = QS[qi];
    box.innerHTML = `<div class="quiz"><div class="prog">${QS.map((_, i) => `<i class="${i <= qi ? 'on' : ''}"></i>`).join('')}</div>
      <div class="step2">سؤال ${qi + 1} من ${QS.length}</div><div class="q">${q.q}</div>
      ${q.a.map(([t, v]) => `<button class="ans" data-v="${v}">${t}</button>`).join('')}</div>`;
    box.querySelectorAll('.ans').forEach(b => b.onclick = () => { score.push(b.dataset.v); qi++; renderQuiz(); });
    return;
  }
  const k = score.filter(x => x === 's').length >= 2 ? 's' : 'l', r = RES[k];
  const d = r.drinks.map(byId).find(m => m && m.on) || (DATA.menu.find(m => m.on && m.id !== 'bday'));
  box.innerHTML = `<div class="result ${r.cls}">
      <div class="who serif">Who are you today?</div><div class="animal">${r.animal}</div>
      <h2>${r.name}</h2><div style="font-weight:800;font-size:18px">${r.ar}</div><p style="margin-top:8px">${r.txt}</p>
      ${d ? `<div class="drink">${pimg(d)}<div style="text-align:right"><div style="font-size:12px;opacity:.7">مشروبك اليوم</div><div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600">${esc(d.name)}</div><div style="font-weight:800">${d.price} ريال</div></div></div>` : ''}
      <div class="tag">@dayandniight.sa · Two sides, one balance</div></div>
    <div class="note">📸 صوّري البطاقة وشاركيها بالستوري مع منشن الحساب</div>
    <div class="row">${d ? '<button class="btn" id="qAdd">اطلبي مشروبك</button>' : ''}<button class="btn ghost" id="qAgain">من جديد</button></div>`;
  if (d) $('#qAdd').onclick = () => { go('menu'); setTimeout(() => openItem(d), 300); };
  $('#qAgain').onclick = () => { qi = 0; score = []; renderQuiz(); };
}

/* ---------- كوب الميلاد ---------- */
const bd = {on: new Set(['hat','stars','disco','ribbon'])};
function heart(x,y,s,c='#c8202f'){return `<path transform="translate(${x},${y}) scale(${s})" d="M0,3 C-6,-3 -3,-8 0,-4 C3,-8 6,-3 0,3Z" fill="${c}"/>`}
const SPR = (()=>{let s='';const cols=['#c8202f','#e86b7a','#f6c1c8','#d9435a'];for(let i=0;i<16;i++)s+=heart(52+Math.random()*96,100+Math.random()*16,.7+Math.random()*.4,cols[i%4]);return s})();
const DOTS = [...Array(18)].map(()=>`<circle cx="${50+Math.random()*100}" cy="${130+Math.random()*120}" r=".9" fill="#2f4a1f" opacity=".4"/>`).join('');
function drawBday(){
  const name = ($('#bName').value || '').trim().replace(/[<>&"]/g, '');
  const body = 'M40,120 L160,120 L146,262 L54,262 Z';
  const t = id => `class="topper ${bd.on.has(id) ? '' : 'off'}"`;
  let ribbon = ''; for (let i = 0; i < 7; i++) ribbon += heart(48 + i * 17.5, 140 + (i % 2) * 3, 1.4);
  let tassel = ''; for (let a = -80; a <= 80; a += 12) tassel += `<line x1="0" y1="0" x2="${(Math.sin(a*Math.PI/180)*30).toFixed(1)}" y2="${(-Math.cos(a*Math.PI/180)*30).toFixed(1)}" stroke="${a%24?'#c3ccd6':'#e86b7a'}" stroke-width="1.6"/>`;
  let disco = ''; for (let i = -12; i <= 12; i += 6) disco += `<line x1="-15" y1="${i}" x2="15" y2="${i}" stroke="#7d8896" stroke-width=".6"/><line x1="${i}" y1="-15" x2="${i}" y2="15" stroke="#7d8896" stroke-width=".6"/>`;
  $('#bdayCup').innerHTML = `<defs><clipPath id="bc"><path d="${body}"/></clipPath><clipPath id="ph"><rect x="70" y="170" width="60" height="58" rx="3"/></clipPath><clipPath id="dc"><circle r="15"/></clipPath>
    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8db05a"/><stop offset=".75" stop-color="#7a9c4a"/><stop offset="1" stop-color="#efe6d4"/></linearGradient>
    <radialGradient id="db"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8d97a3"/></radialGradient></defs>
    <path d="${body}" fill="url(#mg)" opacity=".95"/><path d="${body}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2"/>
    <g clip-path="url(#bc)">${DOTS}</g>
    <rect x="66" y="166" width="68" height="78" rx="4" fill="#f4f2ee" stroke="#cfc8bd"/>
    ${bdPhoto ? `<image href="${bdPhoto}" x="70" y="170" width="60" height="58" preserveAspectRatio="xMidYMid slice" clip-path="url(#ph)" style="filter:grayscale(1) contrast(1.1)"/>`
      : `<rect x="70" y="170" width="60" height="58" rx="3" fill="#dcd8d1"/><text x="100" y="203" text-anchor="middle" font-size="9" fill="#8a8277" font-family="Tajawal">صورتك هنا ♡</text>`}
    <text x="100" y="236" text-anchor="middle" font-size="6.4" letter-spacing="1.2" fill="#2f4255" font-family="Cormorant Garamond" font-weight="600">HAPPY BIRTHDAY</text>
    ${name ? `<text x="100" y="242" text-anchor="middle" font-size="5.4" fill="#8b1c24" font-family="Tajawal" font-weight="700">${name}</text>` : ''}
    <path d="M32,120 C28,104 46,100 52,96 C58,84 78,86 82,92 C92,80 116,82 118,94 C128,86 150,92 150,102 C164,104 172,112 168,120 Z" fill="#f2a7b2"/>
    <g ${t('sprinkles')}>${SPR}</g>
    <g ${t('ribbon')}><path d="M42,140 Q100,150 158,140" stroke="#c8202f" stroke-width="2" fill="none"/>${ribbon}</g>
    <g ${t('tassel')} transform="translate(92,70)"><line x1="0" y1="0" x2="0" y2="30" stroke="#b9a58a" stroke-width="1.4"/>${tassel}</g>
    <g ${t('stars')}><line x1="66" y1="100" x2="58" y2="52" stroke="#b9a58a" stroke-width="1.6"/><path d="${STAR}" transform="translate(58,48) scale(1.4)" fill="#d7dee6" stroke="#7d8896"/>
      <line x1="78" y1="100" x2="76" y2="64" stroke="#b9a58a" stroke-width="1.6"/><path d="${STAR}" transform="translate(76,60) scale(1.05)" fill="#d7dee6" stroke="#7d8896"/></g>
    <g ${t('disco')}><line x1="132" y1="100" x2="140" y2="70" stroke="#b9a58a" stroke-width="1.6"/><g transform="translate(142,56)"><circle r="15" fill="url(#db)"/><g clip-path="url(#dc)">${disco}</g><circle r="15" fill="none" stroke="#7d8896"/></g></g>
    <g ${t('hat')}><path d="M106,98 L118,58 L130,98 Z" fill="#c8202f"/><path d="M108,92 L128,92" stroke="#4f8a4a" stroke-width="2"/>${[...Array(6)].map((_,i)=>`<circle cx="${106+i*4.8}" cy="99" r="2.6" fill="#c8202f"/>`).join('')}<circle cx="118" cy="56" r="3.4" fill="#c8202f"/>
      <path d="M118,52 C115,46 119,42 118,38 C122,43 121,48 118,52Z" fill="#ffb648"><animate attributeName="opacity" values="1;.6;1" dur=".6s" repeatCount="indefinite"/></path></g>`;
}
$('#toppers').innerHTML = TOPPERS.map(x => `<button class="chip ${bd.on.has(x.id) ? 'on' : ''}" data-t="${x.id}">${x.n}</button>`).join('');
$('#toppers').querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const id = b.dataset.t; bd.on.has(id) ? bd.on.delete(id) : bd.on.add(id); b.classList.toggle('on'); drawBday(); });
$('#bName').addEventListener('input', drawBday);
$('#bPhoto').onchange = async e => { const f = e.target.files[0]; if (!f) return; $('#upTxt').textContent = 'يجهز الصورة…'; bdPhoto = await compress(f);
  $('#upTxt').textContent = bdPhoto ? '✓ تمت إضافة الصورة — تقدرين تغيّرينها' : 'ما قدرنا نفتح الصورة، جربي صورة ثانية'; drawBday(); };
$('#bAdd').onclick = () => {
  const m = byId('bday'); if (!m || !m.on){ toast('كوب الميلاد مو متوفر اليوم'); return; }
  cart = cart.filter(x => x.id !== 'bday' || !x.photo || !bdPhoto);
  addToCart({id:'bday', q:1, milk:'', adds:[], tops: TOPPERS.filter(x => bd.on.has(x.id)).map(x => x.n), bname: ($('#bName').value || '').trim(), photo: !!bdPhoto});
  go('cart');
};

/* ---------- التحميل ---------- */
async function load(){
  try {
    const d = await K.apiGet({a:'data'});
    if (!d || !d.menu) throw 0;
    DATA = d; renderStatus(); renderMenu(); if (!document.querySelector('#quizBox .result')) renderQuiz();
    $('#count').textContent = cart.reduce((s,x) => s + x.q, 0) || '';
    if (starsCache === null) renderStars(null, DATA.settings.freeAt);
  } catch(e){ if (!DATA) $('#grid').innerHTML = '<div class="empty">ما قدرنا نحمّل المنيو، تأكدي من النت وحدّثي الصفحة</div>'; }
}
drawBday();
load().then(() => { if (K.store.get('last', null)) showTrack(); });
setInterval(() => { load(); }, 120000);
setInterval(() => { if (DATA) renderStatus(); }, 60000);
})();
