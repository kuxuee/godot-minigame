@echo off
setlocal

set GODOT_MINIGAME_EMBED_RESOURCES=yes
scons platform=windows arch=x86_64 target=template_release || exit /b 1
scons platform=windows arch=x86_32 target=template_release || exit /b 1
