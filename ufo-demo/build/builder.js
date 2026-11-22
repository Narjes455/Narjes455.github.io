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
    const g = 'l' + (++UID), gl = 'gl' + UID, top = shade(color, .25), bot = shade(color, -.28);
    return `<svg viewBox="0 0 100 104" class="bj"><defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${bot}"/></linearGradient>
      <linearGradient id="${gl}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient></defs>
      <ellipse cx="44" cy="98" rx="30" ry="4" fill="rgba(46,36,51,.18)"/>
      <path d="M16 30 Q14 26 18 24 H70 Q74 26 72 30 L74 86 Q74 96 64 96 H24 Q14 96 14 86Z" fill="rgba(255,255,255,.35)"/>
      <path d="M17 44 Q44 38 71 44 L72.5 86 Q72.5 94 64 94 H24 Q15.5 94 15.5 86Z" fill="url(#${g})"/>
      <ellipse cx="44" cy="44" rx="27" ry="4.5" fill="${top}" opacity=".9"/>
      <path d="M17 44 Q20 52 22 46 Q24 58 27 46" fill="${color}" opacity=".85"/>
      <path d="M16 30 Q14 26 18 24 H70 Q74 26 72 30 L74 86 Q74 96 64 96 H24 Q14 96 14 86Z" fill="url(#${gl})" stroke="rgba(46,36,51,.75)" stroke-width="2"/>
      <rect x="14" y="16" width="60" height="10" rx="3" fill="#E9E2D6" stroke="rgba(46,36,51,.75)" stroke-width="2"/>
      <path d="M72 40 Q90 42 88 60 Q86 74 72 72" fill="none" stroke="rgba(46,36,51,.55)" stroke-width="3.5"/>
      <rect x="21" y="34" width="5" height="52" rx="2.5" fill="#fff" opacity=".5"/>
      <g transform="translate(58 2) scale(1.15)">${garnish(name)}</g></svg>`;
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

  /** وعاء الماتشا (شاوان) */
  const bowl = (color, state) => {
    const g = 'w' + (++UID), m = 'mt' + UID;
    const surf = state === 'empty' ? '#EFE6D6' : state === 'whisked' ? shade(color, .25) : shade(color, -.05);
    return `<svg viewBox="0 0 140 84" class="bowl ${state}"><defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A3540"/><stop offset=".4" stop-color="#6A6370"/><stop offset="1" stop-color="#2E2A33"/></linearGradient>
      <radialGradient id="${m}" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="${state === 'whisked' ? shade(color, .45) : surf}"/><stop offset="1" stop-color="${shade(color, -.2)}"/></radialGradient></defs>
      <ellipse cx="70" cy="80" rx="40" ry="4" fill="rgba(46,36,51,.2)"/>
      <path d="M10 24 Q12 74 70 76 Q128 74 130 24Z" fill="url(#${g})"/>
      <path d="M10 24 Q20 40 30 30 Q40 46 52 32 Q62 44 74 30 Q86 46 98 32 Q110 42 130 24" fill="#E8DCC4" opacity=".9"/>
      <ellipse cx="70" cy="24" rx="60" ry="13" fill="#E8DCC4"/>
      <ellipse cx="70" cy="25" rx="54" ry="10" fill="${state === 'empty' ? '#EFE6D6' : `url(#${m})`}"/>
      ${state === 'whisked' ? Array.from({ length: 18 }, (_, k) => `<circle cx="${30 + (k * 37) % 80}" cy="${19 + (k * 13) % 12}" r="${0.8 + (k % 3) * .7}" fill="#fff" opacity=".6"/>`).join('') : state === 'powder' ? `<ellipse cx="70" cy="24" rx="20" ry="4.5" fill="${shade(color, -.25)}" opacity=".7"/>` : ''}
      <path d="M22 34 Q24 60 52 68" stroke="#fff" stroke-width="3" opacity=".18" fill="none" stroke-linecap="round"/></svg>`;
  };
  /** مخفقة خيزران (تشاسن) */
  const whisk = (() => { const g = 'bb' + (++UID); return `<svg viewBox="0 0 60 130" class="whisk"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B98A4E"/><stop offset=".5" stop-color="#E8C98E"/><stop offset="1" stop-color="#A67A40"/></linearGradient></defs>
    <rect x="23" y="2" width="14" height="52" rx="6" fill="url(#${g})"/><path d="M23 20 h14 M23 36 h14" stroke="#8C6533" stroke-width="1.4"/>
    ${Array.from({ length: 13 }, (_, k) => { const d = (k - 6) * 3.2; return `<path d="M30 52 Q${30 + d * 1.8} 92 ${30 + d} 126" fill="none" stroke="${k % 2 ? '#E2C48C' : '#C9A061'}" stroke-width="1.8"/>`; }).join('')}
    <ellipse cx="30" cy="96" rx="9" ry="16" fill="none" stroke="#C9A061" stroke-width="1.4" opacity=".8"/></svg>`; })();
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
  const creamSVG = `<svg viewBox="0 0 120 50" preserveAspectRatio="none"><path d="M6 48 Q4 34 18 32 Q14 20 30 20 Q32 8 48 12 Q56 0 70 10 Q86 6 88 20 Q104 20 100 32 Q116 34 114 48Z" fill="#FFFDF8" stroke="rgba(46,36,51,.35)" stroke-width="1.5"/><path d="M22 36 Q40 28 60 34 Q80 40 98 34 M34 24 Q50 18 66 24 Q78 28 86 24" stroke="#EDE3D4" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;

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
      const tile = (g, c, ci, kind) => `<button class="b-tile" data-g="${g.i}" data-c="${ci}">${c.img ? photo(c.img, c.name) : jar(c.color || DEF_COL[g.role], kind, c.name)}<span class="b-btn">${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></span></button>`;
      const maxOf = g => g.type === 'multi' ? (Number(g.max) || g.choices.length) : 1;

      const leftHTML = by('base').map(g => groupBox(g, `<div class="b-tiles">${g.choices.map((c, ci) => tile(g, c, ci, 'jar')).join('')}</div>`,
        g.type === 'multi' && maxOf(g) < g.choices.length ? `اختر لين ${maxOf(g)}` : '')).join('');
      const rightHTML = [
        ...by('milk').map(g => groupBox(g, `<div class="b-tiles">${g.choices.map((c, ci) => tile(g, c, ci, 'milk')).join('')}</div>`)),
        ...by('top').map(g => groupBox(g, `${g.choices.length > 1 ? `<div class="b-chips">${g.choices.map((c, ci) => `<button class="b-btn b-chip" data-g="${g.i}" data-c="${ci}">${c.img ? `<img class="b-chimg" src="${esc(c.img)}" alt="">` : ''}${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></button>`).join('')}</div>` : ''}
          <div class="b-whisk" data-top="${g.i}"><div class="b-bowl"></div><div class="b-wk">${whisk}</div></div>
          <div class="b-row"><button class="b-btn b-act" data-act="whisk" data-g="${g.i}">اخفقها أول</button><button class="b-btn b-act" data-act="pour" data-g="${g.i}">صبّها</button></div>`)),
        ...by('ice').map(g => groupBox(g, `<div class="b-ice">${scoop}<div class="b-chips">${g.choices.map((c, ci) => `<button class="b-btn b-chip" data-g="${g.i}" data-c="${ci}">${c.img ? `<img class="b-chimg" src="${esc(c.img)}" alt="">` : ''}${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></button>`).join('')}</div></div>`)),
        ...by('extra').map(g => groupBox(g, `<div class="b-tiles">${g.choices.map((c, ci) => `<button class="b-tile" data-g="${g.i}" data-c="${ci}">${c.img ? photo(c.img, c.name) : extraArt(c.name, c.color)}<span class="b-btn">${esc(c.name)}${Number(c.price) ? ` <small>+${Number(c.price)}</small>` : ''}<i>✓</i></span></button>`).join('')}</div>`, g.type === 'multi' && maxOf(g) < g.choices.length ? `اختر لين ${maxOf(g)}` : ''))
      ].join('');

      el.innerHTML = `<div class="builder">
        <div class="b-head"><h2>${esc(cfg.title || p.name)}</h2>${cfg.subtitle ? `<p>${esc(cfg.subtitle)}</p>` : ''}</div>
        <div class="b-grid">
          <div class="b-col b-left">${leftHTML}</div>
          <div class="b-mid">
            <div class="b-cupwrap"><div class="b-straw"></div><div class="b-cup"><div class="b-fill"></div><div class="b-fx"></div><div class="b-over"><div class="b-fruits"></div><div class="b-bubbles">${Array.from({ length: 9 }, (_, k) => `<i style="left:${10 + k * 9}%;animation-delay:${(k * 0.53) % 3}s;animation-duration:${2.6 + (k % 3) * .7}s"></i>`).join('')}</div><div class="b-ice-layer"></div><div class="b-boba"></div><div class="b-drizzle"></div><div class="b-cream">${creamSVG}</div><div class="b-tops"></div>${cfg.logo ? `<img class="b-logo" src="${esc(cfg.logo)}" alt="">` : ''}</div><div class="b-empty">كوبك فاضي…<br>ابدأ بالاختيار ✦</div></div><svg class="b-outline" viewBox="0 0 200 270" preserveAspectRatio="none"><polygon points="1,1 199,1 172,269 28,269" fill="none" stroke="#2E2433" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><div class="b-shadow"></div><div class="b-sticker">يمّ! 😍</div></div>
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
        by('extra').forEach(g => sel[g.i].forEach(ci => { const c = g.choices[ci]; if (extraKind(c.name) === 'shot') L.push({ key: 'x' + g.i + '-' + ci, h: 11, color: c.color && c.color !== '#FFFFFF' ? c.color : EXTRA_COL.shot, cls: 'l-top' }); }));
        const cap = by('extra').some(g => sel[g.i].length) ? 76 : 88, tot = L.reduce((a, l) => a + l.h, 0); if (tot > cap) L.forEach(l => l.h = l.h * cap / tot);
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
        $('.b-cream').classList.toggle('on', cream); $('.b-cream').style.bottom = (surf - 3) + '%';
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
        tp.style.bottom = (surf + (cream ? 6 : -2)) + '%';
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
