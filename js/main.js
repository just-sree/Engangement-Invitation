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

$("#open-invite").addEventListener("click", (e) => {
  opening.classList.add("open");
  site.setAttribute("aria-hidden", "false");
  site.classList.add("shown");
  document.body.classList.remove("locked");
  $("#floating-controls").classList.add("shown");
  $("#floating-controls").removeAttribute("aria-hidden");

  music.start();          // user gesture → audio is allowed
  petals.start();
  const r = e.currentTarget.getBoundingClientRect();
  petals.burst(r.left + r.width / 2, r.top + r.height / 2);
  animateNames();
  setTimeout(() => opening.remove(), 2600);
});

// ------------------------------------------------------------------
// 2. Petals & gold particles (canvas)
// ------------------------------------------------------------------
const petals = (() => {
  const canvas = $("#petals");
  const ctx = canvas.getContext("2d");
  let W, H, parts = [], burstParts = [], running = false, raf;

  const PETAL_COLORS = ["#b8c2a7", "#a9b49a", "#cfd7bf", "#e9d29a"];
  const CONFETTI_COLORS = ["#e9d29a", "#c9a24b", "#b18a35", "#f3e7c8", "#f9f5ec"];

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

    // one-shot celebration burst (flash + shockwave + petals + confetti)
    if (burstParts.length) {
      const gravity = 0.12 * devicePixelRatio;
      burstParts = burstParts.filter((p) => p.life > 0);
      for (const p of burstParts) {
        p.life -= p.decay;
        if (p.kind === "flash") {
          const r = (1.05 - p.life) * 260 * devicePixelRatio * (p.scale || 1);
          ctx.save();
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          glow.addColorStop(0, `rgba(249,240,215,${0.75 * Math.max(p.life, 0)})`);
          glow.addColorStop(1, "rgba(249,240,215,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }
        if (p.kind === "shock") {
          p.r += p.vr;
          p.vr *= 0.94;
          ctx.save();
          ctx.globalAlpha = Math.max(p.life, 0) * 0.85;
          ctx.strokeStyle = "#f3e7c8";
          ctx.lineWidth = (0.5 + 3 * Math.max(p.life, 0)) * devicePixelRatio;
          ctx.shadowColor = "#e9d29a";
          ctx.shadowBlur = 14 * devicePixelRatio;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          continue;
        }
        p.vx *= 0.988;
        p.vy = p.vy * 0.992 + gravity;
        p.sway += 0.1;
        p.x += p.vx + Math.sin(p.sway) * 0.4 * devicePixelRatio;
        p.y += p.vy;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.rotate(p.angle);
        if (p.kind === "petal") {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "confetti") {
          ctx.fillStyle = p.color;
          ctx.scale(1, 0.4 + 0.6 * Math.abs(Math.sin(p.sway * 1.6)));
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.kind === "streamer") {
          ctx.fillStyle = p.color;
          ctx.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(p.sway * 1.3)));
          ctx.fillRect(-p.size * 1.6, -p.size * 0.18, p.size * 3.2, p.size * 0.36);
        } else if (p.kind === "heart") {
          ctx.fillStyle = p.color;
          const s = p.size * 0.9;
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.25);
          ctx.bezierCurveTo(s * 0.55, -s * 0.8, s * 1.1, 0, 0, s * 0.7);
          ctx.bezierCurveTo(-s * 1.1, 0, -s * 0.55, -s * 0.8, 0, -s * 0.25);
          ctx.fill();
        } else {
          ctx.fillStyle = "#e9d29a";
          ctx.shadowColor = "#c9a24b";
          ctx.shadowBlur = 10 * devicePixelRatio;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
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
      burstParts = [];
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    },
    // fireworks finale: main explosion at (cx, cy) in CSS pixels, then
    // satellite bursts around the screen while the doors open
    burst(cx, cy) {
      if (motionOff) return;
      const dpr = devicePixelRatio;

      const throwParticles = (bx, by, count, minSpeed, speedRange) => {
        for (let i = 0; i < count; i++) {
          const roll = Math.random();
          const kind =
            roll < 0.38 ? "petal" :
            roll < 0.68 ? "confetti" :
            roll < 0.8 ? "streamer" :
            roll < 0.9 ? "heart" : "spark";
          const angle = Math.random() * Math.PI * 2;
          const speed = (minSpeed + Math.random() * speedRange) * dpr;
          burstParts.push({
            kind,
            x: bx, y: by,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3.5 * dpr,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * (kind === "streamer" ? 0.18 : 0.4),
            sway: Math.random() * Math.PI * 2,
            life: 1,
            decay: 0.004 + Math.random() * 0.013,
            size: (kind === "petal" ? 5 + Math.random() * 7 : 4 + Math.random() * 6) * dpr,
            color: kind === "petal"
              ? PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0]
              : CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
          });
        }
      };

      const boom = (bx, by, count, minSpeed, speedRange, scale) => {
        throwParticles(bx, by, count, minSpeed, speedRange);
        burstParts.push({ kind: "flash", x: bx, y: by, life: 1, decay: 0.05, scale });
        burstParts.push({ kind: "shock", x: bx, y: by, r: 0, vr: 16 * dpr * scale, life: 1, decay: 0.028 });
      };

      const x = cx * dpr;
      const y = cy * dpr;
      const n = window.innerWidth < 600 ? 200 : 300;

      // the big one, from the button
      boom(x, y, n, 5, 17, 1.35);
      // crackle wave right behind it
      setTimeout(() => {
        if (motionOff) return;
        throwParticles(x, y, Math.round(n / 3), 9, 14);
        burstParts.push({ kind: "shock", x, y, r: 0, vr: 20 * dpr, life: 0.8, decay: 0.032 });
      }, 150);
      // satellite fireworks popping around the screen as the doors part
      [420, 680, 950].forEach((t) =>
        setTimeout(() => {
          if (motionOff) return;
          const bx = (0.15 + Math.random() * 0.7) * W;
          const by = (0.12 + Math.random() * 0.45) * H;
          boom(bx, by, Math.round(n / 3), 6, 12, 0.7);
        }, t)
      );

      // one sharp screen shake at the moment of impact
      const op = document.getElementById("opening");
      if (op) op.classList.add("shake");

      // lift the canvas above the doors while the finale plays
      canvas.classList.add("burst");
      setTimeout(() => canvas.classList.remove("burst"), 3300);
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

    // 1. Google Form (invisible to guests), via our own /api/rsvp proxy
    // so we can actually confirm Google accepted it — a direct browser
    // POST can only use mode:"no-cors", which can't be read at all and
    // would silently report success even on a rejection.
    const gf = CONFIG.googleForm;
    const gfEntries = gf.action && gf.build ? gf.build(data) : null;
    let proxyReachable = false;

    if (gfEntries) {
      try {
        const proxyRes = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: gfEntries }),
        });
        if (proxyRes.status !== 404) {
          proxyReachable = true;
          const result = await proxyRes.json();
          delivered = !!result.ok;
        }
      } catch {
        /* /api/rsvp isn't available on this host (e.g. GitHub Pages) */
      }

      // Fallback for static hosts with no serverless functions: best
      // effort only, can't confirm delivery (same limitation as before).
      if (!proxyReachable) {
        try {
          const fd = new FormData();
          for (const [entryId, value] of Object.entries(gfEntries)) {
            fd.append(entryId, value);
          }
          await fetch(gf.action, { method: "POST", mode: "no-cors", body: fd });
          delivered = true;
        } catch {
          /* fall through */
        }
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

    // 3. Last resort: pre-filled email. Also render it as a real tappable
    // link, not just a JS-triggered navigation — WhatsApp/Instagram's
    // in-app browser is known to silently swallow location.href="mailto:"
    // with no error and no mail app opening, which would otherwise leave
    // guests seeing "Thank you!" while nothing was ever sent.
    let usedEmailFallback = false;
    if (!delivered) {
      usedEmailFallback = true;
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
      const mailtoHref =
        `mailto:${CONFIG.rsvpEmail}` +
        `?subject=${encodeURIComponent("RSVP — " + data.name)}` +
        `&body=${encodeURIComponent(lines.join("\n"))}`;
      const emailLink = $("#thanks-email-link");
      emailLink.href = mailtoHref;
      emailLink.hidden = false;
      location.href = mailtoHref;
    }

    if (usedEmailFallback) {
      $("#thanks-title").textContent = "Almost there!";
      $("#thanks-message").textContent =
        "We've opened your email app with your RSVP ready — please hit send to complete it. " +
        "If nothing opened, tap the button below.";
    } else {
      $("#thanks-title").textContent = "Thank you!";
      $("#thanks-message").textContent =
        "Your RSVP has been received. We can't wait to celebrate with you. 💛";
      $("#thanks-email-link").hidden = true;
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

  // last-resort ambience, used when no other source is available
  function startGeneratedFallback() {
    if (mode) return;
    mode = "generated";
    play();
    wasPlaying = true;
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
    toggleBtn.title =
      (playing ? "Pause — " : "Play — ") + CONFIG.musicTitle;
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
    playing ? pause() : play();
    wasPlaying = playing;
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
      play();
      wasPlaying = true;
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
