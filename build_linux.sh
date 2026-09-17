#!/bin/bash
set -e
GODOT_MINIGAME_EMBED_RESOURCES=yes scons platform=linux arch=x86_64 target=template_release
GODOT_MINIGAME_EMBED_RESOURCES=yes scons platform=linux arch=arm64 target=template_release
