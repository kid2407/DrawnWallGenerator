import {WallDisplayApplication} from "./WallDisplayApplication.js";

export class Config {
    static LINE_THICKNESS = 'lineThickness'
    static DOOR_THICKNESS = 'doorThickness'
    static TEXTURE_WALL = 'wallTexture'
    static TEXTURE_DOOR = 'doorTexture'
    static SHOW_ANGLED_WALLS = 'showAngledWalls';

    static TEXTURE_TYPES = [Config.TEXTURE_WALL, Config.TEXTURE_DOOR]

    static ACTIVE_CONFIG = {}

    /**
     * @param {boolean} toggleDisplay
     * @private
     */
    static async _handleUpdatedConfig(toggleDisplay = false) {
        logger.info('Config was updated!')
        let settings = [Config.LINE_THICKNESS, Config.TEXTURE_WALL, Config.TEXTURE_DOOR, Config.SHOW_ANGLED_WALLS, Config.DOOR_THICKNESS]
        for (let settingsKey in settings) {
            if (settings.hasOwnProperty(settingsKey)) {
                let settingName = settings[settingsKey]
                Config.ACTIVE_CONFIG[settingName] = game.settings.get(WallDisplayApplication.MODULE_ID, settingName)
            }
        }

        if (toggleDisplay) {
            if (WallDisplayApplication._showWallsEW) {
                await WallDisplayApplication.toggleShowWallsEverywhere(false)
            }
            await WallDisplayApplication.toggleShowWallsEverywhere(true)
        }
    }

    static registerConfig() {
        if (!game.settings.hasOwnProperty(WallDisplayApplication.MODULE_ID)) {
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.LINE_THICKNESS, {
                name: "Wall width",
                hint: "Set how wide the generated walls should be.",
                scope: "world",
                config: true,
                type: Number,
                range: {
                    min: 5,
                    max: 100,
                    step: 5
                },
                default: 10,
                onChange: async () => {
                    await this._handleUpdatedConfig(true)
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.DOOR_THICKNESS, {
                name: "Door width",
                hint: "Set how wide the generated doors should be.",
                scope: "world",
                config: true,
                type: Number,
                range: {
                    min: 5,
                    max: 100,
                    step: 5
                },
                default: 5,
                onChange: async () => {
                    await this._handleUpdatedConfig(true)
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.TEXTURE_WALL, {
                name: "Normal wall texture",
                hint: "",
                scope: "world",
                config: true,
                type: String,
                filePicker: true,
                default: `modules/${WallDisplayApplication.MODULE_ID}/images/wall.png`,
                onChange: async () => {
                    await this._handleUpdatedConfig(true)
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.TEXTURE_DOOR, {
                name: "Door texture",
                hint: "",
                scope: "world",
                config: true,
                type: String,
                filePicker: true,
                default: `modules/${WallDisplayApplication.MODULE_ID}/images/door.png`,
                onChange: async () => {
                    await this._handleUpdatedConfig(true)
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.SHOW_ANGLED_WALLS, {
                name: "[Experimental] Display angled walls",
                hint: "This is an experimental setting - not like it should be",
                scope: "world",
                config: true,
                type: Boolean,
                filePicker: true,
                default: false,
                onChange: async () => {
                    await this._handleUpdatedConfig(true)
                }
            })
        }

        this._handleUpdatedConfig().then()
    }

}
