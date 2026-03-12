#!/bin/sh
set -e

# Define custom startup script for OpenCode
OPENCODE_SCRIPT="npm start:opencode"
DEFAULT_SCRIPT="npm start"

# Check if the OpenCode script exists and is available
if [ -f "node_modules/.bin/$OPENCODE_SCRIPT" ] || grep -q "^${OPENCODE_SCRIPT}" package.json; then
echo "Using OpenCode-specific startup command: ${OPENCODE_SCRIPT}"
exec $OPENCODE_SCRIPT
else
echo "OpenCode script not found. Falling back to default startup command: ${DEFAULT_SCRIPT}"
exec $DEFAULT_SCRIPT
fi