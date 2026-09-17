#!/bin/bash
set -e
GODOT_MINIGAME_EMBED_RESOURCES=yes scons platform=windows arch=x86_64 target=template_release
GODOT_MINIGAME_EMBED_RESOURCES=yes scons platform=windows arch=x86_32 target=template_release
