const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const bridgePath = process.argv[2] || "resources/scripts/wechat-bridge.js";
const calls = [];
const listeners = {};
const context = {
    GameGlobal: {},
    console,
    wx: {
        shareAppMessage(options) { calls.push(options); },
        createRewardedVideoAd({ adUnitId }) {
            assert.strictEqual(adUnitId, "ad-unit-test");
            return {
                onClose(listener) { listeners.close = listener; },
                offClose(listener) { assert.strictEqual(listener, listeners.close); },
                onError(listener) { listeners.error = listener; },
                offError(listener) { assert.strictEqual(listener, listeners.error); },
                show() { return Promise.resolve(); },
            };
        },
    },
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(bridgePath, "utf8"), context);

assert.strictEqual(context.WeChatBridge.is_available(), true);
assert.deepStrictEqual(JSON.parse(context.WeChatBridge.share_app_message('{"title":"Invite"}')), { ok: true });
assert.deepStrictEqual(JSON.parse(JSON.stringify(calls)), [{ title: "Invite" }]);

let rewarded;
context.WeChatBridge.show_rewarded_video("ad-unit-test", (raw) => { rewarded = JSON.parse(raw); });
Promise.resolve().then(() => {
    listeners.close({ isEnded: true });
    assert.deepStrictEqual(rewarded, { ok: true, isEnded: true });
    console.log("WeChat bridge tests passed");
});
