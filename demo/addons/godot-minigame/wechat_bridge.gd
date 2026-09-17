## WeChat Mini Game bridge injected by the godot-minigame export platform.
##
## Add this script as an autoload, or preload it and instantiate it. The bridge
## is available only in a package exported by the "小游戏" platform.
class_name WeChatBridge
extends RefCounted

signal rewarded_video_finished(result: Dictionary)

var _bridge: JavaScriptObject
var _callbacks: Array[Callable] = []

func _init() -> void:
	if OS.has_feature("web"):
		_bridge = JavaScriptBridge.get_interface("WeChatBridge")

func is_available() -> bool:
	return _bridge != null and bool(_bridge.call("is_available"))

func share_app_message(options: Dictionary) -> Dictionary:
	if not is_available():
		return {"ok": false, "error": "WeChat bridge is unavailable"}
	return _parse_result(_bridge.call("share_app_message", JSON.stringify(options)))

func show_rewarded_video(ad_unit_id: String, callback: Callable = Callable()) -> void:
	if not is_available():
		_finish_rewarded_video({"ok": false, "error": "WeChat bridge is unavailable"}, callback)
		return
	if ad_unit_id.is_empty():
		_finish_rewarded_video({"ok": false, "error": "Rewarded-video ad unit ID is empty"}, callback)
		return
	var on_complete := JavaScriptBridge.create_callback(func(args: Array):
		var raw := str(args[0]) if not args.is_empty() else ""
		_finish_rewarded_video(_parse_result(raw), callback)
	)
	_callbacks.append(on_complete)
	_bridge.call("show_rewarded_video", ad_unit_id, on_complete)

func _finish_rewarded_video(result: Dictionary, callback: Callable) -> void:
	if callback.is_valid():
		callback.call(result)
	rewarded_video_finished.emit(result)

func _parse_result(raw: Variant) -> Dictionary:
	var parsed := JSON.parse_string(str(raw))
	return parsed if parsed is Dictionary else {"ok": false, "error": "Invalid bridge response"}
