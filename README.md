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

It is a plain static site — no build step.

## Deployment

**GitHub Pages (automatic):** every push to the default branch runs
`.github/workflows/deploy-pages.yml`, which publishes the site to
<https://just-sree.github.io/Engangement-Invitation/>.
Renaming the repository (Settings → General → rename to e.g.
`click-here-for-Mannat-and-Sree-Engagement-RSVP`) changes the link to match —
Pages follows the new name automatically.

**Surge (custom link):** run `./deploy-surge.sh` on any machine with Node.js
to publish to <https://click-here-for-mannat-and-sree-engagement-rsvp.surge.sh>.
The first run asks you to create a free Surge account.

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

### Music

Background music is tried in this order (see `CONFIG` in `js/main.js`):

1. **YouTube** — `youtubeId` streams the couple's song through YouTube's
   official embedded player, shown as a small docked video (YouTube's terms
   require the player to be visible; this also keeps the song properly
   licensed). Set `musicTitle` to the song's name.
2. **Local file** — drop a track you have permission to use at
   `assets/music.mp3`.
3. **Built-in ambience** — a soft generative strings-and-piano loop.

The ♪ button and volume slider control whichever source is active, and
music auto-pauses when the browser tab is hidden.

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
