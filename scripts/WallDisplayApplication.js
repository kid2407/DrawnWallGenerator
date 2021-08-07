import {Config} from "./Config.js";

export class WallDisplayApplication {
    static MODULE_ID = 'drawn-wall-generator'
    static _showWallsEW = false
    static _oldLineWidth = 5

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

    static async loadTextures() {
        let textureType = '', texturePath = ''
        let loadedTextures = {}
        try {
            for (let textureTypeKey in Config.TEXTURE_TYPES) {
                if (Config.TEXTURE_TYPES.hasOwnProperty(textureTypeKey)) {
                    textureType = Config.TEXTURE_TYPES[textureTypeKey]
                    texturePath = Config.ACTIVE_CONFIG[textureType]
                    await FilePicker.browse('data', texturePath)
                    loadedTextures[textureType] = new PIXI.Texture.from(texturePath)
                }
            }
            return loadedTextures
        } catch (e) {
            logger.error(e)
            ui.notifications.error(`An error occured while loading the texture for ${textureType} from ${texturePath}: ${e}.`, {permanent: true})
            return false
        }
    }

    /**
     * @param {{c: int[], dir: int, door: int, ds: int, move: int, sense: int, sound: int}} wallData
     * @returns {string}
     */
    static getTextureTypeForWall(wallData) {
        let textureType = Config.TEXTURE_WALL

        if (wallData.door === 1) {
            textureType = Config.TEXTURE_DOOR
        }

        return textureType
    }

    static async toggleShowWallsEverywhere(toggle) {
        let lineWidth = game.settings.get(WallDisplayApplication.MODULE_ID, 'lineThickness')
        let g, coords, wallData, textureType
        let loadedTextures = false
        if (toggle) {
            g = new PIXI.Graphics()
            g.name = "_showWallsEW"
            WallDisplayApplication._oldLineWidth = lineWidth
            loadedTextures = await WallDisplayApplication.loadTextures()
            if (!loadedTextures) {
                return
            }
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
            /** {{c: int[], dir: int, door: int, ds: int, move: int, sense: int, sound: int}} wallData */
            wallData = c.data
            textureType = WallDisplayApplication.getTextureTypeForWall(wallData)
            coords = WallDisplayApplication.adjustLineCoordinates(wallData.c, lineWidth, textureType === Config.TEXTURE_DOOR, !toggle)

            if (toggle) {
                g.beginTextureFill({
                    texture: loadedTextures[textureType]
                }).drawPolygon(coords).endFill()
            }
        })
        if (toggle) {
            canvas.background.addChild(g)
        }
    }
}
