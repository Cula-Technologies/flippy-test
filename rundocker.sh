#!/usr/bin/env /bin/sh

Xvfb :99 -screen 0 1024x768x24 </dev/null &

export DISPLAY=":99"

node /app/server.js