#!/usr/bin/env zsh
#
# run-on-device.sh — build the Expo client and launch it on a connected iOS device.
#
# Steps:
#   1. Verify Xcode is running.
#   2. Verify the Rails server at :3000 is up; start it in a new Terminal tab if not.
#   3. npx expo prebuild -p ios
#   4. (cd ios && pod install)
#   5. xcrun xctrace list devices  (so the user can confirm their phone is visible)
#   6. npx expo run:ios --device
#
# Usage:
#   ./scripts/run-on-device.sh           # run from client/
#   client/scripts/run-on-device.sh      # run from anywhere

set -euo pipefail

# ─── paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="${0:A:h}"
CLIENT_DIR="${SCRIPT_DIR:h}"
SERVER_DIR="/Users/Josiah/Documents/projects/personal-coach-split/server"
SERVER_PORT=3000

# ─── pretty output ────────────────────────────────────────────────────────────
autoload -U colors && colors
step()  { print -P "%F{cyan}▶%f $1"; }
ok()    { print -P "%F{green}✓%f $1"; }
warn()  { print -P "%F{yellow}!%f $1"; }
fail()  { print -P "%F{red}✗%f $1"; exit 1; }

# ─── 1. Xcode running? ────────────────────────────────────────────────────────
step "Checking that Xcode is running"
if ! pgrep -x Xcode >/dev/null; then
  fail "Xcode is not running. Open Xcode first (it must be running so CoreSimulator and the device bridge are loaded)."
fi
ok "Xcode is running"

# ─── 2. Rails server running? ────────────────────────────────────────────────
step "Checking that the Rails server is up on :${SERVER_PORT}"
if curl -sS -o /dev/null --max-time 2 "http://localhost:${SERVER_PORT}/up" \
   || lsof -iTCP:${SERVER_PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  ok "Server is already running on :${SERVER_PORT}"
else
  warn "Server not detected — launching \`bin/dev\` in a new Terminal tab"
  /usr/bin/osascript <<EOF
tell application "Terminal"
  activate
  do script "cd ${SERVER_DIR} && bin/dev"
end tell
EOF

  step "Waiting for server to come up on :${SERVER_PORT}"
  for i in {1..30}; do
    if lsof -iTCP:${SERVER_PORT} -sTCP:LISTEN >/dev/null 2>&1; then
      ok "Server is up"
      break
    fi
    sleep 1
    if [[ $i == 30 ]]; then
      fail "Server did not come up within 30s. Check the new Terminal tab for errors."
    fi
  done
fi

# ─── 3. prebuild ──────────────────────────────────────────────────────────────
cd "$CLIENT_DIR"
print -n "Run prebuild step ('npx expo prebuild -p ios')? (Y/n): "
read prebuild_answer
if [[ "$prebuild_answer" =~ ^[Yy]$ ]]; then
  step "Running \`npx expo prebuild -p ios\`"
  npx expo prebuild -p ios
  ok "Prebuild complete"
else
  echo "Prebuild step skipped"
fi

# ─── 4. pod install ───────────────────────────────────────────────────────────
print -n "Run pod install step ('cd ios && pod install')? (Y/n): "
read pod_install_answer
if [[ "$pod_install_answer" =~ ^[Yy]$ ]]; then
  step "Running \`cd ios && pod install\`"
  (cd ios && pod install)
  ok "Pod install complete"
else
  echo "Pod install step skipped"
fi

# These steps are commented out due to needing to run expo through tunnel
# ─── 5. list devices ──────────────────────────────────────────────────────────
# step "Listing devices visible to Xcode"
# xcrun xctrace list devices

# ─── 6. run on device ─────────────────────────────────────────────────────────
# step "Building and launching on connected device — \`npx expo run:ios --device\`"
# npx expo run:ios --device

# ─── 7. access build on device through tunnel ─────────────────────────────────────────────────────────
step "Access build on device through tunnel"
print -n "Start tunnel for device access? (Y/n): "
read answer
if [[ "$answer" =~ ^[Yy]$ ]]; then
  npx expo start --tunnel
else
  echo "Exiting without starting tunnel."
  exit 0
fi