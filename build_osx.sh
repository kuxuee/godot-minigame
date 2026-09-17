#!/bin/bash
set -e

: "${OSXCROSS_ROOT:=/opt/osxcross}"
if [ -d "$OSXCROSS_ROOT/target/bin" ]; then
  export PATH="$OSXCROSS_ROOT/target/bin:$PATH"
fi

GODOT_MINIGAME_EMBED_RESOURCES=yes scons platform=macos arch=universal target=template_release
