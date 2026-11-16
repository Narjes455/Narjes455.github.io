/* ماتشا وكّن الجمل — صفحة العملاء */
(function(){
const K = window.WK, $ = s => document.querySelector(s), esc = K.esc;
const CAT_IC = {'ماتشا':'🍵','قهوة باردة':'🧊','قهوة حارة':'☕','احتفالي':'🎉','حلويات':'🍫','ماتشا باودر':'📦'};
const OCC_IC = {'تخرج':'🎓','عيد ميلاد':'🎂','نجاح':'⭐','بدون مناسبة':'💗'};
let DATA = null, activeCat = null, cart = K.store.get('cart', []), printPhoto = null;

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2300)}
const nowH = () => { const n = K.riyadhNow(); return n.getHours() + n.getMinutes() / 60; };
const byId = id => DATA && DATA.menu.find(m => m.id === id);
const img = (m, cls = '') => { const u = K.imgUrl(m.img); return `<img class="${/logo\d\.webp$/.test(u) ? 'logo-ph ' : ''}${cls}" src="${esc(u)}" alt="${esc(m.name)}" loading="lazy" referrerpolicy="no-referrer">`; };

/* ---------- الانترو ---------- */
function wavyRect(x,y,w,h,amp,step){
  const seg=(x1,y1,x2,y2)=>{const len=Math.hypot(x2-x1,y2-y1),n=Math.max(2,Math.round(len/step)),dx=(x2-x1)/n,dy=(y2-y1)/n,nx=-dy/(len/n)*amp,ny=dx/(len/n)*amp;let s='';
    for(let i=0;i<n;i++){const sx=x1+dx*i,sy=y1+dy*i,k=i%2?-1:1;s+=` Q${sx+dx/2+nx*k} ${sy+dy/2+ny*k} ${sx+dx} ${sy+dy}`}return s};
  return `M${x} ${y}`+seg(x,y,x+w,y)+seg(x+w,y,x+w,y+h)+seg(x+w,y+h,x,y+h)+seg(x,y+h,x,y)}
$('#f1').setAttribute('d',wavyRect(8,8,384,684,9,26));
$('#f2').setAttribute('d',wavyRect(30,32,340,636,7,22));
const tagline='ماتشا و قهوة تلامس السحاب ☁️';let ti=0;
setTimeout(function type(){const el=$('#typing');if(!el)return;if(ti<=tagline.length){el.textContent=tagline.slice(0,ti++);setTimeout(type,70)}},2900);
const LB=['#DCBCAF','#7F8164','#DDD4C0','#C0C194'];
setTimeout(()=>{const im=[...document.querySelectorAll('#iLogo img')];let k=0;const iv=setInterval(()=>{if(!$('#iLogo'))return clearInterval(iv);k++;
  im.forEach(x=>x.classList.remove('on'));const j=k%4;im[j].classList.add('on');$('#iLogo').style.background=LB[j];if(k===8)clearInterval(iv)},420)},3000);
function enter(){const i=$('#intro');if(!i)return;i.classList.add('hide');setTimeout(()=>i.remove(),900)}
$('#enterBtn').onclick=e=>{e.stopPropagation();enter()};
if (K.store.get('seenIntro', false)) setTimeout(enter, 2600); // الزائر الراجع ما ينتظر
K.store.set('seenIntro', true);

/* ---------- كونفيتي البانر ---------- */
const cols=['#DCBCAF','#FFFBF8','#C0C194','#F2C1D1','#E8D9A8'];
for(let i=0;i<18;i++){const c=document.createElement('i');c.style.cssText=`left:${Math.random()*100}%;background:${cols[i%5]};animation-delay:${-Math.random()*3}s;animation-duration:${2.5+Math.random()*2}s`;$('#confetti').appendChild(c)}

/* ---------- الدوام ---------- */
function isOffDay(d){ return DATA.settings.off && K.DAYS[d.getDay()] === DATA.settings.off.trim(); }
function isOpen(){ const s = DATA.settings, h = nowH(); return !isOffDay(K.riyadhNow()) && h >= s.open && h < s.close; }
function renderStatus(){
  const s = DATA.settings, open = isOpen();
  $('#statusPill').classList.toggle('open', open && s.accepting);
  $('#statusPill .dot').classList.toggle('off', !open || !s.accepting);
  $('#statusTxt').textContent = !s.accepting ? 'الطلبات متوقفة مؤقتًا' : open ? 'مفتوح الحين' : 'مقفل · نفتح ' + K.fmtHour(s.open);
  const hrs = K.fmtHour(s.open) + ' – ' + (s.close >= 24 ? '12 منتصف الليل' : K.fmtHour(s.close));
  $('#hoursPill').textContent = '🕓 ' + hrs;
  $('#footHours').textContent = 'يوميًا ' + hrs + (s.off ? ' · ' + s.off + ' إجازة' : '');
  $('#branchPills').innerHTML = s.branches.map(b => `<span class="pill">📍 ${esc(b)}</span>`).join('');
  $('#footBranches').textContent = s.branches.length ? '📍 ' + s.branches.join(' · ') : '';
  $('#footContact').innerHTML = s.contact ? `للتواصل: <a href="tel:+${esc(s.contact)}" dir="ltr">0${esc(s.contact.replace(/^966/, ''))}</a>` : '';
  const b = $('#banner'); b.hidden = !s.banner; b.textContent = s.banner;
  const c = $('#closedBox');
  if (!s.accepting){ c.hidden = false; c.textContent = 'متوقفين عن استقبال الطلبات حاليًا، نرجع لكم قريب ☁️'; }
  else if (!open){ c.hidden = false; c.textContent = 'مقفلين الحين ☁️ تقدر تطلب مسبق وتختار وقت الاستلام'; }
  else c.hidden = true;
}

/* ---------- المنيو ---------- */
function cats(){ const seen = []; DATA.menu.forEach(m => { if ((m.on || !DATA.settings.hideOut) && !seen.includes(m.cat)) seen.push(m.cat); }); return seen; }
function renderTabs(){
  const cs = cats(); if (!cs.includes(activeCat)) activeCat = cs[0];
  $('#tabs').innerHTML = cs.map(c => `<button class="tab ${c === activeCat ? 'on' : ''}" data-c="${esc(c)}">${CAT_IC[c] || '•'} ${esc(c)}</button>`).join('');
  $('#tabs').querySelectorAll('[data-c]').forEach(b => b.onclick = () => { activeCat = b.dataset.c; renderTabs(); renderMenu(); window.scrollTo({top: $('#tabs').offsetTop - 4, behavior: 'smooth'}); });
}
function renderMenu(){
  const list = DATA.menu.filter(m => m.cat === activeCat && (m.on || !DATA.settings.hideOut));
  if (!list.length){ $('#menu').innerHTML = '<div class="empty">المنيو يتجهز ☁️</div>'; return; }
  const wide = activeCat === 'احتفالي';
  $('#menu').innerHTML = `<section class="sec"><div class="sec-h"><h2>${CAT_IC[activeCat] || ''} ${esc(activeCat)}</h2><div class="wave"></div></div>
   ${activeCat === 'ماتشا باودر' ? '<div class="note" style="margin:0 2px 12px">ماتشا احتفالية يابانية · متوفرة أيضًا في جاهز وذا شيفز</div>' : ''}
   <div class="grid">${list.map((m, k) => `<div class="card ${wide ? 'wide' : ''} ${m.on ? '' : 'out'}" style="animation-delay:${k * 50}ms" data-id="${esc(m.id)}" role="button" tabindex="0">
      ${m.on ? (m.badge ? `<span class="lbl">${esc(m.badge)}</span>` : '') : '<span class="lbl">خلص اليوم</span>'}
      <div class="ph">${img(m)}</div>
      <div class="info"><h3>${esc(m.name)}</h3>${m.desc ? `<div class="desc">${esc(m.desc)}</div>` : ''}${m.cal ? `<div class="cal">🔥 ${m.cal} سعرة</div>` : ''}
      <div class="row"><span class="price">${m.price} <small>ريال</small></span><span class="add">+</span></div></div></div>`).join('')}</div></section>`;
  $('#menu').querySelectorAll('[data-id]').forEach(e => {
    const go = () => { const m = byId(e.dataset.id); if (!m || !m.on) return; m.cat === 'احتفالي' ? openCele(m.id) : openItem(m); };
    e.onclick = go; e.onkeydown = ev => { if (ev.key === 'Enter') go(); };
  });
}

/* ---------- النوافذ ---------- */
function openSheet(html){ $('#sheetC').innerHTML = html; $('#sheet').classList.add('on'); $('#ov').classList.add('on'); $('#sheet').scrollTop = 0; }
function closeSheet(){ $('#sheet').classList.remove('on'); $('#ov').classList.remove('on'); clearInterval(trackT); }
$('#ov').onclick = closeSheet; $('#closeBtn').onclick = closeSheet;

let cur = null;
const milkChips = (m) => {
  if (m.milk !== 'paid' && m.milk !== 'free') return '';
  const milks = DATA.milks.filter(x => x.on); if (!milks.length) return '';
  return `<div class="opt-h">نوع الحليب</div><div class="chips">${milks.map(x => `<button class="chip ${cur.milk === x.id ? 'on' : ''}" data-milk="${esc(x.id)}">${esc(x.name)}${m.milk === 'paid' && x.price ? ` <small>+${x.price}</small>` : ''}</button>`).join('')}</div>`;
};
function openItem(m){
  const milks = DATA.milks.filter(x => x.on);
  cur = {m, milk: milks[0] ? milks[0].id : '', adds: [], q: 1};
  drawItem();
}
function drawItem(){
  const c = cur, m = c.m, pr = K.priceItem(m, c, DATA);
  const adds = m.adds.map(id => DATA.adds.find(a => a.id === id && a.on)).filter(Boolean);
  openSheet(`<div class="s-img">${img(m)}</div><div class="s-body"><h2>${esc(m.name)}</h2>
    ${m.desc ? `<p style="opacity:.75;margin-top:4px">${esc(m.desc)}</p>` : ''}${m.cal ? `<div class="cal" style="font-size:13px">🔥 ${m.cal} سعرة حرارية</div>` : ''}
    ${milkChips(m)}
    ${adds.length ? `<div class="opt-h">إضافات</div><div class="chips">${adds.map(x => `<button class="chip ${c.adds.includes(x.id) ? 'on' : ''}" data-add="${esc(x.id)}">${esc(x.name)} <small>+${x.price}</small></button>`).join('')}</div>` : ''}
    <div class="cta"><div class="qty"><button data-q="-1" aria-label="نقص">−</button><b>${c.q}</b><button data-q="1" aria-label="زيادة">+</button></div>
    <button class="btn" id="addBtn"><span>أضف للسلة</span><span>${pr.unit * c.q} ريال</span></button></div></div>`);
  const S = $('#sheetC');
  S.querySelectorAll('[data-milk]').forEach(b => b.onclick = () => { c.milk = b.dataset.milk; drawItem(); });
  S.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { const i = b.dataset.add; c.adds = c.adds.includes(i) ? c.adds.filter(x => x !== i) : [...c.adds, i]; drawItem(); });
  S.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { c.q = Math.max(1, Math.min(20, c.q + +b.dataset.q)); drawItem(); });
  $('#addBtn').onclick = () => { addToCart({id: m.id, milk: (m.milk === 'paid' || m.milk === 'free') ? c.milk : '', adds: c.adds, q: c.q}); closeSheet(); };
}

/* ---------- الكوب الاحتفالي ---------- */
let cele = null;
function openCele(id){
  const items = DATA.menu.filter(m => m.cat === 'احتفالي' && m.on);
  if (!items.length){ toast('الأكواب الاحتفالية مو متوفرة اليوم'); return; }
  const m = items.find(x => x.id === id) || items[0];
  const milks = DATA.milks.filter(x => x.on);
  cele = cele && cele.keep ? cele : {occ: DATA.settings.occasions[0] || '', card: '', print: false, q: 1, milk: milks[0] ? milks[0].id : '', keep: true};
  cele.m = m; drawCele();
}
function drawCele(){
  const c = cele, m = c.m, items = DATA.menu.filter(x => x.cat === 'احتفالي' && x.on);
  const printAdd = DATA.adds.find(a => a.id === 'print' && a.on) && m.adds.includes('print') ? DATA.adds.find(a => a.id === 'print') : null;
  if (!printAdd) c.print = false;
  const it = {milk: c.milk, adds: c.print ? ['print'] : [], occ: c.occ, card: c.card};
  const pr = K.priceItem(m, it, DATA);
  cur = c; // لاختيار الحليب
  openSheet(`<div class="cele-prev ${c.print && printPhoto ? 'has-photo' : ''}" id="cp">
      <div class="cele-emoji">${OCC_IC[c.occ] || '🎉'}</div>
      <img class="cup" src="${esc(K.imgUrl(m.img))}" alt="">
      <img class="photo" id="cPhoto" src="${printPhoto || ''}" alt="">
      <div class="cele-tag"><b>${esc(c.occ && c.occ !== 'بدون مناسبة' ? (c.occ === 'تخرج' ? 'مبروك التخرج' : c.occ === 'عيد ميلاد' ? 'كل عام وأنت بخير' : c.occ === 'نجاح' ? 'مبروك النجاح' : c.occ) : 'عشانك 💗')}</b><span>لـ ${esc(c.card || '...')}</span></div></div>
    <div class="s-body"><h2>صمّم كوبك الاحتفالي 🎉</h2>
     <div class="opt-h">المشروب</div><div class="chips">${items.map(x => `<button class="chip ${x.id === m.id ? 'on' : ''}" data-base="${esc(x.id)}">${esc(x.name)} · ${x.price}</button>`).join('')}</div>
     ${DATA.settings.occasions.length ? `<div class="opt-h">المناسبة</div><div class="chips">${DATA.settings.occasions.map(o => `<button class="chip ${o === c.occ ? 'on' : ''}" data-occ="${esc(o)}">${OCC_IC[o] || '✨'} ${esc(o)}</button>`).join('')}</div>` : ''}
     ${milkChips(m)}
     <div class="opt-h">الاسم على كرت الإهداء <small>اختياري</small></div><input type="text" id="cCard" maxlength="20" placeholder="مثال: ريم" value="${esc(c.card)}">
     ${printAdd ? `<div class="opt-h">${esc(printAdd.name)} <small>+${printAdd.price} ريال</small></div>
       <label class="upload ${c.print && printPhoto ? 'done' : ''}">${c.print && printPhoto ? '✅ تم إرفاق الصورة · اضغط لتغييرها' : '📷 ارفع الصورة اللي تبيها على الكوب'}<input type="file" id="cFile" accept="image/*"></label>
       ${c.print ? '<button class="chip" id="noPrint" style="margin-top:8px">بدون طباعة صورة</button>' : ''}` : ''}
     <div class="cta"><div class="qty"><button data-q="-1" aria-label="نقص">−</button><b>${c.q}</b><button data-q="1" aria-label="زيادة">+</button></div>
     <button class="btn" id="celeAdd"><span>أضف الهدية</span><span>${pr.unit * c.q} ريال</span></button></div></div>`);
  const S = $('#sheetC');
  S.querySelectorAll('[data-base]').forEach(b => b.onclick = () => { c.m = byId(b.dataset.base); drawCele(); });
  S.querySelectorAll('[data-occ]').forEach(b => b.onclick = () => { c.occ = b.dataset.occ; drawCele(); });
  S.querySelectorAll('[data-milk]').forEach(b => b.onclick = () => { c.milk = b.dataset.milk; drawCele(); });
  S.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { c.q = Math.max(1, Math.min(20, c.q + +b.dataset.q)); drawCele(); });
  $('#cCard').oninput = e => { c.card = e.target.value.trim(); $('#cp .cele-tag span').textContent = 'لـ ' + (c.card || '...'); };
  const f = $('#cFile'); if (f) f.onchange = async e => { const file = e.target.files[0]; if (!file) return; toast('يجهز الصورة…');
    printPhoto = await compress(file); if (!printPhoto){ toast('ما قدرنا نفتح الصورة، جرب صورة ثانية'); return; } c.print = true; drawCele(); };
  const np = $('#noPrint'); if (np) np.onclick = () => { c.print = false; drawCele(); };
  $('#celeAdd').onclick = () => {
    cart = cart.filter(x => !(x.photo && c.print)); // صورة وحدة للطلب
    addToCart({id: m.id, q: c.q, milk: c.milk, adds: c.print ? ['print'] : [], occ: c.occ, card: c.card, photo: !!(c.print && printPhoto)});
    closeSheet(); burst();
  };
}
function burst(){for(let i=0;i<24;i++){const d=document.createElement('div');d.textContent=['🎉','✨','💗','🍵'][i%4];d.style.cssText='position:fixed;left:50%;top:60%;font-size:22px;z-index:300;pointer-events:none;transition:1.1s cubic-bezier(.2,.8,.3,1)';document.body.appendChild(d);
  requestAnimationFrame(()=>{d.style.transform=`translate(${(Math.random()-.5)*360}px,${-Math.random()*420}px) rotate(${Math.random()*360}deg)`;d.style.opacity=0});setTimeout(()=>d.remove(),1200)}}
$('#celeBanner').onclick = () => DATA && openCele();
$('#celeBanner').onkeydown = e => { if (e.key === 'Enter' && DATA) openCele(); };
function compress(file){
  return new Promise(res => { const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 1200 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .85)); };
      im.onerror = () => res(null); im.src = fr.result; };
    fr.onerror = () => res(null); fr.readAsDataURL(file); });
}

/* ---------- السلة ---------- */
function cartLines(){ return cart.map(it => { const m = byId(it.id); if (!m || !m.on) return null; const pr = K.priceItem(m, it, DATA); return {it, m, unit: pr.unit, text: pr.text}; }).filter(Boolean); }
function saveCart(bump){
  K.store.set('cart', cart);
  if (!DATA) return;
  const lines = cartLines(), n = lines.reduce((s, l) => s + l.it.q, 0), tot = lines.reduce((s, l) => s + l.unit * l.it.q, 0);
  $('#cCount').textContent = n; $('#cTotal').textContent = tot + ' ريال';
  $('#cartBar').classList.toggle('on', n > 0);
  if (bump){ const cb = $('#cartBar'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump'); }
}
function addToCart(x){ cart.push(x); saveCart(true); toast('انضاف للسلة ✓'); }
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
let form = Object.assign({branch: '', pay: '', time: '', note: ''}, K.store.get('me', {}));
function openCart(){
  const lines = cartLines(); if (!lines.length){ closeSheet(); return; }
  const s = DATA.settings, tl = slots();
  if (!s.branches.includes(form.branch)) form.branch = s.branches[0] || '';
  if (!s.pays.includes(form.pay)) form.pay = s.pays[0];
  if (!tl.includes(form.time)) form.time = tl[0] || '';
  const total = lines.reduce((a, l) => a + l.unit * l.it.q, 0);
  openSheet(`<div class="s-body"><h2>سلتك 🧺</h2><div style="margin-top:14px">${lines.map((l, k) => `<div class="ci">${img(l.m)}<div class="t"><b>${esc(l.m.name)}</b><small>${esc(l.text) || '—'}</small><b style="color:var(--sage-d)">${l.unit * l.it.q} ريال</b></div>
      <div class="qty"><button data-cq="${k}" data-d="-1" aria-label="نقص">−</button><b>${l.it.q}</b><button data-cq="${k}" data-d="1" aria-label="زيادة">+</button></div></div>`).join('')}</div>
    ${s.branches.length > 1 ? `<div class="opt-h">فرع الاستلام</div><div class="radio">${s.branches.map(b => `<label class="${form.branch === b ? 'on' : ''}"><input type="radio" name="br" value="${esc(b)}" ${form.branch === b ? 'checked' : ''}> 📍 ${esc(b)}</label>`).join('')}</div>` : ''}
    <div class="opt-h">وقت الاستلام</div><select id="cTime">${tl.map(t => `<option ${t === form.time ? 'selected' : ''}>${esc(t)}</option>`).join('') || '<option value="">الطلبات متوقفة حاليًا</option>'}</select>
    <div class="opt-h">بياناتك</div><input type="text" id="cName" maxlength="40" placeholder="الاسم" style="margin-bottom:8px" value="${esc(form.name || '')}">
    <input type="tel" id="cPhone" inputmode="tel" placeholder="رقم الجوال 05xxxxxxxx" value="${esc(form.phone || '')}">
    <div class="opt-h">طريقة الدفع</div><div class="radio">${s.pays.map(p => `<label class="${form.pay === p ? 'on' : ''}"><input type="radio" name="pay" value="${esc(p)}" ${form.pay === p ? 'checked' : ''}> ${p === 'تحويل بنكي' ? '🏦' : p.indexOf('شبكة') >= 0 ? '💳' : '💵'} ${esc(p)}</label>`).join('')}</div>
    ${form.pay === 'تحويل بنكي' ? `<div class="note">${s.transfer ? esc(s.transfer) : 'بيانات التحويل تطلع لك بعد تأكيد الطلب'}</div>` : ''}
    <div class="opt-h">ملاحظات <small>اختياري</small></div><textarea id="cNote" rows="2" maxlength="300" placeholder="مثال: ثلج خفيف">${esc(form.note || '')}</textarea>
    <div class="sum"><div class="tot"><span>الإجمالي</span><span>${total} ريال</span></div></div>
    <div class="cta"><button class="btn center" id="send" ${tl.length ? '' : 'disabled'}>تأكيد الطلب ✓</button></div><div class="err" id="err"></div></div>`);
  const S = $('#sheetC'), keep = () => { form.name = $('#cName').value; form.phone = $('#cPhone').value; form.note = $('#cNote').value; form.time = $('#cTime').value; };
  S.querySelectorAll('[data-cq]').forEach(b => b.onclick = () => { keep(); const l = lines[+b.dataset.cq]; const i = cart.indexOf(l.it); cart[i].q += +b.dataset.d; if (cart[i].q < 1) cart.splice(i, 1); saveCart(); openCart(); });
  S.querySelectorAll('input[name=br]').forEach(r => r.onchange = () => { keep(); form.branch = r.value; openCart(); });
  S.querySelectorAll('input[name=pay]').forEach(r => r.onchange = () => { keep(); form.pay = r.value; openCart(); });
  $('#send').onclick = () => { keep(); send(); };
}
$('#cartBtn').onclick = () => DATA && openCart();

async function send(){
  const phone = K.normPhone(form.phone), name = (form.name || '').trim();
  const err = t => { $('#err').textContent = t; };
  if (!name) return err('اكتب اسمك');
  if (!/^05\d{8}$/.test(phone)) return err('اكتب رقم جوال صحيح يبدأ بـ 05');
  const btn = $('#send'); btn.disabled = true; btn.textContent = 'يرسل…'; err('');
  K.store.set('me', {name, phone, branch: form.branch, pay: form.pay});
  const body = {a: 'order', name, phone, branch: form.branch, time: form.time, pay: form.pay, note: form.note,
    items: cart.map(x => ({id: x.id, q: x.q, milk: x.milk, adds: x.adds, occ: x.occ, card: x.card}))};
  if (cart.some(x => x.photo) && printPhoto) body.photo = printPhoto;
  try {
    const r = await K.apiPost(body);
    if (!r || !r.ok){ btn.disabled = false; btn.textContent = 'تأكيد الطلب ✓'; return err((r && r.msg) || 'ما انرسل الطلب، جرب مرة ثانية'); }
    cart = []; saveCart(); printPhoto = null; cele = null; form.note = '';
    K.store.set('last', {no: r.no, total: r.total, branch: r.branch, map: r.map, pay: r.pay, transfer: r.transfer, time: body.time});
    burst(); showTrack();
  } catch(e){ btn.disabled = false; btn.textContent = 'تأكيد الطلب ✓'; err('ما فيه اتصال، تأكد من النت وجرب مرة ثانية'); }
}

/* ---------- تتبع الطلب ---------- */
const STEPS = [['جديد','📥','وصلنا طلبك','بنبدأ عليه حالًا'],['يتجهز','🍵','يتجهّز الحين','نخفق الماتشا بحب'],['جاهز','✅','جاهز للاستلام','تعال خذه وهو بارد ☁️'],['استلم','💗','استلمته','بالعافية!']];
let trackT = null;
function showTrack(){
  const L = K.store.get('last', null); if (!L) return;
  const draw = st => {
    const idx = Math.max(0, STEPS.findIndex(x => x[0] === st));
    openSheet(`<div class="track trk"><div class="big">🐪</div><h2>${st === 'ملغي' ? 'انلغى الطلب' : 'وصلنا طلبك!'}</h2><div class="ordno">${esc(L.no)}</div>
      <p style="margin-top:8px;font-weight:700">${L.total} ريال</p>
      ${st === 'ملغي' ? '<p style="margin-top:10px">تواصل معنا لو فيه أي شي</p>' : `<div class="steps">${STEPS.map((s, i) => `<div class="step ${i < idx || (i === idx && i === STEPS.length - 1) ? 'done' : ''} ${i === idx && i < STEPS.length - 1 ? 'now' : ''} ${i <= idx ? 'done' : ''}"><div class="ic">${i <= idx ? s[1] : ''}</div><div><b>${s[2]}</b><small>${s[3]}</small></div></div>`).join('')}</div>`}
      <div class="note" style="text-align:right">⏰ الاستلام: ${esc(L.time || '')}\n📍 ${esc(L.branch || '')}${L.map ? `\n<a href="${esc(L.map)}" target="_blank" rel="noopener">افتح اللوكيشن على الخريطة</a>` : ''}\n${L.pay === 'تحويل بنكي' ? '🏦 تحويل بنكي' + (L.transfer ? '\n' + esc(L.transfer) : '') : '💵 ' + esc(L.pay || '')}</div>
      <button class="btn ghost center" style="width:100%;margin-top:14px" id="newOrd">طلب جديد</button></div>`);
    $('#newOrd').onclick = () => { K.store.set('last', null); closeSheet(); };
  };
  draw('جديد');
  const poll = async () => { try { const r = await K.apiGet({a: 'track', no: L.no}); if (r && r.ok){ draw(r.status); if (r.status === 'استلم' || r.status === 'ملغي'){ clearInterval(trackT); if (r.status === 'استلم') K.store.set('last', null); } } } catch(e){} };
  clearInterval(trackT); poll(); trackT = setInterval(poll, 15000);
}

/* ---------- التحميل ---------- */
async function load(){
  try {
    const d = await K.apiGet({a: 'data'});
    if (!d || !d.menu) throw 0;
    const first = !DATA; DATA = d; renderStatus(); renderTabs(); renderMenu(); saveCart();
    if (first && K.store.get('last', null)) setTimeout(showTrack, 900);
  } catch(e){ if (!DATA) $('#menu').innerHTML = '<div class="empty">ما قدرنا نحمّل المنيو، تأكد من النت وحدّث الصفحة</div>'; }
}
load();
setInterval(load, 120000);
setInterval(() => { if (DATA) renderStatus(); }, 60000);
})();
