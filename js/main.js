/* ═════════════════════════════════════════════════════════
   Mannat & Sree — Engagement site
   ═════════════════════════════════════════════════════════ */

// ------------------------------------------------------------------
// CONFIG — edit these to hook things up
// ------------------------------------------------------------------
const CONFIG = {
  // Event moment in Toronto time (EDT in September = UTC-4)
  eventDate: new Date("2026-09-20T18:00:00-04:00"),
  eventEnd: new Date("2026-09-20T23:00:00-04:00"),

  // RSVPs are submitted quietly into this Google Form (guests only ever
  // see the styled form on the site). The entry IDs come from the form's
  // pre-filled link: Google Form editor → ⋮ → "Get pre-filled link" →
  // fill in sample answers → copy link → the URL contains entry.NNNN=…
  // pairs. Paste each entry.NNNN below next to the matching field.
  googleForm: {
    action:
      "https://docs.google.com/forms/d/e/1FAIpQLSeZAHSJiYR4RL0wu2pb-ur4_h7KRZPCMb6k0kROhdx8bDjjRw/formResponse",
    // Maps a site RSVP onto the Google Form's four questions.
    // Choice answers must match the form's option text letter-for-letter.
    build(data) {
      const out = {};
      const declining = data.attending === "Regretfully declines";
      out["entry.877086558"] = declining
        ? "Sadly, I won't be able to attend"
        : "Yes,  I'll be there";
      const names = [data.name, data.guest_names].filter(Boolean).join(", ");
      if (names) out["entry.460312198"] = names;
      if (!declining && data.guests) out["entry.1498135098"] = data.guests;
      const extras = [
        data.message,
        data.song ? "Song request: " + data.song : "",
        data.contact ? "Contact: " + data.contact : "",
      ].filter(Boolean).join(" — ");
      if (extras) out["entry.1881695774"] = extras;
      return out;
    },
  },

  // Optional custom endpoint (Apps Script web app, Formspree, etc.).
  // Tried after the Google Form; leave "" to skip.
  rsvpEndpoint: "",
  // Last resort: opens the guest's email app pre-filled to this address.
  rsvpEmail: "sreechackoth@gmail.com",

  // Background music: the track at assets/music.mp3, with a soft
  // built-in generative strings-and-piano ambience as fallback.
  musicFile: "assets/music.mp3",
  musicTitle: "Aamir Mir — Tu Hai Toh",
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let motionOff = prefersReduced;
if (motionOff) document.body.classList.add("no-motion");

// ------------------------------------------------------------------
// 1. Opening doors
// ------------------------------------------------------------------
const opening = $("#opening");
const site = $("#site");

$("#open-invite").addEventListener("click", () => {
  opening.classList.add("open");
  site.setAttribute("aria-hidden", "false");
  site.classList.add("shown");
  document.body.classList.remove("locked");
  $("#floating-controls").classList.add("shown");
  $("#floating-controls").removeAttribute("aria-hidden");

  music.start();          // user gesture → audio is allowed
  petals.start();
  animateNames();
  setTimeout(() => opening.remove(), 2600);
});

// ------------------------------------------------------------------
// 2. Petals & gold particles (canvas)
// ------------------------------------------------------------------
const petals = (() => {
  const canvas = $("#petals");
  const ctx = canvas.getContext("2d");
  let W, H, parts = [], running = false, raf;

  const PETAL_COLORS = ["#b8c2a7", "#a9b49a", "#cfd7bf", "#e9d29a"];

  function resize() {
    W = canvas.width = window.innerWidth * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }
  window.addEventListener("resize", resize);
  resize();

  function spawn(initial) {
    const gold = Math.random() < 0.35;
    return {
      gold,
      x: Math.random() * W,
      y: initial ? Math.random() * H : -20 * devicePixelRatio,
      size: (gold ? 1.6 + Math.random() * 2.2 : 5 + Math.random() * 7) * devicePixelRatio,
      speed: (0.35 + Math.random() * 0.75) * devicePixelRatio,
      drift: (Math.random() - 0.5) * 0.6 * devicePixelRatio,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.008 + Math.random() * 0.012,
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      alpha: 0.5 + Math.random() * 0.4,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.sway += p.swaySpeed;
      p.x += p.drift + Math.sin(p.sway) * 0.5 * devicePixelRatio;
      p.y += p.speed;
      p.angle += p.spin;
      if (p.y > H + 30) Object.assign(p, spawn(false));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      if (p.gold) {
        const tw = 0.6 + 0.4 * Math.sin(p.sway * 3);
        ctx.globalAlpha = p.alpha * tw;
        ctx.fillStyle = "#e9d29a";
        ctx.shadowColor = "#c9a24b";
        ctx.shadowBlur = 8 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    raf = requestAnimationFrame(draw);
  }

  return {
    start() {
      if (running || motionOff) return;
      running = true;
      const n = window.innerWidth < 600 ? 26 : 44;
      parts = Array.from({ length: n }, () => spawn(true));
      draw();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    },
  };
})();

// ------------------------------------------------------------------
// 3. Names — letter-by-letter gold reveal
// ------------------------------------------------------------------
function animateNames() {
  let base = 400;
  $$("[data-letters]").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ltr";
      s.style.setProperty("--i", i);
      s.style.setProperty("--base", base + "ms");
      s.textContent = ch;
      el.appendChild(s);
    });
    base += text.length * 90 + 250;
  });
}

// ------------------------------------------------------------------
// 4. Countdown
// ------------------------------------------------------------------
(() => {
  const els = { d: $("#cd-days"), h: $("#cd-hours"), m: $("#cd-mins"), s: $("#cd-secs") };
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = CONFIG.eventDate - Date.now();
    if (diff <= 0) {
      $("#countdown-title").textContent = "Thank you for celebrating with us";
      $("#countdown-grid").style.display = "none";
      $(".countdown-tag").textContent =
        "September 20, 2026 — a night we will remember forever. 💛";
      clearInterval(timer);
      return;
    }
    els.d.textContent = Math.floor(diff / 864e5);
    els.h.textContent = pad(Math.floor(diff / 36e5) % 24);
    els.m.textContent = pad(Math.floor(diff / 6e4) % 60);
    els.s.textContent = pad(Math.floor(diff / 1e3) % 60);
  }
  const timer = setInterval(tick, 1000);
  tick();
})();

// ------------------------------------------------------------------
// 5. Scroll reveals
// ------------------------------------------------------------------
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.18 }
);
$$(".reveal").forEach((el) => io.observe(el));

// ------------------------------------------------------------------
// 6. Add to Calendar
// ------------------------------------------------------------------
(() => {
  const toUTC = (d) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = toUTC(CONFIG.eventDate);
  const end = toUTC(CONFIG.eventEnd);
  const title = "Mannat & Sree's Engagement";
  const location = "Speranza Banquet Hall, 510 Deerhurst Dr, Brampton, ON L6T 5H9";
  const details =
    "Join us to celebrate the engagement of Mannat & Sree! Guest arrival from 6:00 PM.";

  $("#gcal-link").href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}&dates=${start}/${end}` +
    `&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mannat & Sree//Engagement//EN",
    "BEGIN:VEVENT",
    `UID:mannat-sree-engagement-2026@invitation`,
    `DTSTAMP:${toUTC(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  $("#ics-link").href = URL.createObjectURL(
    new Blob([ics], { type: "text/calendar" })
  );

  $("#add-calendar").addEventListener("click", () => {
    const menu = $("#calendar-menu");
    menu.hidden = !menu.hidden;
  });
})();

// ------------------------------------------------------------------
// 7. RSVP form
// ------------------------------------------------------------------
(() => {
  const form = $("#rsvp-form");
  const extra = $("#attending-extra");

  form.addEventListener("change", (e) => {
    if (e.target.name === "attending") {
      extra.classList.toggle(
        "hidden",
        e.target.value === "Regretfully declines"
      );
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const err = $("#form-error");

    if (!data.name?.trim() || !data.attending || !data.contact?.trim()) {
      err.hidden = false;
      return;
    }
    err.hidden = true;

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Sending…";

    let delivered = false;

    // 1. Google Form (invisible to guests)
    const gf = CONFIG.googleForm;
    if (gf.action && gf.build) {
      try {
        const fd = new FormData();
        for (const [entryId, value] of Object.entries(gf.build(data))) {
          fd.append(entryId, value);
        }
        await fetch(gf.action, { method: "POST", mode: "no-cors", body: fd });
        delivered = true;
      } catch {
        /* fall through */
      }
    }

    // 2. Custom endpoint, if configured
    if (!delivered && CONFIG.rsvpEndpoint) {
      try {
        await fetch(CONFIG.rsvpEndpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, submitted: new Date().toISOString() }),
        });
        delivered = true;
      } catch {
        /* fall through to email */
      }
    }

    // 3. Last resort: pre-filled email
    if (!delivered) {
      const lines = [
        `RSVP — Mannat & Sree's Engagement`,
        ``,
        `Name: ${data.name}`,
        `Attending: ${data.attending}`,
        data.attending !== "Regretfully declines"
          ? `Guests: ${data.guests || 1}\nGuest names: ${data.guest_names || "—"}\nSong request: ${data.song || "—"}`
          : null,
        `Contact: ${data.contact}`,
        `Message: ${data.message || "—"}`,
      ].filter(Boolean);
      location.href =
        `mailto:${CONFIG.rsvpEmail}` +
        `?subject=${encodeURIComponent("RSVP — " + data.name)}` +
        `&body=${encodeURIComponent(lines.join("\n"))}`;
    }

    form.hidden = true;
    $("#rsvp-thanks").hidden = false;
    $("#rsvp-thanks").scrollIntoView({ behavior: motionOff ? "auto" : "smooth", block: "center" });
  });
})();

// ------------------------------------------------------------------
// 8. Music — mp3 if provided, otherwise gentle generative ambience
// ------------------------------------------------------------------
const music = (() => {
  let audioEl = null;      // <audio> path
  let actx = null;         // WebAudio fallback
  let master = null;
  let genTimer = null;
  let playing = false;
  let wasPlaying = false;
  let volume = 0.55;
  let mode = null;         // "file" | "generated"

  const toggleBtn = $("#music-toggle");
  const panel = $("#music-panel");
  const volSlider = $("#music-volume");
  let panelTimer = null;

  // show the volume panel briefly, then tuck it away
  function peekPanel() {
    panel.hidden = false;
    clearTimeout(panelTimer);
    panelTimer = setTimeout(() => (panel.hidden = true), 5000);
  }
  panel.addEventListener("pointerenter", () => clearTimeout(panelTimer));
  panel.addEventListener("pointerleave", peekPanel);

  // last-resort ambience, used when no other source is available
  function startGeneratedFallback() {
    if (mode) return;
    mode = "generated";
    play();
    wasPlaying = true;
    peekPanel();
  }

  // -- generative fallback: slow Pachelbel-ish progression on soft sines
  const PROGRESSION = [
    [261.63, 329.63, 392.0],   // C
    [196.0, 246.94, 293.66],   // G
    [220.0, 261.63, 329.63],   // Am
    [174.61, 220.0, 261.63],   // F
  ];
  let chordIdx = 0;

  function playChord() {
    if (!actx || !playing) return;
    const chord = PROGRESSION[chordIdx % PROGRESSION.length];
    chordIdx++;
    const now = actx.currentTime;
    chord.forEach((freq, i) => {
      // pad layer
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.09 / (i + 1) ** 0.4, now + 1.6);
      g.gain.linearRampToValueAtTime(0, now + 5.6);
      o.connect(g).connect(master);
      o.start(now);
      o.stop(now + 5.8);
      // sparkle an octave up, staggered like plucked strings
      const o2 = actx.createOscillator();
      const g2 = actx.createGain();
      o2.type = "triangle";
      o2.frequency.value = freq * 2;
      const t = now + 0.5 + i * 0.9;
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(0.035, t + 0.06);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o2.connect(g2).connect(master);
      o2.start(t);
      o2.stop(t + 2.4);
    });
  }

  function startGenerated() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain();
      master.gain.value = volume;
      master.connect(actx.destination);
    }
    actx.resume();
    playing = true;
    playChord();
    genTimer = setInterval(playChord, 5200);
  }

  function stopGenerated() {
    playing = false;
    clearInterval(genTimer);
    if (actx) actx.suspend();
  }

  function updateUI() {
    toggleBtn.classList.toggle("playing", playing);
    toggleBtn.textContent = playing ? "♪" : "𝄽";
    toggleBtn.title = playing ? "Pause music" : "Play music";
  }

  function play() {
    if (mode === "file") {
      audioEl.volume = volume;
      audioEl.play().catch(() => {});
      playing = true;
    } else {
      startGenerated();
    }
    updateUI();
  }

  function pause() {
    if (mode === "file") {
      audioEl.pause();
      playing = false;
    } else {
      stopGenerated();
    }
    updateUI();
  }

  toggleBtn.addEventListener("click", () => {
    if (!mode) return;
    peekPanel();
    playing ? pause() : play();
    wasPlaying = playing;
  });

  volSlider.addEventListener("input", () => {
    volume = volSlider.value / 100;
    if (audioEl) audioEl.volume = volume;
    if (master) master.gain.value = volume;
  });

  // auto-mute when the tab is hidden, resume when it returns
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      wasPlaying = playing;
      if (playing) pause();
    } else if (wasPlaying) {
      play();
    }
  });

  // The couple's song from assets/music.mp3; generated ambience if the
  // file can't be loaded.
  function startFile() {
    let advanced = false;
    const next = () => {
      if (mode || advanced) return;
      advanced = true;
      startGeneratedFallback();
    };
    const el = new Audio(CONFIG.musicFile);
    el.loop = true;
    el.volume = volume;
    el.addEventListener("canplaythrough", () => {
      if (mode) return;
      mode = "file";
      audioEl = el;
      $("#music-title").textContent = CONFIG.musicTitle;
      play();
      wasPlaying = true;
      peekPanel();
    }, { once: true });
    el.addEventListener("error", next, { once: true });
    el.load();
    // safety: if neither event fires quickly, move on
    setTimeout(next, 2500);
  }

  return {
    start() {
      startFile();
    },
  };
})();

// ------------------------------------------------------------------
// 9. Animation on/off toggle
// ------------------------------------------------------------------
$("#motion-toggle").addEventListener("click", (e) => {
  motionOff = !motionOff;
  document.body.classList.toggle("no-motion", motionOff);
  e.currentTarget.classList.toggle("off", motionOff);
  if (motionOff) petals.stop();
  else petals.start();
});
