let _showWallsEW = false

Hooks.on("getSceneControlButtons", (controls, b, c) => {
    if (game.user.isGM) {
        let basictools = controls.find((x) => x["name"] === "tiles").tools;
        basictools.push({
            active: _showWallsEW,
            icon: "fas fa-landmark",
            name: "showwallsToggle",
            title: game.i18n.localize("showWalls.tools.toggle.hint"),
            onClick: (toggle) => {
                _showWallsEW = toggle;
                _toggleShowWallsEverywhere(toggle)
            },
            toggle: true,
        });
    }
});

function _toggleShowWallsEverywhere(toggle) {
    if (toggle) {
        let g = new PIXI.Graphics()
        g.name = "_showWallsEW"
        canvas.walls.placeables.forEach((c) => {
            g.beginFill(c.children[1]._fillStyle.color).lineStyle(5, c.children[1]._fillStyle.color).drawPolygon(c.coords).endFill()
        })
        canvas.effects.addChild(g)
    } else {
        canvas.effects.children.forEach((c) => {
            if (c.name === "_showWallsEW") c.destroy()
        })
    }
}
