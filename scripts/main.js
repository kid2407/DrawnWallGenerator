import {WallDisplayApplication} from "./WallDisplayApplication.js";
import {Config} from "./Config.js";

Hooks.on("getSceneControlButtons", (controls) => {
    if (game.user.isGM) {
        let basictools = controls.find((x) => x["name"] === "tiles").tools;
        basictools.push({
            icon: "fas fa-landmark",
            name: "showwallsButton",
            title: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.buttonHint`),
            onClick: async () => {
                await WallDisplayApplication.generateWallTile()
            }
        });
    }
});

Hooks.on('ready', () => {
    Config.registerConfig()
})
