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
- 📝 Custom RSVP form (guests, song requests, messages)
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
ambience plays instead. The floating ♪ button toggles playback, and music
auto-pauses when the tab is hidden. Swap the song by replacing the file
and updating `musicTitle` in `CONFIG` (`js/main.js`).

The ♪ button and volume slider control whichever source is active, and
music auto-pauses when the browser tab is hidden.

### Collecting RSVPs in your Google Form

The site's styled RSVP form submits quietly into the couple's Google Form —
guests never see the Google Form. `CONFIG.googleForm.build()` in
`js/main.js` maps the site's answers onto the form's questions (entry IDs
were extracted from the form's pre-filled link); the song request and
contact details are folded into the message answer since the Google Form
has no matching questions.

Two caveats:

- In the Google Form's Settings, keep **"Limit to 1 response" off** and
  don't restrict responses to signed-in users — both would break quiet
  submission from the site.
- Choice answers must match the form's option text letter-for-letter:
  "Yes,  I'll be there" and "Sadly, I won't be able to attend" are both
  wired up. If the option wording in the Google Form ever changes,
  update `build()` to match.

If the Google submission fails, the site falls back to
`CONFIG.rsvpEndpoint` (Apps Script/Formspree/etc.) if set, and finally to
opening the guest's email app pre-filled to `CONFIG.rsvpEmail`.

### Updating text & photos

- Story moments: edit the four `.story-card` blocks in `index.html`.
- Family welcome message: `#welcome` section.

## Ideas for v2

- Unique RSVP links per family + guest-limit validation
- Admin RSVP dashboard
- Password-protected private gallery
- English / Punjabi / Malayalam language toggle
- QR code for the printed invitation
- Live photo upload after the event
