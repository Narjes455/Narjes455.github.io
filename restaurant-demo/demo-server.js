/* سيرفر تجريبي داخل المتصفح: يقلّد Google Apps Script عشان النموذج يشتغل بدون شيت.
   البيانات تنحفظ في المتصفح (localStorage) فطلب الزبون يظهر في صفحة الإدارة على نفس الجهاز. */
(function () {
  const KEY = "jamraDemo.v1";
  const STAFF = [
    { name: "المدير", pin: "1234", role: "مدير" },
    { name: "سعد", pin: "1111", role: "كاشير" },
    { name: "المطبخ", pin: "2222", role: "مطبخ" }
  ];
  const MENU = [
    ["البرجر", "جَمرة كلاسيك", "لحم أنقس مشوي على الفحم، شيدر، صوص جمرة", 24, ["عادي", "دبل"], null, "متوفر"],
    ["البرجر", "دجاج كرسبي", "صدر دجاج مقرمش، خس، مايونيز حار", 21, ["عادي", "حار"], null, "متوفر"],
    ["البرجر", "سموكي ماشروم", "لحم، فطر مدخن، جبنة سويسرية", 27, [], 4, "متوفر"],
    ["البروست", "بروست ٤ قطع", "مع بطاطس وثومية وخبز", 22, ["عادي", "حار"], null, "متوفر"],
    ["البروست", "بروست ٨ قطع", "وجبة عائلية مع بطاطس كبير", 39, ["عادي", "حار"], 12, "متوفر"],
    ["البروست", "ستربس ٥ قطع", "مع صوص العسل والخردل", 19, [], null, "متوفر"],
    ["الجانبيات", "بطاطس جمرة", "بطاطس مع صوص جمرة وجبنة", 12, [], null, "متوفر"],
    ["الجانبيات", "أصابع موزاريلا", "٦ قطع", 14, [], 0, "متوفر"],
    ["الجانبيات", "كول سلو", "", 6, [], null, "متوفر"],
    ["المشروبات", "موهيتو", "", 11, ["ليمون", "فراولة", "توت"], null, "متوفر"],
    ["المشروبات", "مشروب غازي", "", 4, [], null, "متوفر"]
  ].map(([cat, name, desc, price, opts, qty, status]) => ({ cat, name, desc, price, opts, qty, status }));
  const SET = {
    name: "جَمرة", tagline: "مطبخ سحابي في البدراني · التحضير ٢٠ دقيقة", open: true, closedMsg: "الطلبات مقفلة حالياً",
    doneMsg: "طلبك وصل للمطبخ وبدأ يتجهز.", cash: true, transfer: true, bank: "بنك تجريبي", holder: "مطعم جمرة (حساب وهمي)",
    account: "", iban: "SA00 0000 0000 0000 0000 0000", whatsapp: "", pickup: true, dinein: false, delivery: true,
    deliveryFee: 10, deliveryMin: 30,
    zones: [{ name: "البدراني", fee: 8 }, { name: "العزيزية", fee: 12 }, { name: "الدفاع", fee: 15 }, { name: "قباء", fee: 18 }],
    loyalty: true, every: 5, gift: "بطاطس جمرة"
  };
  const LOW = 5;
  const pad = n => String(n).padStart(2, "0");
  const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hm = d => pad(d.getHours()) + ":" + pad(d.getMinutes());
  const find = (st, n) => st.menu.find(i => i.name === n);
  const status = (it) => {
    if (it.status === "مخفي" || it.status === "منتهي") return it.status;
    if (it.qty !== null && it.qty <= 0) return "منتهي";
    if (it.qty !== null && it.qty <= LOW) return "ينتهي قريباً";
    return it.status;
  };

  function seed() {
    const st = { menu: JSON.parse(JSON.stringify(MENU)), orders: [], att: [], seq: {}, open: true };
    const names = ["أبو فهد", "ريم", "عبدالله", "نوف", "سلطان", "هيا", "ماجد", "شهد", "تركي", "لمى"];
    const now = new Date();
    let r = 7;
    const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
    for (let back = 13; back >= 0; back--) {
      const day = new Date(now - back * 864e5);
      const count = back === 0 ? 6 : 14 + Math.floor(rnd() * 16);
      for (let i = 0; i < count; i++) {
        const t = new Date(day); t.setHours(13 + Math.floor(rnd() * 12) % 24, Math.floor(rnd() * 60));
        if (back === 0 && t > now) t.setTime(now - (count - i) * 9 * 6e4);
        const lines = [];
        const n = 1 + Math.floor(rnd() * 3);
        for (let k = 0; k < n; k++) {
          const it = st.menu[Math.floor(rnd() * st.menu.length)];
          if (lines.find(l => l.n === it.name)) continue;
          lines.push({ n: it.name, o: it.opts[0] || "", q: 1 + Math.floor(rnd() * 2), p: it.price });
        }
        const online = rnd() > .38;
        const kind = online ? (rnd() > .45 ? "توصيل" : "استلام") : (rnd() > .5 ? "محلي" : "سفري");
        const fee = kind === "توصيل" ? SET.zones[Math.floor(rnd() * 4)].fee : 0;
        const sub = lines.reduce((s, l) => s + l.q * l.p, 0);
        const pay = online ? (rnd() > .5 ? "كاش" : "تحويل بنكي") : (rnd() > .4 ? "شبكة" : "كاش");
        const key = String(t.getMonth() + 1).padStart(2, "0") + pad(t.getDate());
        st.seq[key] = (st.seq[key] || 0) + 1;
        let stt = "تم";
        if (back === 0 && i >= count - 4) stt = ["جديد", "يتجهز", "جاهز", "في الطريق"][i - (count - 4)];
        if (stt === "في الطريق" && kind !== "توصيل") stt = "جاهز";
        st.orders.push({
          no: key + "-" + pad(st.seq[key]).padStart(3, "0"), date: ymd(t), time: hm(t), name: names[Math.floor(rnd() * names.length)],
          phone: "05" + String(10000000 + Math.floor(rnd() * 89999999)), lines, items: lines.map(l => `${l.q} × ${l.n}${l.o ? " (" + l.o + ")" : ""}`).join("، "),
          total: sub + fee, pay, notes: rnd() > .8 ? "بدون بصل" : "", receipt: "", gift: "", kind,
          where: kind === "توصيل" ? SET.zones[Math.floor(rnd() * 4)].name + " - شارع " + (10 + Math.floor(rnd() * 40)) : "",
          geo: "", fee, status: stt, source: online ? "الرابط" : "الفرع · سعد"
        });
      }
      if (back > 0 || true) {
        STAFF.forEach((s, j) => {
          if (back === 0 && j === 2) return;
          const inT = 13 + j, out = back === 0 ? "" : pad((inT + 8 + Math.floor(rnd() * 2)) % 24) + ":" + pad(Math.floor(rnd() * 60));
          st.att.push({ date: ymd(day), name: s.name, in: pad(inT) + ":0" + Math.floor(rnd() * 9), out, hours: out ? 8 + Math.round(rnd() * 15) / 10 : 0 });
        });
      }
    }
    return st;
  }
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.menu) return s; } catch (e) {} const s = seed(); save(s); return s; }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  const state = () => load();

  function auth(pin, roles) {
    const u = STAFF.find(s => s.pin === String(pin || ""));
    if (!u) throw "bad_pin";
    if (roles && !roles.includes(u.role)) throw "not_allowed";
    return u;
  }
  function publicMenu(st) {
    const cats = [];
    st.menu.forEach(it => {
      const s = status(it); if (s === "مخفي") return;
      let c = cats.find(x => x.cat === it.cat); if (!c) cats.push(c = { cat: it.cat, items: [] });
      c.items.push({ name: it.name, desc: it.desc, price: it.price, opts: it.opts, status: s, left: s === "ينتهي قريباً" ? it.qty : null });
    });
    return cats;
  }
  function stamps(st, phone) {
    if (/5$/.test(phone) && !st.orders.some(o => o.phone === phone)) return 5;
    let n = /5$/.test(phone) ? 5 : 3;
    st.orders.forEach(o => { if (o.phone !== phone || o.status === "ملغي") return; n = o.gift ? 0 : n + 1; });
    return n;
  }
  function nextNo(st) {
    const d = new Date(), key = pad(d.getMonth() + 1) + pad(d.getDate());
    st.seq[key] = (st.seq[key] || 0) + 1;
    return key + "-" + String(st.seq[key]).padStart(3, "0");
  }

  function createOrder(st, d, branch, u) {
    const online = !branch;
    if (online && !st.open) return { ok: false, error: "closed", msg: SET.closedMsg };
    const pay = String(d.pay || "").indexOf("كاش") === 0 ? "كاش" : String(d.pay || "").indexOf("تحويل") === 0 ? "تحويل بنكي" : "شبكة";
    let kind, where = String(d.where || ""), fee = 0;
    if (online) {
      kind = d.kind === "توصيل" ? "توصيل" : "استلام";
      if (kind === "توصيل") { const z = SET.zones.find(z => z.name === d.zone); if (!z) return { ok: false, error: "bad_zone" }; fee = z.fee; where = z.name + " - " + where; }
      else where = "";
    } else kind = d.kind === "سفري" ? "سفري" : "محلي";
    const need = {}, lines = [];
    for (const l of d.lines || []) {
      const it = find(st, l.name); const s = it && status(it);
      if (!it || s === "مخفي") return { ok: false, error: "item_unavailable", item: l.name };
      if (s === "منتهي") return { ok: false, error: "out_of_stock", item: it.name };
      need[it.name] = (need[it.name] || 0) + l.qty;
      if (it.qty !== null && need[it.name] > it.qty) return { ok: false, error: "out_of_stock", item: it.name, left: it.qty };
      const opt = it.opts.length ? (it.opts.includes(l.opt) ? l.opt : it.opts[0]) : "";
      lines.push({ n: it.name, o: opt, q: l.qty, p: it.price });
    }
    if (!lines.length) return { ok: false, error: "invalid_order" };
    const sub = lines.reduce((s, l) => s + l.q * l.p, 0);
    if (online && kind === "توصيل" && sub < SET.deliveryMin) return { ok: false, error: "min_order", min: SET.deliveryMin };
    let gift = "", stampsAfter = 0;
    const phone = String(d.phone || "");
    if (phone) {
      const prev = stamps(st, phone);
      if (prev >= SET.every) { const fi = find(st, SET.gift); gift = fi.name; lines.push({ n: fi.name, o: "", q: 1, p: 0 }); need[fi.name] = (need[fi.name] || 0) + 1; }
      stampsAfter = gift ? 0 : prev + 1;
    }
    Object.keys(need).forEach(n => { const it = find(st, n); if (it.qty !== null) it.qty = Math.max(0, it.qty - need[n]); });
    const now = new Date(), no = nextNo(st);
    const o = { no, date: ymd(now), time: hm(now), name: d.name || (branch ? "زبون الفرع" : ""), phone, lines,
      items: lines.map(l => `${l.q} × ${l.n}${l.o ? " (" + l.o + ")" : ""}${l.p === 0 ? " 🎁" : ""}`).join("، "),
      total: sub + fee, pay, notes: d.notes || "", receipt: d.receipt ? "(إيصال مرفق)" : "", gift, kind, where, geo: d.geo || "", fee,
      status: branch ? "يتجهز" : "جديد", source: branch ? "الفرع · " + u.name : "الرابط" };
    st.orders.push(o);
    const wa = `طلب جديد ${no}\n` + lines.map(l => `• ${l.q} × ${l.n}${l.o ? " (" + l.o + ")" : ""}${l.p === 0 ? " 🎁 مجانية" : ""}`).join("\n") +
      `\nنوع الطلب: ${kind}${where ? " - " + where : ""}${o.geo ? "\n📍 " + o.geo : ""}` + (fee ? `\nرسوم التوصيل: ${fee} ريال` : "") +
      `\nالإجمالي: ${o.total} ريال\nالدفع: ${pay}\nالاسم: ${o.name}\nالجوال: ${phone}` + (o.notes ? `\nملاحظات: ${o.notes}` : "") +
      (d.receipt ? "\nالإيصال: (صورة الإيصال توصل مع الرسالة)" : "");
    if (online) window.__demoWa = wa;
    return { ok: true, no, total: o.total, gift, stamps: stampsAfter, every: SET.every, kind };
  }

  function report(st) {
    const now = new Date(), today = ymd(now), month = today.slice(0, 7), since = ymd(new Date(now - 13 * 864e5));
    const blank = () => ({ total: 0, count: 0, cash: 0, transfer: 0, card: 0, online: 0, branch: 0, delivery: 0 });
    const T = blank(), M = blank(), days = {}, items = {}, hours = {};
    st.orders.forEach(o => {
      if (o.status === "ملغي") return;
      const add = x => { x.total += o.total; x.count++; if (o.pay === "كاش") x.cash += o.total; else if (o.pay.indexOf("تحويل") === 0) x.transfer += o.total; else x.card += o.total;
        if (o.source.indexOf("الفرع") === 0) x.branch += o.total; else x.online += o.total; x.delivery += o.fee; };
      if (o.date >= since) { const d = days[o.date] || (days[o.date] = { date: o.date, total: 0, count: 0 }); d.total += o.total; d.count++; }
      if (o.date.slice(0, 7) !== month) return;
      add(M);
      if (o.date === today) { add(T); const h = o.time.slice(0, 2); hours[h] = (hours[h] || 0) + 1; }
      o.lines.forEach(l => { const it = items[l.n] || (items[l.n] = { name: l.n, qty: 0, revenue: 0 }); it.qty += l.q; it.revenue += l.q * l.p; });
    });
    return { ok: true, today: T, month: M, days: Object.values(days).sort((a, b) => a.date < b.date ? -1 : 1),
      top: Object.values(items).sort((a, b) => b.qty - a.qty).slice(0, 10), hours,
      stock: st.menu.filter(it => it.qty !== null || status(it) !== "متوفر").map(it => ({ name: it.name, qty: it.qty, status: status(it) })),
      menu: st.menu.map(it => ({ name: it.name, cat: it.cat, price: it.price, qty: it.qty, status: status(it) })), open: st.open, openNow: st.open };
  }

  function attend(st, u) {
    const now = new Date();
    const openRec = [...st.att].reverse().find(r => r.name === u.name && !r.out);
    if (openRec) { openRec.out = hm(now); const [h, m] = openRec.in.split(":").map(Number); let hrs = (now.getHours() * 60 + now.getMinutes() - h * 60 - m) / 60; if (hrs < 0) hrs += 24; openRec.hours = Math.round(hrs * 100) / 100;
      return { ok: true, name: u.name, type: "انصراف", time: openRec.out, hours: Math.round(hrs * 10) / 10 }; }
    st.att.push({ date: ymd(now), name: u.name, in: hm(now), out: "", hours: 0 });
    return { ok: true, name: u.name, type: "حضور", time: hm(now) };
  }
  function attendance(st, month) {
    month = month || ymd(new Date()).slice(0, 7);
    const recs = st.att.filter(r => r.date.slice(0, 7) === month), per = {};
    recs.forEach(r => { const p = per[r.name] || (per[r.name] = { name: r.name, days: {}, hours: 0 }); p.days[r.date] = 1; p.hours += r.hours; });
    return { ok: true, month, records: [...recs].reverse(), staff: Object.values(per).map(p => ({ name: p.name, days: Object.keys(p.days).length, hours: Math.round(p.hours * 10) / 10 })),
      onShift: st.att.filter(r => !r.out).map(r => r.name) };
  }

  function handle(qs, body) {
    return new Promise(res => setTimeout(res, 350)).then(() => {
      const st = state();
      try {
        const p = new URLSearchParams(qs || "");
        if (!body) {
          if (p.get("track")) { const o = st.orders.find(o => o.no === p.get("track") && o.phone.slice(-4) === p.get("k"));
            return o ? { ok: true, no: o.no, status: o.status, kind: o.kind, time: o.time, items: o.items, total: o.total } : { ok: false, error: "not_found" }; }
          if (p.get("phone")) { const n = stamps(st, p.get("phone")); return { ok: true, stamps: Math.min(n, SET.every), every: SET.every, due: n >= SET.every, freeItem: SET.gift }; }
          return { ok: true, menu: publicMenu(st), settings: Object.assign({}, SET, { open: st.open }) };
        }
        const a = body.action || "order";
        let r;
        if (a === "order") r = createOrder(st, body, false);
        else if (a === "login") { const u = auth(body.pin); r = { ok: true, name: u.name, role: u.role }; }
        else if (a === "orders") { auth(body.pin); const today = ymd(new Date());
          r = { ok: true, orders: st.orders.filter(o => o.date === today || (o.status !== "تم" && o.status !== "ملغي")).slice().reverse() }; }
        else if (a === "status") { const u = auth(body.pin); const o = st.orders.find(o => o.no === body.no);
          r = !o ? { ok: false, error: "not_found" } : (body.status === "ملغي" && u.role === "مطبخ") ? { ok: false, error: "not_allowed" } : (o.status = body.status, { ok: true }); }
        else if (a === "pos") { const u = auth(body.pin, ["مدير", "كاشير"]); r = createOrder(st, body, true, u); }
        else if (a === "attend") r = attend(st, auth(body.pin));
        else if (a === "attendance") { auth(body.pin, ["مدير"]); r = attendance(st, body.month); }
        else if (a === "report") { auth(body.pin, ["مدير"]); r = report(st); }
        else if (a === "stock") { auth(body.pin, ["مدير"]); const it = find(st, body.name);
          if (it) { if (body.qty !== undefined && body.qty !== null) it.qty = body.qty === "" ? null : Math.max(0, Math.floor(Number(body.qty)) || 0); if (body.status) it.status = body.status; }
          r = { ok: !!it }; }
        else if (a === "toggleOpen") { auth(body.pin, ["مدير"]); st.open = !!body.open; r = { ok: true, open: st.open }; }
        else r = { ok: false, error: "unknown_action" };
        save(st);
        return r;
      } catch (e) { return { ok: false, error: String(e) }; }
    });
  }
  window.DemoServer = { handle, reset: () => save(seed()) };
})();
