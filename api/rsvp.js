// Vercel serverless function — proxies the RSVP into the couple's Google
// Form and actually checks whether Google accepted it.
//
// A browser can only POST to Google Forms with `mode: "no-cors"`, which
// makes the response unreadable: it "succeeds" even when Google rejects
// the submission (e.g. a sign-in requirement from "Limit to 1 response").
// This function runs server-side, where that restriction doesn't apply,
// so it can read the real result and report it back honestly.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, reason: "method_not_allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const entries = body && body.entries;
  if (!entries || typeof entries !== "object") {
    res.status(400).json({ ok: false, reason: "missing_entries" });
    return;
  }

  const GOOGLE_FORM_ACTION =
    "https://docs.google.com/forms/d/e/1FAIpQLSeZAHSJiYR4RL0wu2pb-ur4_h7KRZPCMb6k0kROhdx8bDjjRw/formResponse";

  // This route is public — anyone who finds the URL could otherwise use
  // it as an open relay to spam the linked Google Form with arbitrary
  // entry IDs and content. Only forward this form's own known fields.
  const ALLOWED_ENTRY_IDS = new Set([
    "entry.877086558", // Will you attend?
    "entry.460312198", // Names
    "entry.1498135098", // Number of guests
    "entry.1881695774", // Message
  ]);
  const MAX_FIELD_LENGTH = 3000;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value != null && value !== "" && ALLOWED_ENTRY_IDS.has(key)) {
      params.append(key, String(value).slice(0, MAX_FIELD_LENGTH));
    }
  }
  if ([...params.keys()].length === 0) {
    res.status(400).json({ ok: false, reason: "empty_submission" });
    return;
  }

  try {
    const googleRes = await fetch(GOOGLE_FORM_ACTION, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      redirect: "follow",
    });

    // The one unambiguous failure signal available here: Google redirects
    // an anonymous submission to a sign-in page when the form requires it.
    const requiresSignIn = googleRes.url.includes("accounts.google.com");
    const ok = googleRes.ok && !requiresSignIn;

    res.status(200).json({
      ok,
      reason: ok
        ? undefined
        : requiresSignIn
          ? "google_signin_required"
          : "google_rejected",
    });
  } catch {
    res.status(200).json({ ok: false, reason: "network_error" });
  }
};
