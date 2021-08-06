export class WallDisplayApplication extends FormApplication {
    static MODULE_ID = 'drawn-wall-generator'
    static _showWallsEW = false

    async _updateObject(event, formData) {
        return Promise.resolve(undefined)
    }

    getData(options = {}) {
        // noinspection JSValidateTypes
        return {
            'content': "Some random contEnt!"
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
                step: 10,
                default: 5
            },
            onChange: async value => {
                await WallDisplayApplication.toggleShowWallsEverywhere(false)
                await WallDisplayApplication.toggleShowWallsEverywhere(true)
            }
        })
    }

    static async toggleShowWallsEverywhere(toggle) {
        if (toggle) {
            let g = new PIXI.Graphics()
            g.name = "_showWallsEW"
            canvas.walls.placeables.forEach((c) => {
                g.beginFill(c.children[1]._fillStyle.color).lineStyle(game.settings.get(WallDisplayApplication.MODULE_ID, 'lineThickness'), c.children[1]._fillStyle.color).drawPolygon(c.coords).endFill()
            })
            canvas.effects.addChild(g)
        } else {
            canvas.effects.children.forEach((c) => {
                if (c.name === "_showWallsEW") c.destroy()
            })
        }
    }

    async _onSubmit(event, {
        updateData = null,
        preventClose = false,
        preventRender = false
    } = {}) {
        let formData = this._getSubmitData(updateData)
        logger.info('Form Content:', formData)
        event.preventDefault()

        for (let formDataKey in formData) {
            if (formData.hasOwnProperty(formDataKey)) {
                game.settings.set(WallDisplayApplication.MODULE_ID, formDataKey, formData[formDataKey])
                logger.info(`Updated setting ${formDataKey} with value ${formData[formDataKey]}.`)
            }
        }
    }
}
