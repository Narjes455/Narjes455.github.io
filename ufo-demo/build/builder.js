/* يوفو | UFO — «اصنع مشروبك»: واجهة تفاعلية لتركيب المشروب
 * تعمل على أي منتج مفعّل فيه خيار (builder) وتعتمد على مجموعات خياراته:
 *  role: base = نكهات/صوصات في قاع الكوب · milk = الحليب · top = ماتشا/قهوة (تُخفق وتُصب) · ice = الثلج · extra = إضافات
 *  كل خيار له color (لون الطبقة في الكوب) و price (سعر إضافي)
 */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => (Math.round(Number(n || 0) * 100) / 100).toLocaleString('en-US') + ' ر.س';
  const DEF_COL = { base: '#F67599', milk: '#FFF6E6', top: '#8DB255', ice: '#DDEBF7', extra: '#FFFFFF' };
  const roleOf = (g, i) => g.role || (i === 0 ? 'base' : 'extra');

  function jar(color, kind) {
    if (kind === 'milk') return `<svg viewBox="0 0 80 90" class="bj"><path d="M18 18 L62 18 L58 84 Q40 88 22 84 Z" fill="#fff" fill-opacity=".55" stroke="var(--ink)" stroke-width="2.6" stroke-linejoin="round"/><path d="M21 40 L59 40 L57 82 Q40 86 23 82 Z" fill="${color}"/><path d="M18 18 L62 18 L58 84 Q40 88 22 84 Z" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linejoin="round"/><path d="M62 30 Q76 32 74 48 Q72 60 60 60" fill="none" stroke="var(--ink)" stroke-width="3"/><path d="M18 18 L12 12" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/><path d="M27 30 v40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>`;
    return `<svg viewBox="0 0 90 80" class="bj"><path d="M14 22 Q14 14 22 14 L60 14 Q66 14 66 22 L64 66 Q63 74 55 74 L25 74 Q16 74 15 66 Z" fill="#fff" fill-opacity=".55" stroke="var(--ink)" stroke-width="2.6"/><path d="M16 36 Q40 30 64 36 L63 66 Q62 72 55 72 L25 72 Q17 72 17 66 Z" fill="${color}"/><path d="M14 22 Q14 14 22 14 L60 14 Q66 14 66 22 L64 66 Q63 74 55 74 L25 74 Q16 74 15 66 Z" fill="none" stroke="var(--ink)" stroke-width="2.6"/><path d="M66 26 Q84 28 82 44 Q80 58 64 56" fill="none" stroke="var(--ink)" stroke-width="3"/><path d="M14 22 L6 16" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/><circle cx="30" cy="48" r="3" fill="#fff" opacity=".6"/><circle cx="44" cy="56" r="2" fill="#fff" opacity=".5"/></svg>`;
  }
  const bowl = (color, state) => `<svg viewBox="0 0 120 70" class="bowl ${state}"><ellipse cx="60" cy="22" rx="50" ry="12" fill="${state === 'empty' ? '#f3ede4' : color}" stroke="var(--ink)" stroke-width="2.6"/>${state === 'whisked' ? '<g fill="#fff" opacity=".55"><circle cx="45" cy="21" r="3"/><circle cx="62" cy="18" r="2.4"/><circle cx="74" cy="24" r="2"/><circle cx="54" cy="25" r="1.8"/></g>' : ''}<path d="M10 22 Q12 62 60 64 Q108 62 110 22" fill="#fff" stroke="var(--ink)" stroke-width="2.6"/><path d="M30 40 Q60 52 90 40" fill="none" stroke="var(--blue)" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>`;
  const whisk = `<svg viewBox="0 0 60 120" class="whisk"><rect x="24" y="2" width="12" height="44" rx="5" fill="#C99A5B" stroke="var(--ink)" stroke-width="2.4"/>${[-14, -8, -3, 3, 8, 14].map(d => `<path d="M30 46 Q${30 + d * 1.6} 80 ${30 + d} 116" fill="none" stroke="#D9B27A" stroke-width="2.6"/>`).join('')}<path d="M30 46 Q30 80 30 116" fill="none" stroke="var(--ink)" stroke-width="1.4" opacity=".5"/></svg>`;
  const scoop = `<svg viewBox="0 0 90 60" class="bj"><path d="M8 30 Q8 8 36 8 L54 8 Q60 30 54 52 L36 52 Q8 52 8 30Z" fill="#E3ECF6" stroke="var(--ink)" stroke-width="2.6"/><rect x="54" y="24" width="32" height="12" rx="5" fill="#C9D7E8" stroke="var(--ink)" stroke-width="2.4"/>${[[20, 22], [32, 30], [22, 38], [38, 18]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="10" rx="2" fill="#fff" stroke="var(--ink)" stroke-width="1.6" transform="rotate(15 ${x + 5} ${y + 5})"/>`).join('')}</svg>`;

  /**
   * UFOBuilder.mount(el, product, {onAdd(opts, qty), addLabel, logo, soldOut})
   */
  window.UFOBuilder = {
    mount(el, p, cfg) {
      cfg = cfg || {};
      const G = (p.options || []).map((g, i) => Object.assign({}, g, { role: roleOf(g, i), i }));
      const by = r => G.filter(g => g.role === r);
      const sel = {}; G.forEach(g => sel[g.i] = []);
      const topState = {}; // gi → 'none' | 'whisking' | 'whisked' | 'poured'
      by('top').forEach(g => { topState[g.i] = 'none'; if (g.choices.length === 1 || g.required) sel[g.i] = [0]; });
      // اختيارات مبدئية للمجموعات الإلزامية الأحادية (غير الماتشا)
      G.forEach(g => { if (g.required && g.type !== 'multi' && g.role !== 'top' && g.role !== 'base' && g.choices.length) sel[g.i] = [0]; });

      const groupBox = (g, inner, hint) => `<div class="b-grp" data-g="${g.i}"><div class="b-h"><b>${esc(g.name)}</b>${g.required ? '<span class="b-req">مطلوب</span>' : ''}</div>${hint ? `<div class="b-hint">${hint}</div>` : ''}${inner}</div>`;
      const tile = (g, c, ci, kind) => `<button class="b-tile" data-g="${g.i}" data-c="${ci}">${kind === 'none' ? '' : jar(c.color || DEF_COL[g.role], kind)}<span class="b-btn">${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></span></button>`;
      const maxOf = g => g.type === 'multi' ? (Number(g.max) || g.choices.length) : 1;

      const leftHTML = by('base').map(g => groupBox(g, `<div class="b-tiles">${g.choices.map((c, ci) => tile(g, c, ci, 'jar')).join('')}</div>`,
        g.type === 'multi' && maxOf(g) < g.choices.length ? `اختر لين ${maxOf(g)}` : '')).join('');
      const rightHTML = [
        ...by('milk').map(g => groupBox(g, `<div class="b-tiles">${g.choices.map((c, ci) => tile(g, c, ci, 'milk')).join('')}</div>`)),
        ...by('top').map(g => groupBox(g, `${g.choices.length > 1 ? `<div class="b-chips">${g.choices.map((c, ci) => `<button class="b-btn b-chip" data-g="${g.i}" data-c="${ci}">${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></button>`).join('')}</div>` : ''}
          <div class="b-whisk" data-top="${g.i}"><div class="b-bowl"></div><div class="b-wk">${whisk}</div></div>
          <div class="b-row"><button class="b-btn b-act" data-act="whisk" data-g="${g.i}">اخفقها أول</button><button class="b-btn b-act" data-act="pour" data-g="${g.i}">صبّها</button></div>`)),
        ...by('ice').map(g => groupBox(g, `<div class="b-ice">${scoop}<div class="b-chips">${g.choices.map((c, ci) => `<button class="b-btn b-chip" data-g="${g.i}" data-c="${ci}">${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></button>`).join('')}</div></div>`)),
        ...by('extra').map(g => groupBox(g, `<div class="b-chips">${g.choices.map((c, ci) => `<button class="b-btn b-chip" data-g="${g.i}" data-c="${ci}">${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></button>`).join('')}</div>`, g.type === 'multi' && maxOf(g) < g.choices.length ? `اختر لين ${maxOf(g)}` : ''))
      ].join('');

      el.innerHTML = `<div class="builder">
        <div class="b-head"><h2>${esc(cfg.title || p.name)}</h2>${cfg.subtitle ? `<p>${esc(cfg.subtitle)}</p>` : ''}</div>
        <div class="b-grid">
          <div class="b-col b-left">${leftHTML}</div>
          <div class="b-mid">
            <div class="b-cupwrap"><div class="b-straw"></div><div class="b-cup"><div class="b-fill"></div><div class="b-over"><div class="b-ice-layer"></div><div class="b-cream"></div>${cfg.logo ? `<img class="b-logo" src="${esc(cfg.logo)}" alt="">` : ''}</div><div class="b-empty">كوبك فاضي…<br>ابدأ بالاختيار ✦</div></div><svg class="b-outline" viewBox="0 0 200 270" preserveAspectRatio="none"><polygon points="1,1 199,1 172,269 28,269" fill="none" stroke="#2E2433" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><div class="b-shadow"></div></div>
            <div class="b-say"></div>
            <div class="b-price"><span>${money(p.price)}</span><small class="b-sum"></small></div>
            <div class="b-row"><button class="b-btn b-reset">ابدأ من جديد</button></div>
          </div>
          <div class="b-col b-right">${rightHTML}</div>
        </div>
        <div class="b-foot"><div class="qty"><button data-q="1">+</button><span class="b-q">1</span><button data-q="-1">−</button></div>
          <button class="btn pink b-add" ${cfg.soldOut ? 'disabled' : ''}>${esc(cfg.soldOut ? 'نفدت الكمية' : (cfg.addLabel || 'هذا مشروبي! أضف للسلة'))}</button></div>
        <div class="b-err"></div>
      </div>`;

      const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
      let qty = 1;
      const fill = $('.b-fill');

      function price() {
        let u = Number(p.price) || 0;
        G.forEach(g => sel[g.i].forEach(ci => { if (g.role === 'top' && topState[g.i] !== 'poured') return; u += Number(g.choices[ci].price) || 0; }));
        return u;
      }
      function layers() {
        const L = [];
        by('base').forEach(g => sel[g.i].forEach(ci => L.push({ key: 'b' + g.i + '-' + ci, h: 13, color: g.choices[ci].color || DEF_COL.base, cls: 'l-syrup' })));
        by('milk').forEach(g => sel[g.i].forEach(ci => L.push({ key: 'm' + g.i + '-' + ci, h: by('top').some(t => topState[t.i] === 'poured') ? 40 : 52, color: g.choices[ci].color || DEF_COL.milk, cls: 'l-milk' })));
        by('top').forEach(g => { if (topState[g.i] === 'poured' && sel[g.i].length) L.push({ key: 't' + g.i, h: 24, color: g.choices[sel[g.i][0]].color || DEF_COL.top, cls: 'l-top' }); });
        const tot = L.reduce((a, l) => a + l.h, 0); if (tot > 88) L.forEach(l => l.h = l.h * 88 / tot);
        return L;
      }
      function drawCup() {
        const L = layers(), keep = {};
        L.forEach((l, i) => {
          let d = fill.querySelector(`[data-k="${l.key}"]`);
          if (!d) { d = document.createElement('div'); d.dataset.k = l.key; d.className = 'b-layer ' + l.cls; d.style.height = '0%'; fill.appendChild(d); d.getBoundingClientRect(); }
          d.style.background = l.color; d.style.order = i; d.style.height = l.h + '%'; keep[l.key] = 1;
        });
        [...fill.children].forEach(d => { if (!keep[d.dataset.k]) { d.style.height = '0%'; setTimeout(() => d.remove(), 450); } });
        // الثلج
        const iceG = by('ice')[0]; let cubes = 0;
        if (iceG && sel[iceG.i].length) { const c = iceG.choices[sel[iceG.i][0]]; cubes = /بدون|no/i.test(c.name) ? 0 : Math.min(7, 3 + sel[iceG.i][0] * 2); }
        const ic = $('.b-ice-layer'), fillTop = 100 - L.reduce((a, l) => a + l.h, 0);
        if (ic.children.length !== cubes) ic.innerHTML = Array.from({ length: cubes }, (_, k) => `<span style="left:${12 + (k * 23) % 64}%;bottom:${Math.max(8, 100 - fillTop - 6 - (k % 3) * 9)}%;transform:rotate(${(k * 37) % 50 - 25}deg);animation-delay:${k * 70}ms"></span>`).join('');
        else [...ic.children].forEach((s, k) => s.style.bottom = Math.max(8, 100 - fillTop - 6 - (k % 3) * 9) + '%');
        // الكريمة/الإضافات
        const ex = by('extra').some(g => sel[g.i].length);
        $('.b-cream').classList.toggle('on', ex && L.length > 0); $('.b-cream').style.bottom = (100 - fillTop - 3) + '%';
        $('.b-empty').style.opacity = L.length || cubes ? 0 : 1;
      }
      function say() {
        const parts = [];
        G.forEach(g => sel[g.i].forEach(ci => { if (g.role === 'top' && topState[g.i] !== 'poured') return; parts.push(g.choices[ci].name); }));
        $('.b-sum').textContent = parts.join(' + ');
        // تلميح الخطوة التالية
        let hint = '';
        const needBase = by('base').find(g => g.required && !sel[g.i].length), needMilk = by('milk').find(g => g.required && !sel[g.i].length);
        const top = by('top').find(g => topState[g.i] !== 'poured' && (g.required || topState[g.i] !== 'none'));
        if (needBase) hint = 'اختر ' + needBase.name;
        else if (needMilk) hint = 'خلّها كريمية… اختر ' + needMilk.name;
        else if (top && topState[top.i] === 'none') hint = 'خذ المخفقة واخفق ' + top.name;
        else if (top && topState[top.i] === 'whisked') hint = 'الحين صبّها فوق الحليب ✦';
        else hint = 'شوف هالطبقات! جاهز؟';
        $('.b-say').textContent = hint;
      }
      function sync() {
        $$('[data-g][data-c]').forEach(b => b.classList.toggle('on', sel[b.dataset.g].includes(+b.dataset.c)));
        by('top').forEach(g => {
          const st = topState[g.i], c = sel[g.i].length ? g.choices[sel[g.i][0]] : null, w = el.querySelector(`[data-top="${g.i}"]`);
          w.querySelector('.b-bowl').innerHTML = bowl(c ? (c.color || DEF_COL.top) : '#ddd', st === 'poured' ? 'empty' : st === 'whisked' ? 'whisked' : 'powder');
          w.classList.toggle('whisking', st === 'whisking');
          const bw = el.querySelector(`[data-act="whisk"][data-g="${g.i}"]`), bp = el.querySelector(`[data-act="pour"][data-g="${g.i}"]`);
          bw.disabled = !c || st !== 'none'; bw.classList.toggle('on', st === 'whisked' || st === 'poured');
          bp.disabled = st !== 'whisked'; bp.classList.toggle('on', st === 'poured');
          bw.innerHTML = (st === 'whisked' || st === 'poured' ? 'اتخفقت' : 'اخفقها') + '<i>✓</i>'; bp.innerHTML = (st === 'poured' ? 'انصبّت' : 'صبّها') + '<i>✓</i>';
        });
        $('.b-price span').textContent = money(price() * qty);
        drawCup(); say();
      }

      el.addEventListener('click', e => {
        const t = e.target.closest('button'); if (!t || t.disabled) return;
        if (t.dataset.q) { qty = Math.max(1, Math.min(20, qty + +t.dataset.q)); $('.b-q').textContent = qty; sync(); return; }
        if (t.classList.contains('b-reset')) { G.forEach(g => sel[g.i] = []); by('top').forEach(g => { topState[g.i] = 'none'; if (g.choices.length === 1 || g.required) sel[g.i] = [0]; }); sync(); return; }
        if (t.classList.contains('b-add')) {
          const miss = G.find(g => g.required && (!sel[g.i].length || (g.role === 'top' && topState[g.i] !== 'poured')));
          if (miss) { $('.b-err').textContent = miss.role === 'top' ? 'باقي تخفق ' + miss.name + ' وتصبّها' : 'اختر ' + miss.name; $('.b-err').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
          $('.b-err').textContent = '';
          const opts = []; G.forEach(g => { if (g.role === 'top' && topState[g.i] !== 'poured') return; sel[g.i].forEach(ci => opts.push([g.i, ci])); });
          cfg.onAdd && cfg.onAdd(opts, qty);
          return;
        }
        if (t.dataset.act) {
          const gi = +t.dataset.g;
          if (t.dataset.act === 'whisk') { topState[gi] = 'whisking'; sync(); setTimeout(() => { topState[gi] = 'whisked'; sync(); }, 1300); }
          else { topState[gi] = 'poured'; sync(); }
          return;
        }
        if (t.dataset.g != null && t.dataset.c != null) {
          const g = G[+t.dataset.g], ci = +t.dataset.c, a = sel[g.i], has = a.indexOf(ci);
          if (g.role === 'top' && topState[g.i] !== 'none') { topState[g.i] = 'none'; }
          if (g.type === 'multi') {
            if (has >= 0) a.splice(has, 1);
            else if (a.length >= maxOf(g)) { $('.b-say').textContent = 'تقدر تختار لين ' + maxOf(g) + ' بس'; t.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 250 }); return; }
            else a.push(ci);
          } else { sel[g.i] = has >= 0 && !g.required ? [] : [ci]; }
          sync();
        }
      });
      sync();
    }
  };
})();
