/* Protein Saathi — all data is kept in this phone's local storage. No network requests are made. */
"use strict";

const APP_NAME = "Protein Saathi";
const APP_VERSION = "1.1.0";
const STORE_KEY = "proteinSaathi.v1";

/* ---------------- Food reference (approximate protein per portion) ---------------- */
const FOODS = [
  { id: "paneer_lf", name: "Low-fat paneer", portion: "50 g", p: 11, t: "veg" },
  { id: "paneer", name: "Paneer (regular)", portion: "50 g", p: 9, t: "veg" },
  { id: "soya", name: "Soya chunks (dry weight)", portion: "25 g", p: 13, t: "veg" },
  { id: "moong_chilla", name: "Moong dal chilla", portion: "1 chilla (25 g dry dal)", p: 6, t: "veg" },
  { id: "besan_chilla", name: "Besan chilla", portion: "1 chilla (20 g besan)", p: 4.5, t: "veg" },
  { id: "dal", name: "Dal, thick", portion: "1 katori cooked (40 g dry)", p: 9, t: "veg" },
  { id: "rajma", name: "Rajma / chhole", portion: "1 katori cooked", p: 12, t: "veg" },
  { id: "sprouts", name: "Moong sprouts, steamed", portion: "1 bowl (50 g dry)", p: 12, t: "veg" },
  { id: "roti", name: "Whole-wheat roti", portion: "1 small (25 g atta)", p: 3, t: "veg" },
  { id: "rice", name: "Rice, cooked", portion: "1 katori", p: 4, t: "veg" },
  { id: "milk", name: "Toned milk", portion: "1 glass (250 ml)", p: 8, t: "veg" },
  { id: "curd", name: "Curd, plain", portion: "1 katori (100 g)", p: 3.5, t: "veg" },
  { id: "chana", name: "Roasted chana", portion: "30 g", p: 6, t: "veg" },
  { id: "peanuts", name: "Peanuts, roasted", portion: "30 g", p: 8, t: "veg" },
  { id: "tofu", name: "Tofu (firm)", portion: "100 g", p: 12, t: "veg" },
  { id: "idli", name: "Idli", portion: "2 pieces", p: 4, t: "veg" },
  { id: "whey", name: "Whey protein", portion: "1 serving (check label)", p: 24, t: "veg" },
  { id: "egg", name: "Whole egg", portion: "1 large", p: 6, t: "egg" },
  { id: "egg_white", name: "Egg white", portion: "1 white", p: 3.5, t: "egg" },
  { id: "chicken", name: "Chicken breast, cooked", portion: "100 g", p: 30, t: "nonveg" },
  { id: "fish", name: "Fish, cooked", portion: "100 g", p: 22, t: "nonveg" },
  { id: "mutton", name: "Mutton, cooked", portion: "100 g", p: 25, t: "nonveg" },
  { id: "prawns", name: "Prawns, cooked", portion: "100 g", p: 24, t: "nonveg" }
];

const SLOTS = [
  { id: "morning", label: "Morning", ico: "🌅", hint: "Breakfast" },
  { id: "afternoon", label: "Afternoon", ico: "☀️", hint: "Lunch" },
  { id: "evening", label: "Evening", ico: "🌙", hint: "Dinner" },
  { id: "snack", label: "Snacks", ico: "🥜", hint: "Anytime" }
];

const ACT = {
  sed: "Mostly sitting, little exercise",
  light: "Walking or yoga most days",
  str2: "Strength training 2–3 days a week",
  str4: "Strength training 4+ days a week"
};
const GOAL = {
  keep: "Stay healthy, keep current muscle",
  build: "Build muscle and strength",
  lose: "Lose fat, keep muscle",
  recover: "Recover strength after illness or weakness"
};
const DIET = { mixed: "Regular dal, milk/curd, paneer etc.", cereal: "Mostly rice or roti, little dal or dairy" };
const PREG = {
  none: "Neither", t2: "Pregnant, 2nd trimester", t3: "Pregnant, 3rd trimester",
  l1: "Breastfeeding, baby 0–6 months", l2: "Breastfeeding, baby 6–12 months"
};
const PREF = { veg: "Vegetarian", egg: "Eggetarian", nonveg: "Non-vegetarian" };

const DISCLAIMER_TEXT = [
  "The calculations in this app are only indicative estimates. They are not medical or dietary advice.",
  "Please take any decision about your diet, supplements or exercise in consultation with an authorised nutritionist and your doctor.",
  "The purpose of this app is awareness only."
];

/* ---------------- Storage (on this device only) ---------------- */
function blankState() {
  return { v: 1, accepted: false, acceptedAt: null, profile: null, logs: {}, recent: [] };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s === "object") return Object.assign(blankState(), s);
    }
  } catch (e) { /* storage unavailable */ }
  return blankState();
}
let state = loadState();
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    toast("Could not save. Your phone storage may be full.");
    return false;
  }
}

/* ---------------- Helpers ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const r1 = n => Math.round(n * 10) / 10;
const fmtG = n => (Math.round(n * 10) / 10).toString().replace(/\.0$/, "");
function dkey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function fromKey(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(k, n) { const d = fromKey(k); d.setDate(d.getDate() + n); return dkey(d); }
const todayKey = () => dkey(new Date());
function niceDate(k) {
  const d = fromKey(k), t = todayKey();
  const label = k === t ? "Today" : k === addDays(t, -1) ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "long" });
  return { label, sub: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) };
}
let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function foodsFor(pref) {
  return FOODS.filter(f => f.t === "veg" || (pref !== "veg" && f.t === "egg") || (pref === "nonveg" && f.t === "nonveg"));
}

/* ---------------- Calculator ---------------- */
function compute(p) {
  const female = p.sex === "f";
  const age = +p.age, wt = +p.wt, ht = +p.ht / 100;
  const bmi = wt / (ht * ht);
  const capBMI = age >= 70 ? 27 : 25;
  const capped = bmi > capBMI;
  const ref = capped ? capBMI * ht * ht : wt;
  const older = age >= 65;

  let lo, hi;
  if (p.act === "sed") [lo, hi] = older ? [1.0, 1.2] : [0.83, 1.0];
  else if (p.act === "light") [lo, hi] = [1.0, 1.2];
  else if (p.act === "str2") [lo, hi] = [1.2, 1.6];
  else [lo, hi] = [1.6, 2.0];
  if (older && lo < 1.0) lo = 1.0;
  if (p.goal === "build" || p.goal === "lose") { lo = Math.max(lo, 1.2); hi = Math.max(hi, 1.6); }
  if (p.goal === "recover") { lo = Math.max(lo, 1.2); hi = Math.max(hi, 1.5); }
  if (p.diet === "cereal") lo = Math.max(lo, 1.0);
  if (hi < lo) hi = lo;
  if (p.ckd) { lo = hi = 0.8; }

  const add = female ? ({ none: 0, t2: 9.5, t3: 22, l1: 16.9, l2: 13.2 }[p.preg] || 0) : 0;
  const gLo = Math.round(ref * lo + add), gHi = Math.round(ref * hi + add);
  const mid = Math.round((gLo + gHi) / 2 / 5) * 5;
  const target = p.ckd ? gLo : Math.min(gHi, Math.max(gLo, mid));
  const perMeal = Math.round(target / 3);
  const minMeal = Math.max(20, Math.round(0.25 * ref));
  const bmiCat = bmi < 18.5 ? "Underweight" : bmi <= 23 ? "Normal" : bmi <= 25 ? "Overweight" : "Obese";

  const alerts = [];
  if (p.ckd) alerts.push(["danger", "Kidney disease: guidelines (KDIGO 2024) suggest about 0.8 g per kg a day and not more than 1.3 g per kg. Follow your nephrologist's figure over this estimate, and avoid protein powders unless they approve."]);
  else if (hi >= 1.6) alerts.push(["warn", "Before staying at the upper end of this range for long, get a kidney function test (creatinine / eGFR) and discuss it with your doctor."]);
  if (p.goal === "build" && p.act === "sed") alerts.push(["warn", "Protein alone does not build muscle. The higher range helps only alongside strength training."]);
  if (p.goal === "recover") alerts.push(["warn", "For recovery after illness, 1.2–1.5 g per kg is suggested for older adults (PROT-AGE). Please confirm with your doctor first."]);
  if (add) alerts.push(["warn", `Includes ICMR's extra ${add} g a day for pregnancy or breastfeeding.`]);

  const strOK = p.act === "str2" || p.act === "str4";
  const exercise = [
    ["Strength", "2–3 days a week", "Work legs, back, chest, shoulders, arms and core. Bands, dumbbells, machines or bodyweight all count. Increase weight or reps gradually.", strOK ? "Doing it" : "Add this"],
    ["Aerobic", "150–300 min a week", "Moderate activity such as brisk walking 30–45 minutes on 5 days, or 75–150 minutes of vigorous activity.", p.act === "sed" ? "Add this" : "Likely met"]
  ];
  if (older || p.bal) exercise.push(["Balance", "3+ days a week", "Sit-to-stand, heel-to-toe walking, single-leg stands near a wall or chair, or tai chi. Start with support.", "Add this"]);
  exercise.push(["Daily", "Sit less", "Stand up and move for a few minutes every 30–60 minutes.", ""]);

  return { target, gLo, gHi, lo, hi, add, ref, capped, capBMI, bmi, bmiCat, older, perMeal, minMeal, alerts, exercise, gpk: (target - add) / ref };
}

function currentTarget() { return state.profile ? compute(state.profile).target : 0; }
function dayLog(k) { return state.logs[k] || null; }
function dayTotal(k) { const d = dayLog(k); return d ? d.items.reduce((s, i) => s + i.total, 0) : 0; }
function dayTarget(k) { const d = dayLog(k); return d && d.target ? d.target : currentTarget(); }

/* ---------------- Routing ---------------- */
let ui = { tab: "today", day: todayKey(), histMonth: null, sheet: null, confirmDelete: false };

function render() {
  const app = $("#app");
  if (!state.accepted) { app.innerHTML = gateView(); bindGate(); return; }
  if (!state.profile) { app.innerHTML = onboardView(); bindProfileForm("onboard"); return; }
  const views = { today: todayView, history: historyView, plan: planView, profile: profileView };
  app.innerHTML = views[ui.tab]() + navView();
  if (ui.tab === "profile") bindProfileForm("profile");
  window.scrollTo(0, 0);
}

/* ---------------- Disclaimer gate ---------------- */
function gateView() {
  return `<main class="page nonav gate">
    <div class="gate-hero">
      <img class="logo" src="icon-192.png" alt="">
      <h1>Welcome to ${APP_NAME}</h1>
      <p>Know how much protein you need each day, and keep a simple record of what you eat.</p>
      <div class="feature-chips"><span>🎯 Daily target</span><span>📝 Meal log</span><span>🔒 Private</span></div>
    </div>
    <section class="disclaimer" aria-labelledby="dtitle">
      <h2 id="dtitle">Important: please read</h2>
      ${DISCLAIMER_TEXT.map(t => `<p>${t}</p>`).join("")}
    </section>
    <section class="card">
      <h3>Your privacy</h3>
      <ul class="tidy small">
        <li>Everything you enter stays only on this phone.</li>
        <li>No account, no sign-in, and nothing is uploaded to any server.</li>
        <li>You can delete everything anytime from the Profile tab. Uninstalling the app or clearing its storage may also remove your records.</li>
      </ul>
    </section>
    <label class="check"><input type="checkbox" id="agree"> I have read and understood that this app gives only estimates for awareness, and that I should consult a nutritionist and my doctor before making decisions.</label>
    <button class="btn block" id="agreeBtn" disabled>I agree, continue</button>
    <p class="note">You can read this notice again anytime from the Profile tab.</p>
  </main>`;
}
function bindGate() {
  const cb = $("#agree"), btn = $("#agreeBtn");
  cb.addEventListener("change", () => { btn.disabled = !cb.checked; });
  btn.addEventListener("click", () => {
    if (!cb.checked) return;
    state.accepted = true;
    state.acceptedAt = new Date().toISOString();
    save();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    render();
  });
}

/* ---------------- Profile form (onboarding + profile tab) ---------------- */
function profileFields(p) {
  p = p || { sex: "", age: "", wt: "", ht: "", act: "light", goal: "keep", diet: "mixed", pref: "veg", preg: "none", ckd: false, bal: false };
  const opt = (obj, sel) => Object.entries(obj).map(([v, l]) => `<option value="${v}"${v === sel ? " selected" : ""}>${l}</option>`).join("");
  const radio = (name, obj, sel) => Object.entries(obj).map(([v, l]) =>
    `<input type="radio" name="${name}" id="${name}_${v}" value="${v}"${v === sel ? " checked" : ""}><label for="${name}_${v}">${l}</label>`).join("");
  return `
    <div class="field"><span class="lbl" id="sexL">Sex</span>
      <div class="seg" role="radiogroup" aria-labelledby="sexL">${radio("sex", { m: "Male", f: "Female" }, p.sex)}</div></div>
    <div class="three">
      <div class="field"><label for="age">Age</label><input type="number" id="age" name="age" inputmode="numeric" min="18" max="100" placeholder="years" value="${esc(p.age)}"></div>
      <div class="field"><label for="wt">Weight</label><input type="number" id="wt" name="wt" inputmode="decimal" min="30" max="250" step="0.5" placeholder="kg" value="${esc(p.wt)}"></div>
      <div class="field"><label for="ht">Height</label><input type="number" id="ht" name="ht" inputmode="numeric" min="120" max="220" placeholder="cm" value="${esc(p.ht)}"></div>
    </div>
    <p class="hint">5 ft = 152 cm · 5 ft 6 in = 168 cm · 6 ft = 183 cm</p>
    <div class="field"><span class="lbl" id="prefL">Food preference</span>
      <div class="seg" role="radiogroup" aria-labelledby="prefL">${radio("pref", { veg: "Veg", egg: "Egg", nonveg: "Non-veg" }, p.pref)}</div></div>
    <div class="field"><label for="act">Current activity</label><select id="act" name="act">${opt(ACT, p.act)}</select></div>
    <div class="field"><label for="goal">Main goal</label><select id="goal" name="goal">${opt(GOAL, p.goal)}</select></div>
    <div class="field"><label for="diet">Usual diet</label><select id="diet" name="diet">${opt(DIET, p.diet)}</select>
      <span class="hint">ICMR advises more protein when it comes mainly from cereals.</span></div>
    <div class="field" id="pregBox"${p.sex === "f" ? "" : " hidden"}><label for="preg">Pregnancy or breastfeeding</label><select id="preg" name="preg">${opt(PREG, p.preg)}</select></div>
    <div class="field"><span class="lbl">Health factors</span>
      <label class="check" style="font-weight:500"><input type="checkbox" name="ckd"${p.ckd ? " checked" : ""}> Kidney disease, or a doctor has told me to limit protein</label>
      <label class="check" style="font-weight:500"><input type="checkbox" name="bal"${p.bal ? " checked" : ""}> Balance problems, dizziness or a recent fall</label>
    </div>
    <p class="err" id="formErr" hidden></p>`;
}
function onboardView() {
  return `<main class="page nonav">
    <div><h1>About you</h1><p class="muted" style="margin-top:6px">This sets your estimated daily protein target. You can change it later.</p></div>
    <form class="card form" id="pform" novalidate>${profileFields(null)}
      <button class="btn block" type="submit">Calculate my target</button>
    </form>
    <p class="note">${DISCLAIMER_TEXT[0]}</p>
  </main>`;
}
function readProfile(form) {
  const fd = new FormData(form);
  return {
    sex: fd.get("sex") || "", age: fd.get("age"), wt: fd.get("wt"), ht: fd.get("ht"),
    act: fd.get("act"), goal: fd.get("goal"), diet: fd.get("diet"), pref: fd.get("pref") || "veg",
    preg: fd.get("sex") === "f" ? fd.get("preg") : "none", ckd: fd.get("ckd") === "on", bal: fd.get("bal") === "on"
  };
}
function validate(p) {
  if (!p.sex) return "Please choose male or female.";
  if (!(+p.age >= 18 && +p.age <= 100)) return "Please enter an age between 18 and 100. This app is for adults.";
  if (!(+p.wt >= 30 && +p.wt <= 250)) return "Please enter a weight between 30 and 250 kg.";
  if (!(+p.ht >= 120 && +p.ht <= 220)) return "Please enter a height between 120 and 220 cm.";
  return "";
}
function bindProfileForm(mode) {
  const form = $("#pform");
  if (!form) return;
  form.addEventListener("change", e => {
    if (e.target.name === "sex") $("#pregBox").hidden = e.target.value !== "f";
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const p = readProfile(form);
    const err = validate(p);
    const errEl = $("#formErr");
    if (err) { errEl.textContent = err; errEl.hidden = false; errEl.scrollIntoView({ block: "center" }); return; }
    p.age = +p.age; p.wt = +p.wt; p.ht = +p.ht;
    state.profile = p;
    const t = todayKey();
    if (state.logs[t]) state.logs[t].target = compute(p).target;
    save();
    if (mode === "onboard") { ui.tab = "plan"; toast("Your target is ready"); }
    else toast("Profile saved");
    render();
  });
}

/* ---------------- Today ---------------- */
function ringSVG(pct) {
  const r = 58, c = 2 * Math.PI * r, off = c * (1 - Math.min(pct, 1));
  return `<svg viewBox="0 0 140 140" aria-hidden="true">
    <circle cx="70" cy="70" r="${r}" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="13"/>
    <circle class="fg" cx="70" cy="70" r="${r}" fill="none" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
  </svg>`;
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
function todayView() {
  const k = ui.day, t = todayKey();
  const total = dayTotal(k), target = dayTarget(k);
  const pct = target ? total / target : 0;
  const left = Math.max(0, target - total);
  const nd = niceDate(k);
  const log = dayLog(k);
  const res = compute(state.profile);
  const slots = SLOTS.map(s => {
    const items = log ? log.items.filter(i => i.slot === s.id) : [];
    const sum = items.reduce((a, i) => a + i.total, 0);
    return `<section class="slot slot-${s.id}">
      <div class="slot-row">
        <span class="slot-ico" aria-hidden="true">${s.ico}</span>
        <div class="grow"><div class="slot-name">${s.label}</div>
          <div class="slot-sub">${items.length ? `<b class="num">${fmtG(sum)} g</b> · ${items.length} item${items.length > 1 ? "s" : ""}` : s.hint + " · tap + to add"}</div></div>
        <button class="add-btn" data-action="open-add" data-slot="${s.id}" aria-label="Add food to ${s.label}">+</button>
      </div>
      ${items.length ? `<ul class="items">${items.map(i => `<li>
          <div class="grow"><div class="nm">${esc(i.name)}${i.qty !== 1 ? ` <span class="x">× ${fmtG(i.qty)}</span>` : ""}</div>${i.portion ? `<div class="pt">${esc(i.portion)}</div>` : ""}</div>
          <span class="g num">${fmtG(i.total)} g</span>
          <button class="del" data-action="del-item" data-id="${i.id}" aria-label="Remove ${esc(i.name)}">✕</button></li>`).join("")}</ul>` : ""}
    </section>`;
  }).join("");
  return `<main class="page today">
    <section class="hero-today">
      <div class="hello"><span>${k === t ? greeting() : "Viewing a past day"}</span><span class="brand-tag">${APP_NAME}</span></div>
      <div class="datebar">
        <button class="round-btn" data-action="day" data-n="-1" aria-label="Previous day">‹</button>
        <div class="d">${nd.label}<small>${nd.sub}</small></div>
        <button class="round-btn" data-action="day" data-n="1" aria-label="Next day"${k >= t ? " disabled" : ""}>›</button>
      </div>
      <div class="ring-wrap">
        <div class="ring">${ringSVG(pct)}<div class="center"><span class="big num">${fmtG(total)}</span><span class="of">of ${target} g</span></div></div>
        <div class="ring-side">
          <div class="status">${pct >= 1 ? "🎉 Target reached!" : `${fmtG(left)} g to go`}</div>
          <div class="pctbar" aria-hidden="true"><i style="width:${Math.min(100, Math.round(pct * 100))}%"></i></div>
          <div class="hint">${Math.round(pct * 100)}% done · aim for about <b>${res.perMeal} g</b> per main meal</div>
        </div>
      </div>
      ${k !== t ? `<button class="btn light sm" data-action="go-today">Back to today</button>` : ""}
    </section>
    ${installPrompt && !ui.installDismissed ? `<section class="install-card">
      <img src="icon-192.png" alt="">
      <div class="grow"><b>Install Protein Saathi</b><div class="small muted">Open it like an app from your home screen, even offline.</div></div>
      <div class="install-actions"><button class="btn sm" data-action="install">Install</button><button class="link-btn" data-action="install-later">Later</button></div>
    </section>` : ""}
    <h2 class="section-title">Your meals</h2>
    ${slots}
    <p class="note">${DISCLAIMER_TEXT[0]} Consult a nutritionist and your doctor.</p>
  </main>`;
}

/* ---------------- Add food sheet ---------------- */
function openSheet(html) {
  $("#sheet").innerHTML = `<div class="grab" aria-hidden="true"></div>` + html;
  $("#sheetWrap").hidden = false;
  document.body.style.overflow = "hidden";
  if (!ui.sheet) { history.pushState({ sheet: 1 }, ""); }
  ui.sheet = true;
}
function closeSheet(fromPop) {
  if (!ui.sheet) return;
  $("#sheetWrap").hidden = true;
  document.body.style.overflow = "";
  ui.sheet = null;
  if (!fromPop) history.back();
}
window.addEventListener("popstate", () => { if (ui.sheet) closeSheet(true); });

let addCtx = { slot: "morning", q: "", food: null, qty: 1 };
function sheetList() {
  const pref = state.profile.pref || "veg";
  const q = addCtx.q.trim().toLowerCase();
  const list = foodsFor(pref).filter(f => !q || f.name.toLowerCase().includes(q));
  const recent = (state.recent || []).filter(r => !q || r.name.toLowerCase().includes(q)).slice(0, 5);
  const slotChips = SLOTS.map(s => `<button class="chip" data-action="pick-slot" data-slot="${s.id}" aria-pressed="${s.id === addCtx.slot}">${s.label}</button>`).join("");
  const row = (f, src) => `<li><button data-action="pick-food" data-src="${src}" data-id="${esc(f.id)}">
      <span class="grow"><span class="nm" style="font-weight:600;display:block">${esc(f.name)}</span><span class="tiny muted">${esc(f.portion)}</span></span>
      <span class="g num">${fmtG(f.p)} g</span></button></li>`;
  return `<div class="row between"><h2 id="sheetTitle">Add food</h2><button class="icon-btn" data-action="close-sheet" aria-label="Close">✕</button></div>
    <div class="chips" role="group" aria-label="Meal">${slotChips}</div>
    <input type="search" id="foodSearch" placeholder="Search foods" value="${esc(addCtx.q)}" aria-label="Search foods">
    <div class="scroll">
      ${recent.length ? `<h3 class="small muted">Recent</h3><ul class="foods">${recent.map(r => row(r, "recent")).join("")}</ul>` : ""}
      <h3 class="small muted">${PREF[pref]} foods</h3>
      <ul class="foods">${list.map(f => row(f, "food")).join("") || `<li class="empty">No match. Add it as your own item below.</li>`}</ul>
      <button class="btn ghost" data-action="custom">+ Add your own item</button>
    </div>`;
}
function sheetQty() {
  const f = addCtx.food;
  const total = r1(f.p * addCtx.qty);
  return `<div class="row between"><button class="icon-btn" data-action="back-list" aria-label="Back">‹</button><h2 id="sheetTitle" class="grow" style="text-align:center">${esc(f.name)}</h2><button class="icon-btn" data-action="close-sheet" aria-label="Close">✕</button></div>
    <p class="muted" style="text-align:center">${esc(f.portion)} = about ${fmtG(f.p)} g protein</p>
    <div class="chips" role="group" aria-label="Meal" style="justify-content:center">${SLOTS.map(s => `<button class="chip" data-action="pick-slot" data-slot="${s.id}" aria-pressed="${s.id === addCtx.slot}">${s.label}</button>`).join("")}</div>
    <div class="stepper">
      <button class="icon-btn" style="width:52px;height:52px" data-action="qty" data-n="-0.5" aria-label="Less">−</button>
      <div class="val num" aria-live="polite">${fmtG(addCtx.qty)}<div class="tiny muted" style="font-weight:600">portion${addCtx.qty === 1 ? "" : "s"}</div></div>
      <button class="icon-btn" style="width:52px;height:52px" data-action="qty" data-n="0.5" aria-label="More">+</button>
    </div>
    <div class="total-line"><span>Protein</span><span class="g num">${fmtG(total)} g</span></div>
    <button class="btn block" data-action="confirm-add">Add to ${SLOTS.find(s => s.id === addCtx.slot).label}</button>`;
}
function sheetCustom() {
  return `<div class="row between"><button class="icon-btn" data-action="back-list" aria-label="Back">‹</button><h2 id="sheetTitle" class="grow" style="text-align:center">Your own item</h2><button class="icon-btn" data-action="close-sheet" aria-label="Close">✕</button></div>
    <div class="field"><label for="cName">Food name</label><input type="text" id="cName" maxlength="40" placeholder="e.g. Protein atta roti"></div>
    <div class="two">
      <div class="field"><label for="cPortion">Portion</label><input type="text" id="cPortion" maxlength="30" placeholder="e.g. 2 rotis"></div>
      <div class="field"><label for="cProt">Protein (g)</label><input type="number" id="cProt" inputmode="decimal" min="0" max="200" step="0.5" placeholder="g"></div>
    </div>
    <p class="hint">Check the pack label for protein per serving.</p>
    <p class="err" id="cErr" hidden></p>
    <button class="btn block" data-action="confirm-custom">Add to ${SLOTS.find(s => s.id === addCtx.slot).label}</button>`;
}
function bindSearch() {
  const s = $("#foodSearch");
  if (!s) return;
  s.addEventListener("input", () => {
    addCtx.q = s.value;
    const pos = s.selectionStart;
    $("#sheet").innerHTML = `<div class="grab" aria-hidden="true"></div>` + sheetList();
    bindSearch();
    const n = $("#foodSearch"); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {}
  });
}
function showSheet(view) {
  const html = view === "qty" ? sheetQty() : view === "custom" ? sheetCustom() : sheetList();
  if (!ui.sheet) openSheet(html); else $("#sheet").innerHTML = `<div class="grab" aria-hidden="true"></div>` + html;
  addCtx.view = view;
  if (view === "list") bindSearch();
}
function addItem(item) {
  const k = ui.day;
  if (!state.logs[k]) state.logs[k] = { target: currentTarget(), items: [] };
  state.logs[k].items.push(item);
  const rec = { id: item.foodId || "c_" + item.name.toLowerCase(), name: item.name, portion: item.portion, p: item.p };
  state.recent = [rec].concat((state.recent || []).filter(r => r.id !== rec.id)).slice(0, 8);
  save();
  closeSheet();
  render();
  toast(`Added ${fmtG(item.total)} g`);
}

/* ---------------- History ---------------- */
function historyView() {
  const t = todayKey();
  const m = ui.histMonth || (ui.histMonth = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })());
  const y = m.getFullYear(), mo = m.getMonth();
  const days = new Date(y, mo + 1, 0).getDate();
  const startDow = new Date(y, mo, 1).getDay();
  let cells = ["S", "M", "T", "W", "T", "F", "S"].map(w => `<span class="wd">${w}</span>`).join("");
  for (let i = 0; i < startDow; i++) cells += `<span class="blank"></span>`;
  let metMonth = 0;
  for (let d = 1; d <= days; d++) {
    const k = dkey(new Date(y, mo, d));
    const tot = dayTotal(k), tg = dayTarget(k);
    let cls = "";
    if (tot > 0) { const p = tot / tg; cls = p >= 1 ? "met" : p >= 0.7 ? "near" : "part"; if (p >= 1) metMonth++; }
    const future = k > t;
    cells += `<button class="${cls}${k === t ? " today" : ""}" data-action="open-day" data-k="${k}"${future ? " disabled" : ""} aria-label="${d} ${m.toLocaleDateString("en-IN", { month: "long" })}${tot ? `, ${fmtG(tot)} grams` : ""}">${d}</button>`;
  }
  // last 7 days
  const last7 = [];
  for (let i = 6; i >= 0; i--) { const k = addDays(t, -i); last7.push({ k, tot: dayTotal(k), tg: dayTarget(k) }); }
  const logged = last7.filter(d => d.tot > 0);
  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.tot, 0) / logged.length) : 0;
  const maxV = Math.max(...last7.map(d => Math.max(d.tot, d.tg)), 1);
  const tgNow = currentTarget();
  const bars = last7.map(d => `<div class="b"><div class="track"><i class="${d.tot >= d.tg ? "" : "under"}" style="height:${(d.tot / maxV * 100).toFixed(1)}%"></i></div><span>${fromKey(d.k).toLocaleDateString("en-IN", { weekday: "narrow" })}</span></div>`).join("");
  // streak
  let streak = 0, k = t;
  if (dayTotal(k) < dayTarget(k)) k = addDays(k, -1);
  while (dayTotal(k) > 0 && dayTotal(k) >= dayTarget(k)) { streak++; k = addDays(k, -1); }
  const now = new Date(); const isCurMonth = y === now.getFullYear() && mo === now.getMonth();
  return `<main class="page">
    <h1 class="page-title">History</h1>
    <div class="stats">
      <div class="stat s1"><span class="k">7-day avg</span><span class="v num">${avg} g</span><span class="tiny muted">${logged.length} day${logged.length === 1 ? "" : "s"} logged</span></div>
      <div class="stat s2"><span class="k">🔥 Streak</span><span class="v num">${streak}</span><span class="tiny muted">days on target</span></div>
      <div class="stat s3"><span class="k">This month</span><span class="v num">${metMonth}</span><span class="tiny muted">days on target</span></div>
    </div>
    <section class="card">
      <div class="row between"><h2>Last 7 days</h2><span class="tiny muted">Target ${tgNow} g · amber = below</span></div>
      <div class="bars">${bars}</div>
    </section>
    <section class="card">
      <div class="row between">
        <button class="icon-btn" data-action="month" data-n="-1" aria-label="Previous month">‹</button>
        <h2>${m.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h2>
        <button class="icon-btn" data-action="month" data-n="1" aria-label="Next month"${isCurMonth ? " disabled" : ""}>›</button>
      </div>
      <div class="cal">${cells}</div>
      <div class="legend"><span><i style="background:var(--met)"></i>Target met</span><span><i style="background:var(--near)"></i>70–99%</span><span><i style="background:var(--part)"></i>Below 70%</span><span><i style="background:var(--none)"></i>No record</span></div>
      <p class="tiny muted">Tap a day to see or edit its record.</p>
    </section>
  </main>`;
}

/* ---------------- Plan ---------------- */
const SAMPLE = {
  veg: [["Breakfast", "Moong dal chilla + paneer", "3 chillas (75 g dry moong dal) + 100 g low-fat paneer", "~40 g"],
    ["Lunch", "Dal, roti and soya", "1 katori thick dal + 2 rotis + 35 g dry soya chunks as sabzi", "~33 g"],
    ["Evening", "Whey shake or paneer", "1 whey serving + 300 ml toned milk, or 100 g paneer + 250 ml milk", "~30–34 g"]],
  egg: [["Breakfast", "Egg bhurji with roti", "2 whole eggs + 3 egg whites + 2 rotis + 1 katori curd", "~32 g"],
    ["Lunch", "Dal, roti and paneer", "1 katori thick dal + 2 rotis + 75 g paneer", "~32 g"],
    ["Evening", "Moong chilla and milk", "3 chillas (75 g dry moong dal) + 2 egg whites + 250 ml milk", "~33 g"]],
  nonveg: [["Breakfast", "Egg bhurji with roti", "2 whole eggs + 3 egg whites + 2 rotis + 1 katori curd", "~32 g"],
    ["Lunch", "Chicken curry with roti", "100 g cooked chicken + 2 rotis + salad", "~36 g"],
    ["Evening", "Fish with dal", "120 g cooked fish + 1 katori thick dal", "~35 g"]]
};
function planView() {
  const p = state.profile, r = compute(p);
  const pref = p.pref || "veg";
  return `<main class="page">
    <h1 class="page-title">Your plan</h1>
    <section class="hero">
      <span class="small" style="opacity:.92">🎯 Your estimated daily protein target</span>
      <span class="big num">${r.target}<small>g / day</small></span>
      <span class="small num">${p.ckd ? "Doctor-guided limit" : `Suggested range ${r.gLo}–${r.gHi} g`}</span>
    </section>
    ${r.alerts.map(([k, t]) => `<div class="alert ${k}">${t}</div>`).join("")}
    <section class="card">
      <dl class="kv num">
        <dt>Per main meal (3 meals)</dt><dd>~${r.perMeal} g</dd>
        ${p.ckd ? "" : `<dt>Minimum per meal</dt><dd>${r.minMeal} g</dd>`}
        <dt>Grams per kg</dt><dd>${r.gpk.toFixed(2)}</dd>
        <dt>Weight used</dt><dd>${Math.round(r.ref)} kg</dd>
        <dt>BMI (Indian scale)</dt><dd>${r.bmi.toFixed(1)} · ${r.bmiCat}</dd>
      </dl>
      ${r.capped ? `<p class="tiny muted">Your BMI is above ${r.capBMI}, so protein is worked out on the weight you would have at BMI ${r.capBMI}. Extra body fat does not need extra protein.</p>` : ""}
    </section>
    <section class="card">
      <h2>💪 Weekly exercise</h2>
      <ul class="steps">${r.exercise.map(([tag, what, how, st]) => `<li><span class="tag">${tag}</span><div>
        <div style="font-weight:700">${what}${st ? ` <span class="pill${st === "Add this" ? " warn" : ""}">${st}</span>` : ""}</div>
        <div class="small muted">${how}</div></div></li>`).join("")}</ul>
      <p class="tiny muted">Based on WHO 2020 guidelines. Check with your doctor or physiotherapist before starting a new programme.</p>
    </section>
    <section class="card">
      <h2>🍽️ A sample ${PREF[pref].toLowerCase()} day</h2>
      <ul class="steps">${SAMPLE[pref].map(([t, what, how, g]) => `<li><span class="tag">${t}</span><div>
        <div style="font-weight:700">${what} <span class="pill">${g}</span></div><div class="small muted">${how}</div></div></li>`).join("")}</ul>
      <p class="tiny muted">Scale portions up or down to reach your target.</p>
    </section>
    <details class="card fold">
      <summary><h2>Protein in common foods</h2></summary>
      <table class="tbl"><thead><tr><th>Food</th><th>Portion</th><th>Protein</th></tr></thead>
      <tbody>${foodsFor(pref).map(f => `<tr><td>${f.name}</td><td class="muted">${f.portion}</td><td class="num">~${fmtG(f.p)} g</td></tr>`).join("")}</tbody></table>
      <p class="tiny muted">Approximate values; brands and recipes vary.</p>
    </details>
    <details class="card fold">
      <summary><h2>How this is estimated</h2></summary>
      <ul class="tidy small muted">
        <li>Base need for Indian adults: 0.83 g per kg a day (ICMR-NIN 2020); 1.0 g per kg on mainly cereal diets.</li>
        <li>Age 65+: at least 1.0–1.2 g per kg (PROT-AGE).</li>
        <li>Regular strength training: 1.2–1.6 g per kg; 4+ days a week: up to 2.0 g per kg (ISSN). Muscle gains level off near 1.6 g per kg (Morton 2018; ICMR 2024).</li>
        <li>If BMI is above 25 (27 from age 70), the weight at that BMI is used.</li>
        <li>Pregnancy and breastfeeding add ICMR's extra grams; kidney disease uses 0.8 g per kg (KDIGO 2024).</li>
      </ul>
      <h3 style="margin-top:4px">Sources</h3>
      <ol class="sources">
        <li><a href="https://www.nin.res.in/rdabook/brief_note.pdf" target="_blank" rel="noopener">ICMR-NIN Nutrient Requirements for Indians, 2020</a></li>
        <li><a href="https://researchexperts.utmb.edu/en/publications/evidence-based-recommendations-for-optimal-dietary-protein-intake/" target="_blank" rel="noopener">PROT-AGE Study Group, Bauer et al., 2013</a></li>
        <li><a href="https://www.nutraingredients.com/Article/2017/06/21/ISSN-publishes-position-stand-on-protein-and-exercise/" target="_blank" rel="noopener">ISSN position stand: protein and exercise, 2017</a></li>
        <li><a href="https://bjsm.bmj.com/content/52/6/376.abstract" target="_blank" rel="noopener">Morton et al., British Journal of Sports Medicine, 2018</a></li>
        <li><a href="https://www.emro.who.int/health-education/physical-activity/promoting-physical-activity/What-is-the-recommended-amount-of-exerci.html" target="_blank" rel="noopener">WHO physical activity recommendations</a></li>
        <li><a href="https://www.nephjc.com/news/kdigo-ckd-part2" target="_blank" rel="noopener">KDIGO 2024 CKD guideline (summary)</a></li>
      </ol>
    </details>
    <section class="disclaimer"><h2>Disclaimer</h2>${DISCLAIMER_TEXT.map(t => `<p class="small">${t}</p>`).join("")}</section>
  </main>`;
}

/* ---------------- Profile & data ---------------- */
function profileView() {
  const days = Object.keys(state.logs).filter(k => state.logs[k].items.length).length;
  return `<main class="page">
    <h1 class="page-title">Profile</h1>
    <form class="card form" id="pform" novalidate>${profileFields(state.profile)}
      <button class="btn block" type="submit">Save and recalculate</button>
    </form>
    <section class="card">
      <h2>Your data</h2>
      <p class="small">Your records are stored only on this phone: <b class="num">${days}</b> day${days === 1 ? "" : "s"} logged. Nothing is sent to any server. Uninstalling the app or clearing its storage may remove them, so save a backup copy if you want to keep them.</p>
      <button class="btn soft" data-action="export">Save a backup copy</button>
      <label class="btn ghost" for="importFile" style="cursor:pointer">Restore from a backup</label>
      <input type="file" id="importFile" accept="application/json,.json" hidden>
      ${ui.confirmDelete
        ? `<div class="alert danger"><b>Delete everything?</b> This removes your profile and all records from this phone. It cannot be undone.</div>
           <div class="two"><button class="btn ghost" data-action="cancel-delete">Keep my data</button><button class="btn danger" data-action="delete-all">Delete</button></div>`
        : `<button class="btn ghost" style="color:var(--danger);border-color:var(--danger)" data-action="ask-delete">Delete all my data</button>`}
    </section>
    <section class="card">
      <h2>About</h2>
      <button class="btn ghost" data-action="show-disclaimer">Read the disclaimer</button>
      <a class="btn ghost" href="privacy.html" target="_blank" rel="noopener">Privacy policy</a>
      <p class="tiny muted">${APP_NAME} version ${APP_VERSION}. Disclaimer accepted on ${state.acceptedAt ? new Date(state.acceptedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}.</p>
    </section>
  </main>`;
}
function exportData() {
  const json = JSON.stringify(state, null, 1);
  const name = `protein-saathi-backup-${todayKey()}.json`;
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    const { Filesystem, Share } = window.Capacitor.Plugins;
    Filesystem.writeFile({ path: name, data: json, directory: "CACHE", encoding: "utf8" })
      .then((r) => Share.share({ title: "Protein Saathi backup", files: [r.uri] }))
      .catch((e) => { if (!(e && /cancel/i.test(String(e.message || e)))) toast("Could not create a backup on this device"); });
    return;
  }
  try {
    const file = new File([json], name, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: "Protein Saathi backup" }).catch(() => {});
      return;
    }
  } catch (e) { /* fall through */ }
  try {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast("Backup saved to your downloads");
  } catch (e) {
    toast("Could not create a backup on this device");
  }
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const s = JSON.parse(reader.result);
      if (!s || typeof s !== "object" || !s.logs) throw new Error("bad");
      state = Object.assign(blankState(), s, { accepted: true, acceptedAt: state.acceptedAt || s.acceptedAt });
      save();
      toast("Backup restored");
      render();
    } catch (e) { toast("That file is not a Protein Saathi backup"); }
  };
  reader.readAsText(file);
}

/* ---------------- Navigation ---------------- */
function navView() {
  const tabs = [["today", "\u{1F4DD}", "Today"], ["history", "\u{1F4C5}", "History"], ["plan", "\u{1F3AF}", "Plan"], ["profile", "\u{1F464}", "Profile"]];
  return `<nav class="nav" aria-label="Main"><div class="in">${tabs.map(([id, i, l]) =>
    `<button data-action="tab" data-tab="${id}"${ui.tab === id ? ' aria-current="page"' : ""}><span class="i" aria-hidden="true">${i}</span>${l}</button>`).join("")}</div></nav>`;
}

/* ---------------- Events ---------------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action;
  switch (a) {
    case "tab": ui.tab = el.dataset.tab; ui.confirmDelete = false; if (ui.tab === "today") ui.day = ui.day || todayKey(); render(); break;
    case "day": { const n = +el.dataset.n; const nk = addDays(ui.day, n); if (nk <= todayKey()) { ui.day = nk; render(); } break; }
    case "go-today": ui.day = todayKey(); render(); break;
    case "open-add": addCtx = { slot: el.dataset.slot, q: "", food: null, qty: 1 }; showSheet("list"); break;
    case "close-sheet": closeSheet(); break;
    case "pick-slot": addCtx.slot = el.dataset.slot; showSheet(addCtx.view || "list"); break;
    case "pick-food": {
      const src = el.dataset.src, id = el.dataset.id;
      const f = src === "recent" ? (state.recent || []).find(r => r.id === id) : FOODS.find(x => x.id === id);
      if (!f) return;
      addCtx.food = { id: f.id, name: f.name, portion: f.portion, p: f.p }; addCtx.qty = 1; showSheet("qty"); break;
    }
    case "qty": addCtx.qty = Math.min(20, Math.max(0.5, addCtx.qty + +el.dataset.n)); showSheet("qty"); break;
    case "back-list": showSheet("list"); break;
    case "custom": showSheet("custom"); setTimeout(() => { const n = $("#cName"); if (n) n.focus(); }, 50); break;
    case "confirm-add": {
      const f = addCtx.food;
      addItem({ id: uid(), slot: addCtx.slot, foodId: f.id, name: f.name, portion: f.portion, p: f.p, qty: addCtx.qty, total: r1(f.p * addCtx.qty) });
      break;
    }
    case "confirm-custom": {
      const name = ($("#cName").value || "").trim(), portion = ($("#cPortion").value || "").trim(), g = parseFloat($("#cProt").value);
      const err = $("#cErr");
      if (!name) { err.textContent = "Please enter a food name."; err.hidden = false; return; }
      if (!(g >= 0 && g <= 200)) { err.textContent = "Please enter protein in grams (0–200)."; err.hidden = false; return; }
      addItem({ id: uid(), slot: addCtx.slot, foodId: "c_" + name.toLowerCase(), name, portion, p: r1(g), qty: 1, total: r1(g) });
      break;
    }
    case "del-item": {
      const log = dayLog(ui.day); if (!log) return;
      log.items = log.items.filter(i => i.id !== el.dataset.id);
      if (!log.items.length) delete state.logs[ui.day];
      save(); render(); toast("Removed"); break;
    }
    case "month": { const m = ui.histMonth; ui.histMonth = new Date(m.getFullYear(), m.getMonth() + +el.dataset.n, 1); render(); break; }
    case "open-day": ui.day = el.dataset.k; ui.tab = "today"; render(); break;
    case "export": exportData(); break;
    case "install":
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.finally(() => { installPrompt = null; render(); });
      }
      break;
    case "install-later": ui.installDismissed = true; render(); break;
    case "ask-delete": ui.confirmDelete = true; render(); break;
    case "cancel-delete": ui.confirmDelete = false; render(); break;
    case "delete-all":
      try { localStorage.removeItem(STORE_KEY); } catch (err) {}
      state = blankState(); ui = { tab: "today", day: todayKey(), histMonth: null, sheet: null, confirmDelete: false };
      render(); toast("All data deleted"); break;
    case "show-disclaimer":
      openSheet(`<div class="row between"><h2 id="sheetTitle">Disclaimer</h2><button class="icon-btn" data-action="close-sheet" aria-label="Close">✕</button></div>
        <div class="disclaimer">${DISCLAIMER_TEXT.map(t => `<p>${t}</p>`).join("")}</div>
        <button class="btn block" data-action="close-sheet">Close</button>`);
      break;
  }
});
document.addEventListener("change", e => {
  if (e.target.id === "importFile" && e.target.files && e.target.files[0]) importData(e.target.files[0]);
});
// Refresh "today" when the app comes back after midnight
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.profile && ui.tab === "today" && !ui.sheet) render();
});

/* ---------------- Install prompt (browser version only) ---------------- */
let installPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  installPrompt = e;
  if (state.accepted && state.profile && ui.tab === "today" && !ui.sheet) render();
});
window.addEventListener("appinstalled", () => { installPrompt = null; toast("Protein Saathi installed"); if (!ui.sheet) render(); });

/* ---------------- Offline support ---------------- */
// Skipped inside the native Android app (Capacitor), where files are already bundled on the phone.
if ("serviceWorker" in navigator && !window.Capacitor) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
}

/* ---------------- Native Android (Capacitor) ---------------- */
if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
  const { App, Browser } = window.Capacitor.Plugins;
  // Back button: close the Add food panel, otherwise leave the app.
  App.addListener("backButton", () => {
    if (ui.sheet) closeSheet();
    else if (ui.tab && ui.tab !== "today") { ui.tab = "today"; render(); }
    else App.exitApp();
  });
  // Source links open in the phone's browser.
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="http"]');
    if (a) { e.preventDefault(); Browser.open({ url: a.href }); }
  });
}

render();
