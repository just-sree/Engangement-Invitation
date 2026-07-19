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

Background music is "Aamir Mir — Tu Hai Toh", played from
`assets/music.mp3` (make sure you have permission to use the recording
publicly). If the file can't load, a soft generative strings-and-piano
ambience plays instead. Swap the song by replacing the file and updating
`musicTitle` in `CONFIG` (`js/main.js`).

The ♪ button and volume slider control whichever source is active, and
music auto-pauses when the browser tab is hidden.

### Collecting RSVPs in your Google Form

The site's styled RSVP form submits quietly into the couple's Google Form
(`CONFIG.googleForm` in `js/main.js`) — guests never see the Google Form.
To finish the wiring, the numeric entry IDs are needed:

1. Open the Google Form **editor** → ⋮ menu → **Get pre-filled link**.
2. Type a sample answer in every question and click **Get link** → **Copy link**.
3. The copied URL contains `entry.NNNNNNN=answer` pairs, one per question.
   Paste each `entry.NNNNNNN` into the matching field in
   `CONFIG.googleForm.fields`.

Two form settings matter: in the Google Form's Settings, turn **off**
"Limit to 1 response" and "Restrict to users in …" (both force guests to
sign in to Google, which breaks quiet submission). For the *Will you
attend?* question, the site sends the texts "Joyfully accepts" /
"Regretfully declines" — either make that a short-answer question in the
Google Form, or use those exact texts as the multiple-choice options.

If the Google Form IDs aren't configured, submissions fall back to
`CONFIG.rsvpEndpoint` (Apps Script/Formspree/etc.), and finally to opening
the guest's email app pre-filled to `CONFIG.rsvpEmail`.

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
