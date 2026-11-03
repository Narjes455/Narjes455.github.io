/* ============ آراء العملاء ============
   الزائر يكتب رأيه ← يروح لقائمة الانتظار (reviews_pending)
   نرجس توافق من صفحة /reviews-admin/ ← ينتقل للآراء المنشورة (reviews)
   قاعدة البيانات: نفس مشروع Firebase حق سَمرة */
window.REVIEWS_FIREBASE = window.REVIEWS_FIREBASE || {
  apiKey: "AIzaSyCUwlu7RRaewC-SHPOVrYwAxE1TkYvlskI",
  authDomain: "samra-b4ccc.firebaseapp.com",
  databaseURL: "https://samra-b4ccc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "samra-b4ccc",
  storageBucket: "samra-b4ccc.firebasestorage.app",
  messagingSenderId: "680912932157",
  appId: "1:680912932157:web:23e5fb315db8dfa66dc954"
};

(function () {
  const COLORS = ["#FFE2F0", "#ECE5FF", "#DDF9EE", "#E0F2FF", "#FFF6CC", "#FFEBD9"];
  const $ = s => document.querySelector(s);
  const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const box = $("#revs");
  if (!box) return;

  let db = null;
  function init() {
    if (db) return db;
    if (typeof firebase === "undefined") return null;
    if (!firebase.apps.length) firebase.initializeApp(window.REVIEWS_FIREBASE);
    db = firebase.database();
    return db;
  }
  async function signIn() {
    const a = firebase.auth();
    if (a.currentUser) return a.currentUser;
    const u = await new Promise(r => { const un = a.onAuthStateChanged(x => { un(); r(x); }); });
    return u || (await a.signInAnonymously()).user;
  }

  function card(r, i) {
    const d = r.t ? new Date(r.t).toLocaleDateString("ar-SA-u-ca-gregory", { year: "numeric", month: "long" }) : "";
    return `<div class="rvw" style="--c:${COLORS[i % COLORS.length]}">
      <p>${esc(r.text)}</p>
      <div class="who"><span class="av">${esc((r.name || "؟").trim().slice(0, 1))}</span>
        <div><b>${esc(r.name)}</b><small>${esc(r.work || "")}${r.work && d ? " · " : ""}${esc(d)}</small></div></div>
    </div>`;
  }
  const empty = msg => `<div class="revempty">${msg}</div>`;

  function load() {
    if (!init()) { box.innerHTML = empty("تعذّر تحميل الآراء الحين 🙏"); return; }
    db.ref("reviews").on("value", snap => {
      const list = [];
      snap.forEach(c => { list.push(c.val()); });
      list.sort((a, b) => (b.t || 0) - (a.t || 0));
      box.innerHTML = list.length ? list.map(card).join("") : empty("لسّا ما فيه آراء… اشتغلنا سوا؟ كن أول واحد يكتب 💜");
      if (typeof io !== "undefined") box.querySelectorAll(".rvw").forEach(el => { el.classList.add("rv"); io.observe(el); });
    }, () => { box.innerHTML = empty("تعذّر تحميل الآراء الحين 🙏"); });
  }

  /* ---------- النموذج ---------- */
  const modal = $("#rmodal"), form = $("#rform"), msg = $("#rmsg"), send = $("#rsend");
  const open = () => { modal.classList.add("on"); msg.textContent = ""; setTimeout(() => $("#rname").focus(), 50); };
  const close = () => modal.classList.remove("on");
  $("#rbtn").onclick = open;
  $("#rclose").onclick = close;
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  $("#rtext").addEventListener("input", e => { $("#rcnt").textContent = e.target.value.length; });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#rname").value.trim(), work = $("#rwork").value.trim(), text = $("#rtext").value.trim();
    if ($("#rhp").value) return; // فخ للبوتات
    if (!name) { msg.textContent = "اكتب اسمك 🙂"; $("#rname").focus(); return; }
    if (text.length < 3) { msg.textContent = "اكتب رأيك 🙂"; $("#rtext").focus(); return; }
    if (!init()) { msg.textContent = "صار خطأ في الاتصال، جرّب بعدين"; return; }
    send.disabled = true; msg.textContent = "جاري الإرسال…";
    try {
      const u = await signIn();
      const data = { uid: u.uid, name: name.slice(0, 40), text: text.slice(0, 500), t: firebase.database.ServerValue.TIMESTAMP };
      if (work) data.work = work.slice(0, 60);
      await db.ref("reviews_pending/" + u.uid).set(data);
      form.reset(); $("#rcnt").textContent = "0";
      msg.textContent = "وصل رأيك، شكراً لك 💜 بيظهر هنا بعد ما أراجعه";
      if (typeof burst === "function") burst(innerWidth / 2, innerHeight / 2, 120);
      setTimeout(close, 2600);
    } catch (err) {
      console.warn(err);
      msg.textContent = "ما قدرت أرسل رأيك الحين، جرّب بعد شوي 🙏";
    } finally { send.disabled = false; }
  });

  // نحمّل الآراء لما يقرب الزائر من القسم
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); load(); } }, { rootMargin: "400px" }).observe($("#reviews"));
})();
