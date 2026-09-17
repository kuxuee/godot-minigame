(function (root) {
    "use strict";

    const gameGlobal = root.GameGlobal || (root.GameGlobal = {});
    const rewardedAds = new Map();

    function wxApi() {
        return typeof wx !== "undefined" ? wx : null;
    }

    function result(ok, extra) {
        return JSON.stringify(Object.assign({ ok }, extra || {}));
    }

    function parseOptions(raw) {
        if (typeof raw === "string") {
            return JSON.parse(raw);
        }
        return raw && typeof raw === "object" ? raw : {};
    }

    const bridge = {
        is_available() {
            const api = wxApi();
            return !!api && typeof api.shareAppMessage === "function";
        },

        share_app_message(rawOptions) {
            const api = wxApi();
            if (!api || typeof api.shareAppMessage !== "function") {
                return result(false, { error: "wx.shareAppMessage is unavailable" });
            }
            try {
                api.shareAppMessage(parseOptions(rawOptions));
                return result(true);
            } catch (error) {
                return result(false, { error: String(error && error.message || error) });
            }
        },

        show_rewarded_video(adUnitId, callback) {
            const api = wxApi();
            if (!api || typeof api.createRewardedVideoAd !== "function") {
                callback(result(false, { error: "wx.createRewardedVideoAd is unavailable" }));
                return;
            }
            if (!adUnitId) {
                callback(result(false, { error: "Rewarded-video ad unit ID is empty" }));
                return;
            }

            let ad = rewardedAds.get(adUnitId);
            if (!ad) {
                ad = api.createRewardedVideoAd({ adUnitId });
                rewardedAds.set(adUnitId, ad);
            }

            let settled = false;
            const cleanup = () => {
                if (typeof ad.offClose === "function") ad.offClose(onClose);
                if (typeof ad.offError === "function") ad.offError(onError);
            };
            const finish = (payload) => {
                if (settled) return;
                settled = true;
                cleanup();
                callback(result(true, payload));
            };
            const fail = (error) => {
                if (settled) return;
                settled = true;
                cleanup();
                callback(result(false, { error: String(error && error.errMsg || error && error.message || error) }));
            };
            const onClose = (closeResult) => finish({ isEnded: !!(closeResult && closeResult.isEnded) });
            const onError = (error) => fail(error);

            ad.onClose(onClose);
            ad.onError(onError);
            Promise.resolve()
                .then(() => ad.show())
                .catch(() => ad.load().then(() => ad.show()))
                .catch(fail);
        },
    };

    root.WeChatBridge = bridge;
    gameGlobal.WeChatBridge = bridge;
})(typeof globalThis !== "undefined" ? globalThis : this);
