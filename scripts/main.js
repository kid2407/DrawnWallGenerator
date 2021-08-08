import {WallDisplayApplication} from "./WallDisplayApplication.js";
import {Config} from "./Config.js";

Hooks.on("getSceneControlButtons", (controls) => {
    if (game.user.isGM) {
        let basictools = controls.find((x) => x["name"] === "tiles").tools;
        basictools.push({
            active: WallDisplayApplication._showWallsEW,
            icon: "fas fa-landmark",
            name: "showwallsToggle",
            title: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.buttonHint`),
            onClick: async (toggle) => {
                WallDisplayApplication._showWallsEW = toggle;
                await WallDisplayApplication.toggleShowWallsEverywhere(toggle)
            },
            toggle: true,
        });
    }
});

Hooks.on('ready', () => {
    Config.registerConfig()
})
