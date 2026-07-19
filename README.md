# Mannat & Sree — Engagement Invitation 💍

A one-page animated invitation website for Mannat & Sree's engagement.

**Sunday, September 20, 2026 · 6:00 PM · Speranza Banquet Hall, Brampton, ON**

## What's inside

- ✉️ Animated opening — emerald & gold doors part to reveal the site
- 🌸 Drifting sage petals and golden particles
- ✨ Names revealed letter-by-letter in gold script
- ⏳ Live countdown (switches to a thank-you message after the big day)
- 📖 "Our Story" scroll timeline
- 📍 Event card with Google Maps, Google Calendar, and Apple/Outlook (.ics) buttons
- 📝 Custom RSVP form (guests, dietary needs, song requests, messages)
- 🖼 Polaroid photo gallery with lightbox
- 🎵 Music player — plays `assets/music.mp3` if present, otherwise a soft
  built-in generative strings-and-piano ambience; auto-mutes when the tab is hidden
- ♿ Animation on/off toggle + respects `prefers-reduced-motion`
- 📱 Mobile-first (most guests will open it from WhatsApp)

It is a plain static site — no build step. Host it on GitHub Pages,
Cloudflare Pages, Vercel, or Netlify as-is.

## Quick start

```bash
# preview locally
python3 -m http.server 8000
# open http://localhost:8000
```

## Customizing

All knobs live at the top of `js/main.js` in the `CONFIG` object:

| Setting | What it does |
|---|---|
| `eventDate` / `eventEnd` | Countdown target and calendar entries |
| `rsvpEndpoint` | URL that receives RSVP submissions as JSON (see below) |
| `rsvpEmail` | Fallback: guest's email app opens pre-filled to this address |
| `musicFile` / `musicTitle` | Your background track |

### Adding your music

Drop a file at `assets/music.mp3` (a soft instrumental you have permission to
use publicly). The player picks it up automatically; until then, a gentle
generative ambience plays instead.

### Collecting RSVPs in a Google Sheet

1. Create a Google Sheet with a header row: `submitted, name, attending,
   guests, guest_names, dietary, song, contact, message`.
2. Extensions → Apps Script, paste a small `doPost(e)` handler that appends
   `JSON.parse(e.postData.contents)` to the sheet, and deploy as a
   **Web app** (execute as *Me*, access: *Anyone*).
3. Paste the web-app URL into `CONFIG.rsvpEndpoint`.

Formspree, Basin, Airtable, or Supabase endpoints work the same way.
If no endpoint is set, submissions fall back to opening the guest's email
app with a pre-filled RSVP.

### Updating text & photos

- Story moments: edit the four `.story-card` blocks in `index.html`.
- Photos: replace the three placeholder polaroids in the gallery section
  with `<img>` tags (add `data-lightbox="path"` for tap-to-enlarge).
- Family welcome message: `#welcome` section.

## Ideas for v2

- Unique RSVP links per family + guest-limit validation
- Admin RSVP dashboard
- Password-protected private gallery
- English / Punjabi / Malayalam language toggle
- QR code for the printed invitation
- Live photo upload after the event
