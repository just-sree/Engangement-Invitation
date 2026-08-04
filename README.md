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

### Collecting RSVPs with Formspree (recommended)

Set `formspreeEndpoint` in `CONFIG` (`js/main.js`) and every RSVP is
emailed straight to you:

1. Sign up free at [formspree.io](https://formspree.io) → **New Form**.
2. Copy the endpoint URL it gives you (`https://formspree.io/f/xxxxxxxx`).
3. Paste it into `CONFIG.formspreeEndpoint`.
4. Submit one test RSVP — Formspree asks you to confirm your email the
   first time, then delivers every submission after that.

Formspree is the preferred path because it sends proper CORS headers,
so the site can **read the response and know for certain** whether an
RSVP was delivered. Google Forms can't do this: a browser may only post
to it opaquely, so a rejected submission is indistinguishable from a
successful one — which is exactly how RSVPs can vanish silently.

Formspree's free tier covers 50 submissions/month. While
`formspreeEndpoint` is empty, the site falls back to the Google Form
setup below.

### Sending guests a confirmation email

Guests who leave an email address get a styled confirmation with their
RSVP details and calendar/directions links, sent from your own Gmail by
the `api/confirm.js` serverless function.

The credentials are read only on the server, so nothing sensitive is
ever shipped to the browser — the drawback of client-side senders like
EmailJS, whose key is visible in the page source and can only be
domain-restricted on a paid plan.

**Setup — add two environment variables in Vercel:**

1. Google Account → **Security** → enable **2-Step Verification** (App
   Passwords require it).
2. Still under Security, open **App passwords**, generate one for
   "Mail", and copy the 16-character code.
3. Vercel → your project → **Settings** → **Environment Variables**,
   add both, then **redeploy** so they take effect:

   | Name | Value |
   |---|---|
   | `GMAIL_USER` | your full Gmail address |
   | `GMAIL_APP_PASSWORD` | the 16-character app password |

Use the app password, never your real Google password. Gmail allows
roughly 500 messages/day, far beyond what a guest list needs.

The email is deliberately best-effort: it is sent only *after* the RSVP
itself has been delivered, and any failure is swallowed silently, so a
misconfigured mailbox can never cost you an RSVP. Guests who leave a
phone number instead of an email simply don't get one. Until the two
variables are set, the endpoint reports `not_configured` and nothing
else changes.

### Fallback: collecting RSVPs in a Google Form

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
