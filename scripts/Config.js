import {WallDisplayApplication} from "./WallDisplayApplication.js";

export class Config {
    static LINE_THICKNESS = 'lineThickness'
    static DOOR_THICKNESS = 'doorThickness'
    static TEXTURE_WALL = 'wallTexture'
    static TEXTURE_DOOR = 'doorTexture'
    static TEXTURE_TERRAIN_WALL = 'terrainWall';
    static TEXTURE_ETHERAL_WALL = 'etheralWall';
    static SHOW_ANGLED_WALLS = 'showAngledWalls';

    static TEXTURE_TYPES = [Config.TEXTURE_WALL, Config.TEXTURE_DOOR, Config.TEXTURE_TERRAIN_WALL, Config.TEXTURE_ETHERAL_WALL]

    static ACTIVE_CONFIG = {}

    /**
     * @private
     */
    static async _handleUpdatedConfig() {
        logger.info('Config was updated!')
        let settings = [Config.LINE_THICKNESS, Config.TEXTURE_WALL, Config.TEXTURE_DOOR, Config.TEXTURE_TERRAIN_WALL, Config.TEXTURE_ETHERAL_WALL, Config.SHOW_ANGLED_WALLS, Config.DOOR_THICKNESS]
        for (let settingsKey in settings) {
            if (settings.hasOwnProperty(settingsKey)) {
                let settingName = settings[settingsKey]
                Config.ACTIVE_CONFIG[settingName] = game.settings.get(WallDisplayApplication.MODULE_ID, settingName)
            }
        }
    }

    static registerConfig() {
        if (!game.settings.hasOwnProperty(WallDisplayApplication.MODULE_ID)) {
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.LINE_THICKNESS, {
                name: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.LINE_THICKNESS}.name`),
                hint: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.LINE_THICKNESS}.hint`),
                scope: "world",
                config: true,
                type: Number,
                range: {
                    min: 5,
                    max: 100,
                    step: 5
                },
                default: 15,
                onChange: async () => {
                    await this._handleUpdatedConfig()
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.DOOR_THICKNESS, {
                name: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.DOOR_THICKNESS}.name`),
                hint: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.DOOR_THICKNESS}.hint`),
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
                    await this._handleUpdatedConfig()
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.TEXTURE_WALL, {
                name: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.TEXTURE_WALL}.name`),
                hint: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.TEXTURE_WALL}.hint`),
                scope: "world",
                config: true,
                type: String,
                filePicker: true,
                default: `modules/${WallDisplayApplication.MODULE_ID}/images/wall.png`,
                onChange: async () => {
                    await this._handleUpdatedConfig()
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.TEXTURE_TERRAIN_WALL, {
                name: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.TEXTURE_TERRAIN_WALL}.name`),
                hint: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.TEXTURE_TERRAIN_WALL}.hint`),
                scope: "world",
                config: true,
                type: String,
                filePicker: true,
                default: `modules/${WallDisplayApplication.MODULE_ID}/images/wall.png`,
                onChange: async () => {
                    await this._handleUpdatedConfig()
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.TEXTURE_ETHERAL_WALL, {
                name: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.TEXTURE_ETHERAL_WALL}.name`),
                hint: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.TEXTURE_ETHERAL_WALL}.hint`),
                scope: "world",
                config: true,
                type: String,
                filePicker: true,
                default: `modules/${WallDisplayApplication.MODULE_ID}/images/wall.png`,
                onChange: async () => {
                    await this._handleUpdatedConfig()
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.TEXTURE_DOOR, {
                name: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.TEXTURE_DOOR}.name`),
                hint: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.TEXTURE_DOOR}.hint`),
                scope: "world",
                config: true,
                type: String,
                filePicker: true,
                default: `modules/${WallDisplayApplication.MODULE_ID}/images/door.png`,
                onChange: async () => {
                    await this._handleUpdatedConfig()
                }
            })
            game.settings.register(WallDisplayApplication.MODULE_ID, Config.SHOW_ANGLED_WALLS, {
                name: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.SHOW_ANGLED_WALLS}.name`),
                hint: game.i18n.localize(`${WallDisplayApplication.MODULE_ID}.settings.${Config.SHOW_ANGLED_WALLS}.hint`),
                scope: "world",
                config: true,
                type: Boolean,
                default: false,
                onChange: async () => {
                    await this._handleUpdatedConfig()
                }
            })
        }

        this._handleUpdatedConfig().then()
    }

}
