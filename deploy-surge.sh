#!/usr/bin/env bash
# One-command deploy to Surge with the custom invitation link.
# Run this from the repo root on any machine with Node.js:
#   ./deploy-surge.sh
# The first run asks you to log in / create a free Surge account.
set -euo pipefail
DOMAIN="click-here-for-mannat-and-sree-engagement-rsvp.surge.sh"
npx --yes surge ./ "$DOMAIN"
echo
echo "Live at: https://$DOMAIN"
