// Daily Balance - v1
// All data is stored on the phone in localStorage. No accounts, no server.

const HABITS = [
  { id: "journal",    label: "Journalling",     emoji: "📓" },
  { id: "read",    label: "Reading",     emoji: "📓" },
  { id: "sun salutations", label: "Daily 3 sun salutations",      emoji: "🧘" },
  { id: "yoga",       label: "Yoga",            emoji: "🌿" },
  { id: "knee",      label: "Knee exercises", emoji: "🦵" },
  { id: "meditation", label: "Meditation",      emoji: "🧘" },
  { id: "morning walk",   label: "Morning Light",        emoji: "🚶" }, 
  { id: "eating",     label: "Healthy eating",  emoji: "🥗" },
  
];

const WATER_GOAL = 3; // litres per day. Change this number to suit you.

const MANTRAS = [
  "I am doing what I can, and that is enough.",
  "Small steps still move me forward.",
  "My body is healing at its own pace.",
  "I choose progress over perfection.",
  "I can do hard things, one moment at a time.",
  "Rest is part of the work.",
  "I am patient and kind with myself.",
];

const PROMPTS = [
  "What is one thing that went well today, however small?",
  "What does my body need most right now?",
  "What am I grateful for this week?",
  "What is one thing I'm proud of myself for?",
  "What drained my energy today, and what restored it?",
  "What would I tell a friend in my situation?",
  "What is one thing I want to do differently tomorrow?",
];

// ---------- storage ----------

const KEY = "dailybalance.v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { days: {} };
  } catch (e) {
    return { days: {} };
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
}

let data = load();

// ---------- dates ----------

function keyFor(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return keyFor(d);
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function getDay(key) {
  if (!data.days[key]) data.days[key] = { water: 0, done: {}, journal: "" };
  return data.days[key];
}

// ---------- logic ----------

function isDone(habitId, key) {
  const day = data.days[key];
  if (!day) return false;
  if (habitId === "water") return day.water >= WATER_GOAL;
  return !!day.done[habitId];
}

// A streak is consecutive completed days ending today, or ending yesterday
// if today isn't done yet (so it doesn't break until the day is over).
function streak(habitId) {
  let offset = isDone(habitId, dayKey(0)) ? 0 : 1;
  let count = 0;
  while (isDone(habitId, dayKey(offset))) {
    count++;
    offset++;
  }
  return count;
}

function toggleHabit(id) {
  const day = getDay(dayKey());
  day.done[id] = !day.done[id];
  save();
  render();
}

function changeWater(delta) {
  const day = getDay(dayKey());
  day.water = Math.max(0, day.water + delta);
  save();
  render();
}

function saveJournal(text) {
  const day = getDay(dayKey());
  day.journal = text;
  if (text.trim()) day.done.journal = true;
  save();
}

// ---------- views ----------

const view = document.getElementById("view");
const titleEl = document.getElementById("title");
const dateEl = document.getElementById("date");
let current = "today";

function renderToday() {
  const day = getDay(dayKey());
  const pct = Math.min(100, Math.round((day.water / WATER_GOAL) * 100));
  const mantra = MANTRAS[dayOfYear() % MANTRAS.length];
  const prompt = PROMPTS[dayOfYear() % PROMPTS.length];

  view.innerHTML = `
    <section class="card mantra">
      <h2>Today's mantra</h2>
      <p class="text">${mantra}</p>
    </section>

    <section class="card">
      <h2>💧 Water</h2>
      <div class="water-row">
        <span class="water-count">${day.water} / ${WATER_GOAL} litres</span>
        <span>
          <button class="ghost" id="water-minus">−</button>
          <button id="water-plus">+ Glass</button>
        </span>
      </div>
      <div class="bar"><div style="width:${pct}%"></div></div>
      <p class="muted">Streak: ${streak("water")} day(s)</p>
    </section>

    <section id="habits" style="display:grid;gap:8px"></section>

    <section class="card">
      <h2>Journal</h2>
      <p class="muted">${prompt}</p>
      <textarea id="journal-text" placeholder="Write here..."></textarea>
    </section>
  `;

  document.getElementById("water-plus").onclick = () => changeWater(1);
  document.getElementById("water-minus").onclick = () => changeWater(-1);

  const habitsEl = document.getElementById("habits");
  HABITS.forEach((h) => {
    const done = !!day.done[h.id];
    const btn = document.createElement("button");
    btn.className = "habit" + (done ? " done" : "");
    btn.innerHTML = `
      <span>${h.emoji} ${h.label}<br><span class="streak">Streak: ${streak(h.id)} day(s)</span></span>
      <span class="check">${done ? "✅" : "⬜"}</span>`;
    btn.onclick = () => toggleHabit(h.id);
    habitsEl.appendChild(btn);
  });

  const ta = document.getElementById("journal-text");
  ta.value = day.journal;
  // Save as you type, but don't re-render (that would lose your cursor).
  ta.oninput = () => saveJournal(ta.value);
  // Re-render when you leave the box so the journalling tick/streak updates.
  ta.onblur = () => render();
}

function renderWeek() {
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(dayKey(i));
  const labels = days.map((k) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);
  });

  const rows = [{ id: "water", label: "💧 Water" }, ...HABITS.map((h) => ({ id: h.id, label: `${h.emoji} ${h.label}` }))];

  view.innerHTML = `
    <section class="card">
      <h2>Last 7 days</h2>
      <table>
        <tr><th></th>${labels.map((l) => `<th>${l}</th>`).join("")}</tr>
        ${rows
          .map(
            (r) => `<tr><td>${r.label}</td>${days
              .map((k) => `<td><span class="dot ${isDone(r.id, k) ? "on" : ""}"></span></td>`)
              .join("")}</tr>`
          )
          .join("")}
      </table>
    </section>`;
}

function renderJournal() {
  const keys = Object.keys(data.days)
    .filter((k) => data.days[k].journal && data.days[k].journal.trim())
    .sort()
    .reverse();

  view.innerHTML = `<section class="card"><h2>Past entries</h2><div id="entries"></div></section>`;
  const box = document.getElementById("entries");

  if (keys.length === 0) {
    box.innerHTML = `<p class="muted">No entries yet. Write one on the Today tab.</p>`;
    return;
  }
  keys.forEach((k) => {
    const div = document.createElement("div");
    div.className = "entry";
    const when = document.createElement("div");
    when.className = "when";
    when.textContent = k;
    const p = document.createElement("p");
    p.textContent = data.days[k].journal; // textContent keeps your text safe
    div.append(when, p);
    box.appendChild(div);
  });
}

function render() {
  titleEl.textContent = { today: "Today", week: "Week", journal: "Journal" }[current];
  dateEl.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long",
  });
  if (current === "today") renderToday();
  if (current === "week") renderWeek();
  if (current === "journal") renderJournal();
}

document.querySelectorAll("nav button").forEach((b) => {
  b.onclick = () => {
    current = b.dataset.view;
    document.querySelectorAll("nav button").forEach((x) => x.classList.toggle("active", x === b));
    render();
  };
});

render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
