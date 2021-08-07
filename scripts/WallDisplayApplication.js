export class WallDisplayApplication extends FormApplication {
    static MODULE_ID = 'drawn-wall-generator'
    static _showWallsEW = false
    static _oldLineWidth = 5

    async _updateObject(event, formData) {
        return Promise.resolve(undefined)
    }

    getData(options = {}) {
        // noinspection JSValidateTypes
        return {
            'content': "Some random contEnt!",
            'lineThickness': game.settings.get(WallDisplayApplication.MODULE_ID, 'lineThickness')
        }
    }

    static get defaultOptions() {
        let options = super.defaultOptions
        options.width = 600
        options.height = 500
        options.resizable = true
        options.id = 'wda-dialogue'
        options.title = game.i18n.localize(`${(WallDisplayApplication.MODULE_ID)}.dialogue.title`)
        options.template = `modules/${WallDisplayApplication.MODULE_ID}/templates/dialogue.hbs`
        options.closeOnSubmit = false

        return options
    }

    static registerSettings() {
        game.settings.registerMenu(WallDisplayApplication.MODULE_ID, 'sub-settings', {
            name: "Configuration",
            label: "Open",
            hint: "Adjust the settings of how the wall will be displayed.",
            icon: "fas fa-wrench",
            type: WallDisplayApplication,
            restricted: true
        })

        game.settings.register(WallDisplayApplication.MODULE_ID, 'lineThickness', {
            name: "Register a Module Setting with a Range slider",
            hint: "A description of the registered setting and its behavior.",
            scope: "world",
            config: false,
            type: Number,
            range: {
                min: 1,
                max: 100,
                step: 10
            },
            default: 5,
            onChange: () => {
                if (WallDisplayApplication._showWallsEW) {
                    WallDisplayApplication.toggleShowWallsEverywhere(false).then()
                }
                WallDisplayApplication.toggleShowWallsEverywhere(true).then()
            }
        })
    }

    /**
     * @param {int[]} coords
     * @param {int} lineWidth
     * @param {boolean} isDoor
     * @param {boolean} reverse
     * @returns {int[]}
     */
    static adjustLineCoordinates(coords, lineWidth, isDoor, reverse = false) {
        let finalCoordinates = []
        let lineWidthHalved = lineWidth / 2
        let wallDirection = coords[0] === coords[2] ? 'vertical' : (coords[1] === coords[3] ? 'horizontal' : 'neither')
        if (wallDirection === 'vertical') {
            if (coords[1] < coords[3] && !isDoor) {
                coords[1] = coords[1] - (lineWidthHalved) * (reverse ? -1 : 1)
                coords[3] = coords[3] + (lineWidthHalved) * (reverse ? -1 : 1)
            } else {
                coords[1] = coords[1] + (lineWidthHalved) * (reverse ? -1 : 1)
                coords[3] = coords[3] - (lineWidthHalved) * (reverse ? -1 : 1)
            }
            finalCoordinates.push(coords[0] - lineWidthHalved, coords[1], coords[0] + lineWidthHalved, coords[1], coords[2] + lineWidthHalved, coords[3], coords[2] - lineWidthHalved, coords[3])
        } else if (wallDirection === 'horizontal') {
            if (coords[0] < coords[2] && !isDoor) {
                coords[0] = coords[0] - (lineWidthHalved) * (reverse ? -1 : 1)
                coords[2] = coords[2] + (lineWidthHalved) * (reverse ? -1 : 1)
            } else {
                coords[0] = coords[0] + (lineWidthHalved) * (reverse ? -1 : 1)
                coords[2] = coords[2] - (lineWidthHalved) * (reverse ? -1 : 1)
            }
            finalCoordinates.push(coords[0], coords[1] - lineWidthHalved, coords[0], coords[1] + lineWidthHalved, coords[2], coords[3] + lineWidthHalved, coords[2], coords[3] - lineWidthHalved)
        }

        return finalCoordinates
    }

    static async toggleShowWallsEverywhere(toggle) {
        let lineWidth = game.settings.get(WallDisplayApplication.MODULE_ID, 'lineThickness')
        let g
        if (toggle) {
            g = new PIXI.Graphics()
            g.name = "_showWallsEW"
            WallDisplayApplication._oldLineWidth = lineWidth
        } else {
            lineWidth = WallDisplayApplication._oldLineWidth
            canvas.background.children.forEach((c) => {
                if (c.name === "_showWallsEW") c.destroy()
            })
        }

        // noinspection JSValidateTypes
        /** @var {Wall[]} placeables */
        let placeables = canvas.walls.placeables
        placeables.forEach((c) => {
            // noinspection JSUnresolvedFunction
            let wall = deepClone(c)
            let wallData = wall.data
            logger.info(`It has the following values: door: ${wallData.door}, move: ${wallData.move}, sense: ${wallData.sense}, sound: ${wallData.sound}`)
            let coords = WallDisplayApplication.adjustLineCoordinates(wallData.c, lineWidth, wallData.door === 1, !toggle)

            if (toggle) {
                let texture = new PIXI.Texture.from(`/modules/${WallDisplayApplication.MODULE_ID}/lava.png`);
                g.beginTextureFill({
                    texture: texture
                }).drawPolygon(coords).endFill()
            }
        })
        if (toggle) {
            canvas.background.addChild(g)
        }
    }

    async _onSubmit(event, {
        updateData = null,
        preventClose = false,
        preventRender = false
    } = {}) {
        let button = $('#wda-dialogue button[type="submit"]')
        button.addClass('disabled')
        button.attr('disabled', true)
        let formData = this._getSubmitData(updateData)
        logger.info('Form Content:', formData)
        event.preventDefault()

        for (let formDataKey in formData) {
            if (formData.hasOwnProperty(formDataKey)) {
                game.settings.set(WallDisplayApplication.MODULE_ID, formDataKey, formData[formDataKey])
                logger.info(`Updated setting ${formDataKey} with value ${formData[formDataKey]}.`)
            }
        }

        button.removeClass('disabled')
        button.attr('disabled', false)
    }
}
