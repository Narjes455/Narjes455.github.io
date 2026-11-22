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

  /* ---------- رسومات واقعية ---------- */
  let UID = 0;
  const hexRgb = h => { const n = parseInt(String(h).replace('#', ''), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const shade = (h, p) => { const [r, g, b] = hexRgb(h), f = x => Math.max(0, Math.min(255, Math.round(p >= 0 ? x + (255 - x) * p : x * (1 + p)))); return `rgb(${f(r)},${f(g)},${f(b)})`; };
  const rgba = (h, a) => { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; };

  /** زينة حسب اسم النكهة/الحليب */
  function garnish(name) {
    const n = String(name || ''), id = 'z' + (++UID);
    if (/فراول|strawberr/i.test(n)) return `<defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FF6B6B"/><stop offset=".6" stop-color="#E0182D"/><stop offset="1" stop-color="#9E0B1C"/></radialGradient></defs>
      <path d="M14 8 C4 8 0 18 6 27 C10 33 14 36 14 36 C14 36 18 33 22 27 C28 18 24 8 14 8Z" fill="url(#${id})"/>
      ${[[9, 15], [15, 13], [19, 18], [11, 22], [17, 25], [14, 30], [8, 20]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx=".9" ry="1.3" fill="#FFE08A"/>`).join('')}
      <path d="M6 9 Q9 3 14 7 Q17 1 21 7 Q26 5 23 10 Q18 9 14 11 Q10 9 6 9Z" fill="#3E9B3A"/><path d="M14 7 L15 1" stroke="#2D7A2A" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="10" cy="14" rx="2.2" ry="3.5" fill="#fff" opacity=".35"/>`;
    if (/مانج|mango/i.test(n)) return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD35A"/><stop offset="1" stop-color="#F28A0F"/></linearGradient></defs>
      ${[[2, 14, -8], [14, 18, 10], [8, 5, 4]].map(([x, y, r]) => `<g transform="rotate(${r} ${x + 7} ${y + 7})"><rect x="${x}" y="${y}" width="14" height="14" rx="3" fill="url(#${id})"/><path d="M${x + 1} ${y + 1} h12 l-3 3 h-6z" fill="#fff" opacity=".35"/><rect x="${x}" y="${y}" width="14" height="14" rx="3" fill="none" stroke="#C96A05" stroke-width=".8" opacity=".6"/></g>`).join('')}`;
    if (/توت|بلوبير|blueberr/i.test(n)) return `<defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8E8CE0"/><stop offset=".55" stop-color="#3B3A8F"/><stop offset="1" stop-color="#1D1B52"/></radialGradient></defs>
      ${[[9, 22, 8], [21, 23, 7.5], [15, 12, 7.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/><path d="M${x - 2} ${y - r + 2.5} l2 1.6 l2 -1.6" stroke="#1A1840" stroke-width="1.2" fill="none"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="1.6" fill="#fff" opacity=".55"/>`).join('')}`;
    if (/خوخ|peach/i.test(n)) return `<defs><radialGradient id="${id}" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#FFE0A3"/><stop offset=".5" stop-color="#FF9E6B"/><stop offset="1" stop-color="#E5533D"/></radialGradient></defs>
      <circle cx="15" cy="21" r="13" fill="url(#${id})"/><path d="M15 9 Q12 20 16 33" stroke="#D2563F" stroke-width="1.2" fill="none" opacity=".6"/><path d="M15 9 Q22 2 27 6 Q22 11 15 9Z" fill="#4E9A3A"/><ellipse cx="10" cy="16" rx="3" ry="4" fill="#fff" opacity=".35"/>`;
    if (/فستق|pistach/i.test(n)) return `${[[4, 16, -20], [15, 10, 15], [12, 22, 40]].map(([x, y, r]) => `<g transform="rotate(${r} ${x + 7} ${y + 5})"><ellipse cx="${x + 7}" cy="${y + 5}" rx="8" ry="5.5" fill="#E9D7B0"/><ellipse cx="${x + 7}" cy="${y + 5}" rx="5.5" ry="3.6" fill="#8DB33A"/><ellipse cx="${x + 5.5}" cy="${y + 4}" rx="2" ry="1.2" fill="#C5E07A"/></g>`).join('')}`;
    if (/يوبي|ube|تارو|taro/i.test(n)) return `<defs><radialGradient id="${id}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#C9A6F0"/><stop offset="1" stop-color="#6B3FA0"/></radialGradient></defs>
      <path d="M3 30 Q2 22 9 20 Q8 12 16 12 Q24 11 23 19 Q30 21 28 30Z" fill="url(#${id})"/><path d="M9 22 Q15 17 21 21" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45"/><path d="M15 12 Q17 6 13 3" stroke="#6B3FA0" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    if (/شوكول|كاكاو|chocolate|cocoa/i.test(n)) return `<g transform="rotate(-12 15 20)"><rect x="3" y="9" width="24" height="20" rx="2.5" fill="#5A2E14"/>${[[4, 10], [16, 10], [4, 20], [16, 20]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="8" rx="1.5" fill="#7A4120"/><rect x="${x + 1}" y="${y + 1}" width="8" height="2" rx="1" fill="#9C5A33"/>`).join('')}</g>`;
    if (/كراميل|caramel|توفي/i.test(n)) return `<path d="M4 8 H26 V14 Q26 18 22 17 Q20 30 17 17 Q14 22 12 16 Q10 26 8 16 Q4 18 4 13Z" fill="#C9761E"/><path d="M6 10 H20" stroke="#F3B25A" stroke-width="2" stroke-linecap="round"/>`;
    if (/فانيل|vanilla/i.test(n)) return `<path d="M4 30 Q14 18 27 5" stroke="#3B2414" stroke-width="3" stroke-linecap="round"/><g transform="translate(17 22)">${[0, 72, 144, 216, 288].map(r => `<ellipse rx="3" ry="6.5" cy="-6" fill="#FFF7DC" stroke="#E8D9A8" stroke-width=".6" transform="rotate(${r})"/>`).join('')}<circle r="2.4" fill="#F2C94C"/></g>`;
    if (/موز|banana/i.test(n)) return `<path d="M4 12 Q8 34 28 26 Q26 22 22 23 Q10 24 8 10Z" fill="#FFD84D"/><path d="M8 14 Q12 26 24 24" stroke="#E0B024" stroke-width="1.4" fill="none"/><path d="M4 12 L6 8" stroke="#5B4A1F" stroke-width="2.4" stroke-linecap="round"/>`;
    if (/لوتس|بسكوت|بسكويت|cookie|lotus/i.test(n)) return `<g transform="rotate(-10 15 20)"><rect x="3" y="10" width="24" height="18" rx="3" fill="#C98A4B"/><rect x="5" y="12" width="20" height="14" rx="2" fill="none" stroke="#A86A33" stroke-width="1" stroke-dasharray="2 2"/><circle cx="10" cy="17" r="1" fill="#A86A33"/><circle cx="20" cy="21" r="1" fill="#A86A33"/></g>`;
    if (/شوفان|oat/i.test(n)) return `${[[6, 14, -30], [14, 10, 10], [20, 18, 40], [10, 22, -10], [18, 26, 20]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="2.6" fill="#E3C48C" stroke="#C49A55" stroke-width=".7" transform="rotate(${r} ${x} ${y})"/>`).join('')}`;
    if (/جوز الهند|كوكون|coconut/i.test(n)) return `<path d="M2 18 A13 13 0 0 0 28 18Z" fill="#6B4226"/><path d="M5 18 A10 10 0 0 0 25 18Z" fill="#FFFDF5"/><path d="M2 18 H28" stroke="#4A2C18" stroke-width="1.6"/>`;
    if (/لوز|almond/i.test(n)) return `${[[8, 18, -25], [19, 16, 20]].map(([x, y, r]) => `<path d="M${x} ${y - 9} Q${x + 7} ${y} ${x} ${y + 9} Q${x - 7} ${y} ${x} ${y - 9}Z" fill="#B07443" transform="rotate(${r} ${x} ${y})"/><path d="M${x} ${y - 6} Q${x + 2} ${y} ${x} ${y + 6}" stroke="#D29B6A" stroke-width="1" fill="none" transform="rotate(${r} ${x} ${y})"/>`).join('')}`;
    if (/لاكتوز|lactose|كامل|حليب|milk/i.test(n)) return `<path d="M15 6 Q24 18 24 23 A9 9 0 0 1 6 23 Q6 18 15 6Z" fill="#fff" stroke="#DCE6F0" stroke-width="1"/><ellipse cx="11" cy="21" rx="2" ry="3.5" fill="#E8F0F8"/>`;
    return '';
  }
  /** برطمان صوص زجاجي */
  function syrupJar(color, name) {
    const id = ++UID, g = 'l' + id, cl = 'cl' + id, top = shade(color, .3), bot = shade(color, -.32), art = garnish(name);
    const surf = 'M17 46 Q24 40 31 45 Q38 50 45 44 Q52 39 59 45 Q66 50 72 44';
    return `<svg viewBox="0 0 100 106" class="bj"><defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="${bot}"/></linearGradient>
      <clipPath id="${cl}"><path d="${surf} L72.5 86 Q72.5 95 64 95 H24 Q15.5 95 15.5 86Z"/></clipPath></defs>
      <ellipse cx="44" cy="100" rx="31" ry="4" fill="rgba(46,36,51,.2)"/>
      <path d="M15 28 Q14 24 18 23 H70 Q74 24 73 28 L74 87 Q74 97 64 97 H24 Q14 97 14 87Z" fill="rgba(255,255,255,.4)"/>
      <path d="${surf} L72.5 86 Q72.5 95 64 95 H24 Q15.5 95 15.5 86Z" fill="url(#${g})"/>
      <g clip-path="url(#${cl})">
        ${art ? [[18, 54, .62, -20], [40, 62, .7, 15], [54, 48, .55, 35], [24, 74, .5, 60]].map(([x, y, sc, r]) => `<g transform="translate(${x} ${y}) rotate(${r} 15 18) scale(${sc})" opacity=".92">${art}</g>`).join('') : ''}
        ${Array.from({ length: 14 }, (_, k) => `<circle cx="${20 + (k * 37) % 50}" cy="${52 + (k * 23) % 40}" r="${.8 + (k % 3) * .6}" fill="${k % 2 ? shade(color, -.45) : '#fff'}" opacity="${k % 2 ? .55 : .35}"/>`).join('')}
        <path d="M18 60 Q30 54 44 62 T70 58" stroke="${top}" stroke-width="3" fill="none" opacity=".5"/>
      </g>
      <path d="${surf}" stroke="${shade(color, .45)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M58 22 Q60 30 61 44" stroke="#C9A061" stroke-width="5" stroke-linecap="round"/><ellipse cx="57" cy="18" rx="6" ry="4" fill="#D9B27A" transform="rotate(-15 57 18)"/>
      <path d="M68 23 Q72 23 72 30 L73 52 Q73 58 70 58 Q67 58 67.5 52 L68 34 Q66 26 68 23Z" fill="${color}"/><path d="M70 30 L70.5 50" stroke="#fff" stroke-width="1.3" opacity=".6" stroke-linecap="round"/><circle cx="70" cy="60" r="2.6" fill="${color}"/>
      <path d="M15 28 Q14 24 18 23 H70 Q74 24 73 28 L74 87 Q74 97 64 97 H24 Q14 97 14 87Z" fill="none" stroke="rgba(46,36,51,.75)" stroke-width="2"/>
      <path d="M20 32 Q19 60 21 88" stroke="#fff" stroke-width="4.5" opacity=".55" stroke-linecap="round" fill="none"/><path d="M27 34 L27 44" stroke="#fff" stroke-width="2" opacity=".45" stroke-linecap="round"/>
      <path d="M73 38 Q91 40 89 60 Q87 76 73 74" fill="none" stroke="rgba(46,36,51,.55)" stroke-width="3.5"/>
      ${art ? `<g transform="translate(1 1) scale(1.25)">${art}</g>` : ''}</svg>`;
  }
  /** قارورة حليب زجاجية */
  function milkBottle(color, name) {
    const g = 'm' + (++UID), top = shade(color, .4), bot = shade(color, -.1);
    return `<svg viewBox="0 0 100 110" class="bj"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${bot}"/><stop offset=".35" stop-color="${top}"/><stop offset="1" stop-color="${shade(color, -.18)}"/></linearGradient></defs>
      <ellipse cx="42" cy="104" rx="26" ry="4" fill="rgba(46,36,51,.18)"/>
      <path d="M32 6 H52 V22 Q66 32 66 46 V94 Q66 102 58 102 H26 Q18 102 18 94 V46 Q18 32 32 22Z" fill="rgba(255,255,255,.4)" stroke="rgba(46,36,51,.75)" stroke-width="2"/>
      <path d="M20 40 Q42 35 64 40 V94 Q64 100 58 100 H26 Q20 100 20 94Z" fill="url(#${g})"/>
      <ellipse cx="42" cy="40" rx="22" ry="3.2" fill="${top}"/>
      <rect x="30" y="1" width="24" height="9" rx="3" fill="#E1523D" stroke="rgba(46,36,51,.75)" stroke-width="2"/>
      <rect x="22" y="56" width="40" height="22" rx="4" fill="#fff" opacity=".9" stroke="rgba(46,36,51,.35)"/><path d="M27 63 h30 M27 70 h20" stroke="rgba(46,36,51,.35)" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="25" y="30" width="5" height="64" rx="2.5" fill="#fff" opacity=".55"/>
      <g transform="translate(60 6) scale(1.15)">${garnish(name)}</g></svg>`;
  }
  function jar(color, kind, name) { return kind === 'milk' ? milkBottle(color, name) : syrupJar(color, name); }
  const photo = (url, name) => `<span class="b-photo"><img src="${esc(url)}" alt="${esc(name)}" loading="lazy"></span>`;

  /** وعاء الماتشا (شاوان) — الرغوة تتحكم فيها --froth من 0 إلى 1 */
  const bowl = (color, state) => {
    const id = ++UID, g = 'w' + id, m = 'mt' + id, f = 'fr' + id, cl = 'bc' + id;
    if (state === 'empty') return `<svg viewBox="0 0 140 84" class="bowl"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A3540"/><stop offset=".4" stop-color="#6A6370"/><stop offset="1" stop-color="#2E2A33"/></linearGradient></defs><ellipse cx="70" cy="80" rx="40" ry="4" fill="rgba(46,36,51,.2)"/><path d="M10 24 Q12 74 70 76 Q128 74 130 24Z" fill="url(#${g})"/><ellipse cx="70" cy="24" rx="60" ry="13" fill="#E8DCC4"/><ellipse cx="70" cy="25" rx="54" ry="10" fill="#EFE6D6"/><path d="M28 26 Q60 34 104 26" stroke="${shade(color, .1)}" stroke-width="3" opacity=".5" fill="none"/></svg>`;
    return `<svg viewBox="0 0 140 84" class="bowl"><defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A3540"/><stop offset=".4" stop-color="#6A6370"/><stop offset="1" stop-color="#2E2A33"/></linearGradient>
      <radialGradient id="${m}" cx=".5" cy=".45" r=".65"><stop offset="0" stop-color="${shade(color, -.12)}"/><stop offset="1" stop-color="${shade(color, -.4)}"/></radialGradient>
      <radialGradient id="${f}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${shade(color, .62)}"/><stop offset=".6" stop-color="${shade(color, .42)}"/><stop offset="1" stop-color="${shade(color, .15)}"/></radialGradient>
      <clipPath id="${cl}"><ellipse cx="70" cy="25" rx="54" ry="10"/></clipPath></defs>
      <ellipse cx="70" cy="80" rx="40" ry="4" fill="rgba(46,36,51,.2)"/>
      <path d="M10 24 Q12 74 70 76 Q128 74 130 24Z" fill="url(#${g})"/>
      <path d="M10 24 Q20 40 30 30 Q40 46 52 32 Q62 44 74 30 Q86 46 98 32 Q110 42 130 24" fill="#E8DCC4" opacity=".9"/>
      <ellipse cx="70" cy="24" rx="60" ry="13" fill="#E8DCC4"/>
      <g clip-path="url(#${cl})">
        <ellipse cx="70" cy="25" rx="54" ry="10" fill="url(#${m})"/>
        <g class="clumps">${Array.from({ length: 12 }, (_, k) => `<circle cx="${30 + (k * 41) % 80}" cy="${19 + (k * 7) % 12}" r="${1.4 + (k % 3)}" fill="${shade(color, -.5)}" opacity=".8"/><circle cx="${31 + (k * 41) % 80}" cy="${18 + (k * 7) % 12}" r="${.8 + (k % 2)}" fill="${shade(color, .25)}" opacity=".7"/>`).join('')}</g>
        <g class="froth">
          <ellipse cx="70" cy="25" rx="56" ry="11" fill="url(#${f})"/>
          ${Array.from({ length: 70 }, (_, k) => `<circle cx="${18 + (k * 53) % 104}" cy="${16 + (k * 17) % 18}" r="${.5 + (k % 4) * .35}" fill="#fff" opacity="${.35 + (k % 3) * .15}"/>`).join('')}
          ${Array.from({ length: 8 }, (_, k) => `<circle cx="${34 + (k * 29) % 72}" cy="${20 + (k * 5) % 9}" r="${1.6 + (k % 2)}" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/>`).join('')}
          <path d="M40 24 Q50 20 58 25 T76 24 T96 25" stroke="${shade(color, .7)}" stroke-width="1.4" fill="none" opacity=".7"/>
        </g>
      </g>
      <path d="M22 34 Q24 60 52 68" stroke="#fff" stroke-width="3" opacity=".18" fill="none" stroke-linecap="round"/></svg>`;
  };
  /** مخفقة خيزران (تشاسن) واقعية */
  const whisk = (() => { const g = 'bb' + (++UID); return `<svg viewBox="0 0 60 140" class="whisk"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A77B42"/><stop offset=".45" stop-color="#EBCF98"/><stop offset="1" stop-color="#9A6E38"/></linearGradient></defs>
    <rect x="23" y="2" width="14" height="56" rx="6.5" fill="url(#${g})"/><path d="M23 22 h14 M23 40 h14" stroke="#7E5A2B" stroke-width="1.6"/><rect x="25" y="4" width="3" height="52" rx="1.5" fill="#fff" opacity=".35"/>
    ${Array.from({ length: 17 }, (_, k) => { const d = (k - 8); return `<path d="M${30 + d * .35} 56 C${30 + d * 2.6} 74, ${30 + d * 2.9} 112, ${30 + d * 1.1} 134" fill="none" stroke="${k % 2 ? '#E4C892' : '#C49B5C'}" stroke-width="1.5" stroke-linecap="round"/>`; }).join('')}
    ${Array.from({ length: 7 }, (_, k) => { const d = (k - 3); return `<path d="M${30 + d * .4} 60 C${30 + d * 1.2} 80, ${30 + d * 1.3} 104, ${30 + d * .6} 118" fill="none" stroke="#B88F52" stroke-width="1.3"/>`; }).join('')}
    <path d="M30 134 C22 132 16 124 16 112" stroke="#C49B5C" stroke-width="1" fill="none" opacity=".6"/></svg>`; })();
  /** مغرفة ثلج */
  const scoop = (() => { const g = 'sc' + (++UID); return `<svg viewBox="0 0 110 64" class="bj"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F7FA"/><stop offset=".5" stop-color="#B9C3CE"/><stop offset="1" stop-color="#8A96A3"/></linearGradient></defs>
    <path d="M6 32 Q6 6 38 6 L60 8 Q68 32 60 56 L38 58 Q6 58 6 32Z" fill="url(#${g})" stroke="rgba(46,36,51,.6)" stroke-width="1.6"/>
    <rect x="62" y="26" width="44" height="12" rx="6" fill="url(#${g})" stroke="rgba(46,36,51,.6)" stroke-width="1.6"/>
    ${[[16, 16], [30, 24], [18, 34], [36, 12], [42, 32]].map(([x, y], k) => `<g transform="rotate(${k * 17 - 20} ${x + 7} ${y + 7})"><rect x="${x}" y="${y}" width="14" height="14" rx="3.5" fill="rgba(235,245,255,.85)" stroke="rgba(150,180,210,.9)" stroke-width="1"/><path d="M${x + 2} ${y + 3} h7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`).join('')}</svg>`; })();
  /** نوع الإضافة حسب اسمها */
  const extraKind = n => /كريم|cream|ويب/i.test(n) ? 'cream' : /صوص|سيرب|syrup|sauce|كراميل|شوكول|نوتيلا|درزل/i.test(n) ? 'drizzle'
    : /سبرنك|ملون|sprink/i.test(n) ? 'sprinkles' : /بوبا|لؤلؤ|boba|pearl|تابيوكا/i.test(n) ? 'boba'
    : /لوتس|كرمبل|كرامبل|بسكوت|بسكويت|crumb|lotus|oreo|أوريو/i.test(n) ? 'crumble' : /عسل|honey/i.test(n) ? 'honey' : /شوت|إسبريسو|اسبريسو|espresso|قهوة/i.test(n) ? 'shot' : 'garnish';
  const EXTRA_COL = { cream: '#FFFDF8', drizzle: '#C9761E', sprinkles: '#F67599', boba: '#3B2416', crumble: '#C98A4B', honey: '#F2A900', shot: '#4A2A18', garnish: '#F67599' };
  function extraArt(name, color) {
    const k = extraKind(name), c = color && color !== '#FFFFFF' ? color : EXTRA_COL[k], id = 'e' + (++UID);
    const shadow = `<ellipse cx="50" cy="94" rx="30" ry="4" fill="rgba(46,36,51,.18)"/>`;
    const dish = (inner) => `${shadow}<path d="M14 58 Q16 90 50 92 Q84 90 86 58Z" fill="#fff" stroke="rgba(46,36,51,.7)" stroke-width="2"/><ellipse cx="50" cy="58" rx="36" ry="9" fill="#F3EDE4" stroke="rgba(46,36,51,.7)" stroke-width="2"/>${inner}<path d="M22 66 Q26 84 44 88" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>`;
    let body = '';
    if (k === 'cream') body = `${shadow}<path d="M18 86 Q14 70 26 66 Q22 52 38 50 Q38 34 52 36 Q60 22 66 38 Q82 38 78 52 Q90 56 84 70 Q90 84 80 86Z" fill="#FFFDF8" stroke="rgba(46,36,51,.45)" stroke-width="2"/><path d="M28 70 Q46 62 72 70 M36 54 Q50 48 66 54" stroke="#E9DFD0" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="58" cy="30" r="7" fill="#E0182D"/><path d="M58 23 Q60 14 66 12" stroke="#3E7A2A" stroke-width="2" fill="none"/><circle cx="55" cy="28" r="2" fill="#fff" opacity=".6"/>`;
    else if (k === 'drizzle') body = `${shadow}<defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${shade(c, -.2)}"/><stop offset=".4" stop-color="${shade(c, .25)}"/><stop offset="1" stop-color="${shade(c, -.25)}"/></linearGradient></defs><path d="M34 34 H66 V84 Q66 92 58 92 H42 Q34 92 34 84Z" fill="url(#${id})" stroke="rgba(46,36,51,.7)" stroke-width="2"/><path d="M40 34 L44 20 H56 L60 34Z" fill="#F3EDE4" stroke="rgba(46,36,51,.7)" stroke-width="2"/><path d="M47 20 L49 8 H51 L53 20Z" fill="#E1523D"/><rect x="38" y="52" width="24" height="16" rx="3" fill="#fff" opacity=".85"/><path d="M34 40 Q30 50 32 58" stroke="${shade(c, .1)}" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="61" r="3" fill="${c}"/><rect x="38" y="38" width="4" height="44" rx="2" fill="#fff" opacity=".4"/>`;
    else if (k === 'sprinkles') body = dish(Array.from({ length: 22 }, (_, i) => `<rect x="${22 + (i * 37) % 54}" y="${48 + (i * 13) % 13}" width="9" height="3.2" rx="1.6" fill="${['#F67599', '#FBD01E', '#8CACCF', '#FF751F', '#7BC47F', '#fff'][i % 6]}" transform="rotate(${(i * 53) % 180} ${26 + (i * 37) % 54} ${50 + (i * 13) % 13})"/>`).join(''));
    else if (k === 'boba') body = dish(Array.from({ length: 16 }, (_, i) => `<circle cx="${24 + (i * 29) % 52}" cy="${50 + (i * 11) % 14}" r="6" fill="${c}"/><circle cx="${22 + (i * 29) % 52}" cy="${48 + (i * 11) % 14}" r="1.8" fill="#fff" opacity=".55"/>`).join(''));
    else if (k === 'crumble') body = dish(Array.from({ length: 18 }, (_, i) => `<path d="M${22 + (i * 31) % 54} ${50 + (i * 7) % 13} l5 -2 l3 4 l-4 4 l-5 -1z" fill="${i % 3 ? c : shade(c, -.25)}"/>`).join('') + `<g transform="rotate(-14 66 42)"><rect x="52" y="32" width="28" height="18" rx="3" fill="${c}" stroke="${shade(c, -.3)}"/><rect x="55" y="35" width="22" height="12" rx="2" fill="none" stroke="${shade(c, -.3)}" stroke-dasharray="2 2"/></g>`);
    else if (k === 'honey') body = `${shadow}<path d="M24 46 Q24 90 50 92 Q76 90 76 46Z" fill="#F2A900" opacity=".9" stroke="rgba(46,36,51,.7)" stroke-width="2"/><ellipse cx="50" cy="46" rx="26" ry="7" fill="#FFC93C" stroke="rgba(46,36,51,.7)" stroke-width="2"/><path d="M62 6 L46 52" stroke="#B98A4E" stroke-width="5" stroke-linecap="round"/>${[0, 1, 2].map(i => `<ellipse cx="${46 - i * 1.5}" cy="${52 - i * 6}" rx="8" ry="2.6" fill="#D9A05B" transform="rotate(-20 ${46 - i * 1.5} ${52 - i * 6})"/>`).join('')}`;
    else if (k === 'shot') body = `${shadow}<path d="M30 40 H70 L66 88 Q50 94 34 88Z" fill="rgba(255,255,255,.45)" stroke="rgba(46,36,51,.7)" stroke-width="2"/><path d="M31.5 52 H68.5 L66 86 Q50 91 34 86Z" fill="${c}"/><ellipse cx="50" cy="52" rx="18.5" ry="3.6" fill="#C98A4B"/><path d="M42 30 Q38 22 44 16 M56 30 Q52 22 58 14" stroke="#cbb" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>`;
    else body = dish(`<g transform="translate(34 30) scale(1.1)">${garnish(name) || `<circle cx="15" cy="18" r="10" fill="${c}"/>`}</g>`);
    return `<svg viewBox="0 0 100 100" class="bj">${body}</svg>`;
  }
  /** كريمة مخفوقة ثلاثية الأبعاد: حبل كريمة ملفوف حلزونياً من كرات صغيرة مظلّلة */
  const creamSVG = (() => {
    const id = ++UID, W = 240, H = 200, cx = 120, base = 150, turns = 2.7, N = 260, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, ang = t * turns * Math.PI * 2 + .6;
      const R = 92 * Math.pow(1 - t, .85) + 2;            // نصف قطر اللفّة
      const y = base - t * 108 - Math.pow(t, 4) * 26;      // الارتفاع
      const r = 36 * (1 - t * .72) + 4;                    // سماكة حبل الكريمة
      pts.push({ x: cx + Math.cos(ang) * R, y: y + Math.sin(ang) * R * .22, r, d: Math.sin(ang), t });
    }
    pts.sort((a, b) => (a.d - b.d) || (a.t - b.t));        // الخلف أولاً ثم الأمام
    const g = 'ck' + id, sh = 'ckS' + id, gr = 'ckG' + id;
    const balls = pts.map((p, i) => {
      const dark = .5 + p.d * .5;                          // الجزء الخلفي أغمق شوي
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}" fill="url(#${g})" opacity="1" style="filter:brightness(${(.9 + dark * .12).toFixed(3)})"/>`;
    }).join('');
    // أخاديد فوهة النجمة: خطوط قصيرة على الكرات الأمامية
    const ridges = pts.filter((p, i) => p.d > .35 && i % 5 === 0).map(p => `<path d="M${(p.x - p.r * .55).toFixed(1)} ${(p.y - p.r * .55).toFixed(1)} Q${(p.x - p.r * .2).toFixed(1)} ${p.y.toFixed(1)} ${(p.x - p.r * .45).toFixed(1)} ${(p.y + p.r * .6).toFixed(1)}" stroke="#E9DCC6" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="overflow:visible"><defs>
      <radialGradient id="${g}" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#FFFCF6"/><stop offset=".8" stop-color="#F1E6D4"/><stop offset="1" stop-color="#D9C7A9"/></radialGradient>
      <radialGradient id="${sh}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(90,70,40,.35)"/><stop offset="1" stop-color="rgba(90,70,40,0)"/></radialGradient>
      <filter id="${gr}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="1" seed="3" result="n"/><feColorMatrix in="n" values="0 0 0 0 .55  0 0 0 0 .48  0 0 0 0 .38  0 0 0 .07 0" result="k"/><feComposite in="k" in2="SourceGraphic" operator="in" result="k2"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="k2"/></feMerge></filter></defs>
      <ellipse cx="${cx}" cy="${base + 10}" rx="116" ry="14" fill="url(#${sh})"/>
      <g filter="url(#${gr})">${balls}${ridges}</g></svg>`;
  })();

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
      const froth = {};
      by('top').forEach(g => { topState[g.i] = 'none'; if (g.choices.length === 1 || g.required) sel[g.i] = [0]; });
      // اختيارات مبدئية للمجموعات الإلزامية الأحادية (غير الماتشا)
      G.forEach(g => { if (g.required && g.type !== 'multi' && g.role !== 'top' && g.role !== 'base' && g.choices.length) sel[g.i] = [0]; });

      const groupBox = (g, inner, hint) => `<div class="b-grp" data-g="${g.i}"><div class="b-h"><b>${esc(g.name)}</b>${g.required ? '<span class="b-req">مطلوب</span>' : ''}</div>${hint ? `<div class="b-hint">${hint}</div>` : ''}${inner}</div>`;
      const tile = (g, c, ci, kind) => `<button class="b-tile" data-g="${g.i}" data-c="${ci}">${c.img ? photo(c.img, c.name) : jar(c.color || DEF_COL[g.role], kind, c.name)}<span class="b-btn">${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></span></button>`;
      const maxOf = g => g.type === 'multi' ? (Number(g.max) || g.choices.length) : 1;

      const leftHTML = by('base').map(g => groupBox(g, `<div class="b-tiles">${g.choices.map((c, ci) => tile(g, c, ci, 'jar')).join('')}</div>`,
        g.type === 'multi' && maxOf(g) < g.choices.length ? `اختر لين ${maxOf(g)}` : '')).join('');
      const rightHTML = [
        ...by('milk').map(g => groupBox(g, `<div class="b-tiles">${g.choices.map((c, ci) => tile(g, c, ci, 'milk')).join('')}</div>`)),
        ...by('top').map(g => groupBox(g, `${g.choices.length > 1 ? `<div class="b-chips">${g.choices.map((c, ci) => `<button class="b-btn b-chip" data-g="${g.i}" data-c="${ci}">${c.img ? `<img class="b-chimg" src="${esc(c.img)}" alt="">` : ''}${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></button>`).join('')}</div>` : ''}
          <div class="b-whisk" data-top="${g.i}"><div class="b-bowl"></div><div class="b-wk">${whisk}</div><div class="b-splash"></div></div><div class="b-froth"><div class="bar"><i></i></div><span>حرّك المخفقة يمين ويسار ✦ أو اضغط «اخفقها»</span></div>
          <div class="b-row"><button class="b-btn b-act" data-act="whisk" data-g="${g.i}">اخفقها أول</button><button class="b-btn b-act" data-act="pour" data-g="${g.i}">صبّها</button></div>`)),
        ...by('ice').map(g => groupBox(g, `<div class="b-ice">${scoop}<div class="b-chips">${g.choices.map((c, ci) => `<button class="b-btn b-chip" data-g="${g.i}" data-c="${ci}">${c.img ? `<img class="b-chimg" src="${esc(c.img)}" alt="">` : ''}${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></button>`).join('')}</div></div>`)),
        ...by('extra').map(g => groupBox(g, `<div class="b-tiles">${g.choices.map((c, ci) => `<button class="b-tile" data-g="${g.i}" data-c="${ci}">${c.img ? photo(c.img, c.name) : extraArt(c.name, c.color)}<span class="b-btn">${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></span></button>`).join('')}</div>`, g.type === 'multi' && maxOf(g) < g.choices.length ? `اختر لين ${maxOf(g)}` : ''))
      ].join('');

      el.innerHTML = `<div class="builder">
        <div class="b-head"><h2>${esc(cfg.title || p.name)}</h2>${cfg.subtitle ? `<p>${esc(cfg.subtitle)}</p>` : ''}</div>
        <div class="b-grid">
          <div class="b-col b-left">${leftHTML}</div>
          <div class="b-mid">
            <div class="b-cupwrap"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="bm${UID + 1}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.05" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="0.7"/></filter></svg><div class="b-straw"></div><div class="b-cup"><div class="b-fill" style="filter:url(#bm${++UID})"></div><div class="b-fx"></div><div class="b-over"><div class="b-fruits"></div><div class="b-bubbles">${Array.from({ length: 9 }, (_, k) => `<i style="left:${10 + k * 9}%;animation-delay:${(k * 0.53) % 3}s;animation-duration:${2.6 + (k % 3) * .7}s"></i>`).join('')}</div><div class="b-ice-layer"></div><div class="b-boba"></div><div class="b-drizzle"></div>${cfg.logo ? `<img class="b-logo" src="${esc(cfg.logo)}" alt="">` : ''}</div><div class="b-empty">كوبك فاضي…<br>ابدأ بالاختيار ✦</div></div><div class="b-dew">${Array.from({ length: 34 }, (_, k) => `<i style="left:${6 + (k * 37) % 86}%;top:${4 + (k * 53) % 90}%;width:${3 + (k % 4) * 1.6}px;height:${4 + (k % 4) * 2.2}px"></i>`).join('')}</div><svg class="b-outline" viewBox="0 0 200 270" preserveAspectRatio="none"><polygon points="1,1 199,1 172,269 28,269" fill="none" stroke="rgba(46,36,51,.55)" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path d="M3 3 L28 266" stroke="rgba(255,255,255,.7)" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="M197 3 L172 266" stroke="rgba(255,255,255,.35)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="b-rim"></div><div class="b-cream">${creamSVG}</div><div class="b-tops"></div><div class="b-shadow"></div><div class="b-sticker">يمّ! 😍</div></div>
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
        by('top').forEach(g => { if (topState[g.i] === 'poured' && sel[g.i].length) L.push({ key: 't' + g.i, h: 22, color: g.choices[sel[g.i][0]].color || DEF_COL.top, cls: 'l-top' }); });
        by('extra').forEach(g => sel[g.i].forEach(ci => { const c = g.choices[ci]; if (extraKind(c.name) === 'shot') L.push({ key: 'x' + g.i + '-' + ci, h: 11, color: c.color && c.color !== '#FFFFFF' ? c.color : EXTRA_COL.shot, cls: 'l-top' }); }));
        // الكوب يتعبّى: الحليب ياخذ المساحة الباقية (ويترك مكان للماتشا لين تنصب)
        const T = by('extra').some(g => sel[g.i].some(ci => ['cream', 'sprinkles', 'crumble', 'honey', 'garnish'].includes(extraKind(g.choices[ci].name)))) ? 90 : 94;
        const bases = L.filter(l => l.cls === 'l-syrup'), bsum = bases.reduce((a, l) => a + l.h, 0);
        if (bsum > 30) bases.forEach(l => l.h = l.h * 30 / bsum);
        const milk = L.find(l => l.cls === 'l-milk');
        if (milk) {
          const topRoom = by('top').length && !by('top').some(t => topState[t.i] === 'poured') ? 22 : 0;
          const others = L.filter(l => l !== milk).reduce((a, l) => a + l.h, 0);
          milk.h = Math.max(18, T - others - topRoom);
        }
        const tot = L.reduce((a, l) => a + l.h, 0); if (tot > T) L.forEach(l => l.h = l.h * T / tot);
        return L;
      }
      function drawCup() {
        const L = layers(), keep = {}, pours = [];
        L.forEach((l, i) => {
          let d = fill.querySelector(`[data-k="${l.key}"]`);
          if (!d) { d = document.createElement('div'); d.dataset.k = l.key; d.className = 'b-layer ' + l.cls; d.style.height = '0%'; fill.appendChild(d); d.getBoundingClientRect(); pours.push({ color: l.color, at: L.slice(0, i + 1).reduce((a, x) => a + x.h, 0) }); }
          const below = i > 0 ? L[i - 1].color : l.color;
          d.style.setProperty('--c', l.color); d.style.setProperty('--below', below);
          d.style.background = l.cls === 'l-milk' && i > 0
            ? `linear-gradient(0deg, ${rgba(below, .85)} 0%, ${shade(below, .35)} 14%, ${l.color} 42%, ${shade(l.color, .15)} 100%)`
            : `linear-gradient(180deg, ${shade(l.color, .22)} 0%, ${l.color} 45%, ${shade(l.color, -.18)} 100%)`;
          d.classList.toggle('surface', i === L.length - 1);
          d.style.order = i; d.style.height = l.h + '%'; keep[l.key] = 1;
        });
        [...fill.children].forEach(d => { if (!keep[d.dataset.k]) { d.style.height = '0%'; setTimeout(() => d.remove(), 450); } });
        pours.forEach((p, k) => setTimeout(() => pour(p.color, p.at), k * 120));
        // قطع الفواكه داخل الكوب
        const fr = $('.b-fruits'), fk = {}; let acc = 0;
        L.forEach(l => {
          if (l.cls === 'l-syrup') {
            const [gi, ci] = l.key.slice(1).split('-').map(Number), c = G[gi].choices[ci], art = garnish(c.name);
            if (art) for (let k = 0; k < 3; k++) {
              const key = l.key + '-' + k; fk[key] = 1;
              let e = fr.querySelector(`[data-k="${key}"]`);
              if (!e) { e = document.createElement('span'); e.dataset.k = key; e.innerHTML = `<svg viewBox="0 0 30 36">${art}</svg>`; e.style.animationDelay = (250 + k * 140) + 'ms'; fr.appendChild(e); }
              e.style.left = (26 + ((k * 23 + ci * 13) % 48)) + '%'; e.style.bottom = (acc + l.h * .35 + (k % 2) * 6) + '%';
              e.style.setProperty('--r', ((k * 47 + ci * 31) % 70 - 35) + 'deg');
            }
          }
          acc += l.h;
        });
        [...fr.children].forEach(e => { if (!fk[e.dataset.k]) e.remove(); });
        $('.b-bubbles').classList.toggle('on', L.length > 0);
        $('.b-bubbles').style.height = (100 - (100 - L.reduce((a, l) => a + l.h, 0))) + '%';
        // الثلج
        const iceG = by('ice')[0]; let cubes = 0;
        if (iceG && sel[iceG.i].length) { const c = iceG.choices[sel[iceG.i][0]]; cubes = /بدون|no/i.test(c.name) ? 0 : Math.min(7, 3 + sel[iceG.i][0] * 2); }
        const ic = $('.b-ice-layer'), fillTop = 100 - L.reduce((a, l) => a + l.h, 0);
        if (ic.children.length !== cubes) ic.innerHTML = Array.from({ length: cubes }, (_, k) => `<span style="left:${12 + (k * 23) % 64}%;bottom:${Math.max(8, 100 - fillTop - 6 - (k % 3) * 9)}%;transform:rotate(${(k * 37) % 50 - 25}deg);animation-delay:${k * 70}ms"></span>`).join('');
        else [...ic.children].forEach((s, k) => s.style.bottom = Math.max(8, 100 - fillTop - 6 - (k % 3) * 9) + '%');
        // الكريمة/الإضافات
        const EX = []; by('extra').forEach(g => sel[g.i].forEach(ci => { const c = g.choices[ci], k = extraKind(c.name); EX.push({ k, name: c.name, color: c.color && c.color !== '#FFFFFF' ? c.color : EXTRA_COL[k], key: g.i + '-' + ci }); }));
        const has = k => EX.filter(x => x.k === k), surf = 100 - fillTop, live = L.length > 0;
        const cream = has('cream').length > 0 && live;
        const cb = 91; $('.b-cream').classList.toggle('on', cream); el.querySelector('.b-cupwrap').classList.toggle('creamy', cream); $('.b-cream').style.bottom = cb + '%';
        // صوص ينساب على جدار الكوب
        const dz = $('.b-drizzle'), dk = has('drizzle').map(x => x.key + x.color).join('|') + '@' + Math.round(surf);
        if (dz.dataset.k !== dk) {
          dz.dataset.k = dk;
          dz.innerHTML = live ? has('drizzle').map((x, i) => `<svg viewBox="0 0 200 270" preserveAspectRatio="none"><path class="dzp" d="M${12 + i * 6} 6 Q${30 + i * 8} 30 ${20 + i * 6} 60 T${34 + i * 6} ${120 + i * 14} T${40 + i * 5} ${300 - surf * 2.2} M${188 - i * 6} 6 Q${170 - i * 8} 34 ${180 - i * 6} 70 T${166 - i * 6} ${130 + i * 12} T${158 - i * 5} ${290 - surf * 2.2} M${80 + i * 14} 4 Q${92 + i * 14} 22 ${84 + i * 14} 44" stroke="${x.color}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/><path d="M${12 + i * 6} 6 Q${30 + i * 8} 30 ${20 + i * 6} 60" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45"/></svg>`).join('') : '';
        }
        // حبات بوبا في القاع
        const bb = $('.b-boba'), bk = has('boba').map(x => x.key + x.color).join('|') + (live ? 1 : 0);
        if (bb.dataset.k !== bk) { bb.dataset.k = bk; bb.innerHTML = live ? has('boba').flatMap(x => Array.from({ length: 14 }, (_, i) => `<i style="background:radial-gradient(circle at 35% 30%, ${shade(x.color, .45)}, ${x.color} 55%, ${shade(x.color, -.35)});left:${18 + (i * 23) % 62}%;bottom:${3 + (i % 3) * 5 + (i * 7) % 4}%;animation-delay:${i * 50}ms"></i>`)).join('') : ''; }
        // رشّات فوق المشروب أو الكريمة
        const tp = $('.b-tops'), tops = EX.filter(x => ['sprinkles', 'crumble', 'honey', 'garnish'].includes(x.k)), tk = tops.map(x => x.key).join('|') + (live ? 1 : 0);
        tp.style.bottom = (cream ? cb + 16 : surf - 2) + '%'; tp.classList.toggle('oncream', cream);
        if (tp.dataset.k !== tk) {
          tp.dataset.k = tk;
          tp.innerHTML = !live ? '' : tops.map(x => {
            if (x.k === 'sprinkles') return Array.from({ length: 16 }, (_, i) => `<b style="left:${16 + (i * 41) % 68}%;bottom:${(i * 13) % 14}px;background:${['#F67599', '#FBD01E', '#8CACCF', '#FF751F', '#7BC47F', '#fff'][i % 6]};--r:${(i * 61) % 180}deg;animation-delay:${i * 30}ms"></b>`).join('');
            if (x.k === 'crumble') return Array.from({ length: 14 }, (_, i) => `<u style="left:${16 + (i * 43) % 68}%;bottom:${(i * 11) % 12}px;background:${i % 3 ? x.color : shade(x.color, -.25)};animation-delay:${i * 30}ms"></u>`).join('');
            if (x.k === 'honey') return `<s style="background:linear-gradient(90deg,transparent,${x.color},transparent)"></s>`;
            const art = garnish(x.name); return art ? [30, 62].map((l, i) => `<em style="left:${l}%;--r:${i ? 18 : -14}deg"><svg viewBox="0 0 30 36">${art}</svg></em>`).join('') : '';
          }).join('');
        }
        $('.b-empty').style.opacity = L.length || cubes ? 0 : 1;
      }
      function pour(color, at) {
        const fx = $('.b-fx'), st = document.createElement('div');
        st.className = 'b-stream'; st.style.background = `linear-gradient(90deg, ${shade(color, -.15)}, ${shade(color, .3)} 45%, ${color})`;
        st.style.height = (100 - at + 4) + '%'; fx.appendChild(st);
        for (let k = 0; k < 7; k++) { const d = document.createElement('i'); d.className = 'b-drop'; d.style.background = color; d.style.bottom = at + '%'; d.style.setProperty('--dx', ((k - 3) * 14) + 'px'); d.style.setProperty('--dy', (-18 - (k % 3) * 10) + 'px'); d.style.animationDelay = (260 + k * 25) + 'ms'; fx.appendChild(d); setTimeout(() => d.remove(), 1200); }
        el.querySelector('.b-cupwrap').animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-2deg) scale(1.02)' }, { transform: 'rotate(1.5deg)' }, { transform: 'none' }], { duration: 700, delay: 200 });
        setTimeout(() => st.classList.add('out'), 650); setTimeout(() => st.remove(), 1100);
      }
      let wasDone = false;
      function drinkName() {
        const fl = by('base').flatMap(g => sel[g.i].map(ci => g.choices[ci].name));
        const mk = by('milk').flatMap(g => sel[g.i].map(ci => g.choices[ci].name));
        const tp = by('top').filter(g => topState[g.i] === 'poured').flatMap(g => sel[g.i].map(ci => g.choices[ci].name));
        let n = (tp[0] || p.name);
        if (fl.length) n += ' ب' + fl.join(' و');
        if (mk.length) n += ' وحليب ' + mk[0].replace(/^حليب\s*/, '');
        return n;
      }
      function celebrate() {
        const wrap = el.querySelector('.b-cupwrap'); wrap.classList.add('done');
        const box = el.querySelector('.builder'), cols = ['#F67599', '#FBD01E', '#FF751F', '#E1523D', '#8CACCF', '#fff'];
        for (let k = 0; k < 46; k++) {
          const c = document.createElement('i'); c.className = 'b-conf';
          c.style.background = cols[k % cols.length]; c.style.left = (5 + (k * 37) % 90) + '%';
          c.style.setProperty('--x', ((k * 53) % 120 - 60) + 'px'); c.style.setProperty('--rot', (k * 67 % 720) + 'deg');
          c.style.animationDelay = (k % 12) * 40 + 'ms'; c.style.borderRadius = k % 3 ? '2px' : '50%';
          box.appendChild(c); setTimeout(() => c.remove(), 2600);
        }
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
        else hint = '✦ ' + drinkName() + ' ✦';
        $('.b-say').textContent = hint;
        const done = !needBase && !needMilk && !top && layers().length > 0 && !G.some(g => g.required && !sel[g.i].length);
        $('.b-say').classList.toggle('done', done);
        if (done && !wasDone) setTimeout(celebrate, 700);
        if (!done) el.querySelector('.b-cupwrap').classList.remove('done');
        wasDone = done;
      }
      function setFroth(gi) {
        const w = el.querySelector(`[data-top="${gi}"]`); if (!w) return;
        const v = Math.max(0, Math.min(1, froth[gi] || 0));
        w.style.setProperty('--froth', v);
        const bar = w.parentNode.querySelector('.b-froth'); if (bar) { bar.querySelector('i').style.width = Math.round(v * 100) + '%'; bar.classList.toggle('full', v >= 1); bar.classList.toggle('hide', topState[gi] === 'poured'); }
      }
      function splash(gi) {
        const sp = el.querySelector(`[data-top="${gi}"] .b-splash`); if (!sp) return;
        const g = G[gi], c = sel[gi].length ? (g.choices[sel[gi][0]].color || DEF_COL.top) : DEF_COL.top;
        const d = document.createElement('i'); d.style.background = shade(c, .3); d.style.left = (40 + Math.random() * 20) + '%';
        d.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px'); sp.appendChild(d); setTimeout(() => d.remove(), 600);
      }
      function whiskTo(gi, v) {
        froth[gi] = Math.min(1, v); setFroth(gi);
        if (froth[gi] >= 1 && topState[gi] !== 'whisked') { topState[gi] = 'whisked'; el.querySelector(`[data-top="${gi}"]`).classList.remove('whisking', 'drag'); sync(); }
      }
      function autoWhisk(gi) {
        if (topState[gi] !== 'none') return;
        topState[gi] = 'whisking'; sync();
        const t0 = performance.now(), dur = 2200, start = froth[gi] || 0;
        const step = now => { if (topState[gi] !== 'whisking') return; const p = (now - t0) / dur; if (Math.random() < .35) splash(gi); whiskTo(gi, start + (1 - start) * p); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
      // الخفق بالسحب: حرّك المخفقة يمين ويسار
      el.querySelectorAll('.b-whisk').forEach(w => {
        const gi = +w.dataset.top; let lastX = null;
        const wk = w.querySelector('.b-wk');
        w.addEventListener('pointerdown', e => { if (topState[gi] !== 'none' && topState[gi] !== 'whisking') return; if (!sel[gi].length) return; lastX = e.clientX; w.setPointerCapture(e.pointerId); topState[gi] = 'whisking'; w.classList.add('whisking', 'drag'); });
        w.addEventListener('pointermove', e => {
          if (lastX == null || topState[gi] !== 'whisking') return;
          const r = w.getBoundingClientRect(), x = Math.max(-40, Math.min(40, e.clientX - r.left - r.width / 2));
          wk.style.setProperty('--wx', x + 'px');
          const dist = Math.abs(e.clientX - lastX); lastX = e.clientX;
          if (dist > 2 && Math.random() < .3) splash(gi);
          whiskTo(gi, (froth[gi] || 0) + dist / 900);
        });
        const end = () => { if (lastX == null) return; lastX = null; w.classList.remove('drag'); wk.style.removeProperty('--wx'); if (topState[gi] === 'whisking' && (froth[gi] || 0) < 1) { topState[gi] = 'none'; w.classList.remove('whisking'); sync(); } };
        w.addEventListener('pointerup', end); w.addEventListener('pointercancel', end);
      });
      function sync() {
        $$('[data-g][data-c]').forEach(b => b.classList.toggle('on', sel[b.dataset.g].includes(+b.dataset.c)));
        by('top').forEach(g => {
          const st = topState[g.i], c = sel[g.i].length ? g.choices[sel[g.i][0]] : null, w = el.querySelector(`[data-top="${g.i}"]`);
          const bw0 = w.querySelector('.b-bowl'), bkey = (c ? c.color : '') + (st === 'poured' ? 'e' : 'f');
          if (bw0.dataset.k !== bkey) { bw0.dataset.k = bkey; bw0.innerHTML = bowl(c ? (c.color || DEF_COL.top) : '#bbb', st === 'poured' ? 'empty' : 'f'); }
          if (st === 'whisked') froth[g.i] = 1;
          setFroth(g.i);
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
        if (t.classList.contains('b-reset')) { G.forEach(g => { sel[g.i] = []; froth[g.i] = 0; }); by('top').forEach(g => { topState[g.i] = 'none'; if (g.choices.length === 1 || g.required) sel[g.i] = [0]; }); sync(); return; }
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
          if (t.dataset.act === 'whisk') autoWhisk(gi);
          else { topState[gi] = 'poured'; sync(); }
          return;
        }
        if (t.dataset.g != null && t.dataset.c != null) {
          const g = G[+t.dataset.g], ci = +t.dataset.c, a = sel[g.i], has = a.indexOf(ci);
          if (g.role === 'top') { if (topState[g.i] !== 'none') topState[g.i] = 'none'; froth[g.i] = 0; }
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
