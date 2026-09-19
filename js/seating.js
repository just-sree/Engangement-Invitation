/* ═════════════════════════════════════════════════════════
   Mannat & Sree — Guest seating chart page
   Data lives in js/seating-data.js (or a published Google Sheet).
   ═════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const searchEl = $("#seat-search");
  const clearEl = $("#seat-clear");
  const statusEl = $("#seat-status");
  const resultsEl = $("#seat-results");
  const foundEl = $("#seat-found");
  const tablesEl = $("#seat-tables");
  const emptyEl = $("#seat-empty");
  const noticeEl = $("#seat-notice");

  const MAX_RESULTS = 8;
  let tables = [];   // [{ number, name, guests: [string] }]
  let guests = [];   // flattened: [{ name, norm, table }]

  // ── helpers ──────────────────────────────────────────────
  // Lower-case, strip accents, collapse whitespace — so "Sîmran  Kaur"
  // and "simran kaur" match, and "Dr." / "&" don't get in the way.
  const norm = (s) =>
    String(s || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const tableLabel = (t) => "Table " + t.number;

  // ── data loading ─────────────────────────────────────────
  function fromInline(cfg) {
    return (cfg.tables || [])
      .map((t) => ({
        number: t.number,
        name: t.name || "",
        guests: (t.guests || []).map((g) => String(g).trim()).filter(Boolean),
      }))
      .filter((t) => t.number !== undefined && t.number !== null && t.number !== "");
  }

  // Parses a published-to-web Google Sheet (CSV) with a header row:
  //   Name | Table | Table name (optional)
  function parseCsv(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else quoted = false;
        } else field += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows.filter((r) => r.some((v) => v.trim() !== ""));
  }

  function fromCsv(text) {
    const rows = parseCsv(text);
    if (!rows.length) return [];
    const header = rows[0].map((h) => norm(h));
    const col = (...names) => header.findIndex((h) => names.includes(h));
    const iName = col("name", "guest", "guest name");
    const iTable = col("table", "table number", "table no", "table #");
    const iTName = col("table name", "tablename", "label");
    if (iName < 0 || iTable < 0) throw new Error("Sheet needs 'Name' and 'Table' columns");

    const byNumber = new Map();
    rows.slice(1).forEach((r) => {
      const name = (r[iName] || "").trim();
      const num = (r[iTable] || "").trim();
      if (!name || !num) return;
      const key = /^\d+$/.test(num) ? Number(num) : num;
      if (!byNumber.has(key)) byNumber.set(key, { number: key, name: "", guests: [] });
      const t = byNumber.get(key);
      if (iTName >= 0 && r[iTName] && !t.name) t.name = r[iTName].trim();
      t.guests.push(name);
    });
    return [...byNumber.values()].sort((a, b) =>
      typeof a.number === "number" && typeof b.number === "number"
        ? a.number - b.number
        : String(a.number).localeCompare(String(b.number), undefined, { numeric: true })
    );
  }

  async function load() {
    const cfg = window.SEATING || {};
    let data = fromInline(cfg);
    if (cfg.sheetCsvUrl) {
      try {
        const res = await fetch(cfg.sheetCsvUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const parsed = fromCsv(await res.text());
        if (parsed.length) data = parsed;
      } catch (err) {
        // Keep the inline list so guests still see something useful.
        console.warn("Seating sheet unavailable, using built-in list:", err);
      }
    }
    return data;
  }

  // ── rendering ────────────────────────────────────────────
  function renderTables() {
    tablesEl.innerHTML = "";
    if (!tables.length) { emptyEl.hidden = false; return; }
    emptyEl.hidden = true;
    const frag = document.createDocumentFragment();
    tables.forEach((t) => {
      const card = document.createElement("article");
      card.className = "seat-table";
      card.id = "table-" + String(t.number).replace(/\s+/g, "-");
      card.innerHTML =
        `<div class="seat-table-head">
           <span class="seat-table-num">Table <b>${esc(t.number)}</b></span>
           ${t.name ? `<span class="seat-table-name">${esc(t.name)}</span>` : ""}
         </div>
         <ul>${t.guests.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>`;
      frag.appendChild(card);
    });
    tablesEl.appendChild(frag);
  }

  function highlight(name, q) {
    const n = norm(name);
    const tokens = norm(q).split(" ").filter(Boolean);
    // Highlight the first token where it occurs in the display name (best effort,
    // on the normalised text so lengths line up with the original in the common case).
    if (!tokens.length || n.length !== name.length) return esc(name);
    const i = n.indexOf(tokens[0]);
    if (i < 0) return esc(name);
    return esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + tokens[0].length)) + "</mark>" + esc(name.slice(i + tokens[0].length));
  }

  function search(q) {
    const nq = norm(q);
    if (!nq) return [];
    const tokens = nq.split(" ");
    const scored = [];
    guests.forEach((g) => {
      const words = g.norm.split(" ");
      // every typed token must start some word of the name (or the table name)
      const ok = tokens.every((tok) =>
        words.some((w) => w.startsWith(tok)) || g.norm.includes(tok) || g.tableNorm.includes(tok)
      );
      if (!ok) return;
      let score = 0;
      if (g.norm === nq) score += 100;
      else if (g.norm.startsWith(nq)) score += 50;
      else if (words.some((w) => w.startsWith(tokens[0]))) score += 20;
      scored.push({ g, score });
    });
    scored.sort((a, b) => b.score - a.score || a.g.name.localeCompare(b.g.name));
    return scored.slice(0, MAX_RESULTS).map((s) => s.g);
  }

  function renderResults(q) {
    const matches = search(q);
    resultsEl.innerHTML = "";
    clearEl.hidden = !q;
    if (!norm(q)) { statusEl.textContent = ""; return; }
    if (!matches.length) {
      statusEl.textContent = "No match yet — try just your first name, or browse the tables below.";
      return;
    }
    statusEl.textContent = matches.length === 1 ? "Is this you?" : "Tap your name:";
    matches.forEach((g) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = `<span class="r-name">${highlight(g.name, q)}</span><span class="r-table">${esc(tableLabel(g.table))}</span>`;
      btn.addEventListener("click", () => showFound(g));
      li.appendChild(btn);
      resultsEl.appendChild(li);
    });
  }

  function showFound(g) {
    const t = g.table;
    $("#sf-number").textContent = t.number;
    $("#sf-name").textContent = t.name;
    $("#sf-guest").textContent = g.name;
    const with_ = $("#sf-with");
    with_.innerHTML = "";
    t.guests.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      if (name === g.name) li.classList.add("you");
      with_.appendChild(li);
    });
    $(".seat-found-with-heading").hidden = t.guests.length <= 1;
    foundEl.hidden = false;
    resultsEl.innerHTML = "";
    statusEl.textContent = "";
    searchEl.value = g.name;
    clearEl.hidden = false;
    foundEl.scrollIntoView({ behavior: "smooth", block: "start" });

    document.querySelectorAll(".seat-table.highlight").forEach((el) => el.classList.remove("highlight"));
    const card = document.getElementById("table-" + String(t.number).replace(/\s+/g, "-"));
    if (card) card.classList.add("highlight");
  }

  function reset() {
    searchEl.value = "";
    foundEl.hidden = true;
    renderResults("");
    searchEl.focus();
  }

  // ── wiring ───────────────────────────────────────────────
  searchEl.addEventListener("input", () => {
    foundEl.hidden = true;
    renderResults(searchEl.value);
  });
  searchEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = resultsEl.querySelector("button");
      if (first) first.click();
      else searchEl.blur();
    }
    if (e.key === "Escape") reset();
  });
  clearEl.addEventListener("click", reset);
  $("#seat-again").addEventListener("click", reset);

  load().then((data) => {
    tables = data;
    guests = [];
    tables.forEach((t) => {
      const tableNorm = norm(t.name);
      t.guests.forEach((name) => guests.push({ name, norm: norm(name), table: t, tableNorm }));
    });
    noticeEl.hidden = !(window.SEATING && window.SEATING.sample && !window.SEATING.sheetCsvUrl);
    renderTables();
    // Deep link support: seating.html?name=Simran
    const preset = new URLSearchParams(location.search).get("name");
    if (preset) { searchEl.value = preset; renderResults(preset); }
  });
})();
