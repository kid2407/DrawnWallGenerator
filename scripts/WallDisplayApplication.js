import {Config} from "./Config.js";

export class WallDisplayApplication {
    static MODULE_ID = 'drawn-wall-generator'

    /**
     * @param {int[]} coords
     * @param {int} lineWidth
     * @param {int} doorWidth
     * @param {boolean} isDoor
     * @param {boolean} reverse
     * @returns {int[]}
     */
    static adjustLineCoordinates(coords, lineWidth, doorWidth, isDoor, reverse = false) {
        let finalCoordinates = []
        let lineWidthHalved = lineWidth / 2
        let doorWidthHalved = doorWidth / 2
        let wallDirection = coords[0] === coords[2] ? 'vertical' : (coords[1] === coords[3] ? 'horizontal' : 'neither')

        if (wallDirection === 'vertical' || (wallDirection === 'neither' && Config.ACTIVE_CONFIG[Config.SHOW_ANGLED_WALLS])) {
            if (coords[1] < coords[3] && !isDoor) {
                coords[1] = coords[1] - (lineWidthHalved) * (reverse ? -1 : 1)
                coords[3] = coords[3] + (lineWidthHalved) * (reverse ? -1 : 1)
            } else {
                coords[1] = coords[1] + (lineWidthHalved) * (reverse ? -1 : 1)
                coords[3] = coords[3] - (lineWidthHalved) * (reverse ? -1 : 1)
            }
            finalCoordinates.push(coords[0] - (isDoor ? doorWidthHalved : (isDoor ? doorWidthHalved : lineWidthHalved)), coords[1], coords[0] + (isDoor ? doorWidthHalved : lineWidthHalved), coords[1], coords[2] + (isDoor ? doorWidthHalved : lineWidthHalved), coords[3], coords[2] - (isDoor ? doorWidthHalved : lineWidthHalved), coords[3])
        } else if (wallDirection === 'horizontal') {
            if (coords[0] < coords[2] && !isDoor) {
                coords[0] = coords[0] - (lineWidthHalved) * (reverse ? -1 : 1)
                coords[2] = coords[2] + (lineWidthHalved) * (reverse ? -1 : 1)
            } else {
                coords[0] = coords[0] + (lineWidthHalved) * (reverse ? -1 : 1)
                coords[2] = coords[2] - (lineWidthHalved) * (reverse ? -1 : 1)
            }
            finalCoordinates.push(coords[0], coords[1] - (isDoor ? doorWidthHalved : lineWidthHalved), coords[0], coords[1] + (isDoor ? doorWidthHalved : lineWidthHalved), coords[2], coords[3] + (isDoor ? doorWidthHalved : lineWidthHalved), coords[2], coords[3] - (isDoor ? doorWidthHalved : lineWidthHalved))
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
                    if (texturePath !== '') {
                        await FilePicker.browse('data', texturePath)
                        loadedTextures[textureType] = new PIXI.Texture.from(texturePath)
                    } else {
                        loadedTextures[textureType] = null
                    }
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
     * @returns {string|false}
     */
    static getTextureTypeForWall(wallData) {
        if (wallData.door === 1) {
            return Config.TEXTURE_DOOR
        } else if (wallData.move === 1 && wallData.sense === 1 && wallData.sound === 1) {
            return Config.TEXTURE_WALL
        } else if (wallData.move === 1 && wallData.sense === 2 && wallData.sound === 1) {
            return Config.TEXTURE_TERRAIN_WALL
        } else if (wallData.move === 0 && wallData.sense === 2 && wallData.sound === 1) {
            return Config.TEXTURE_ETHERAL_WALL
        } else if (wallData.move === 1 && wallData.sense === 0 && wallData.sound === 1) {
            return Config.TEXTURE_INVISIBLE_WALL
        }

        return false
    }

    /**
     * Removes the old tile, if present.
     *
     * @private
     */
    static async _removeOldWallTile() {
        let fittingTiles = canvas.scene.tiles.filter(t => t.getFlag(this.MODULE_ID, 'generated') === true);
        if (fittingTiles.length > 0) {
            await fittingTiles[0].delete()
        }
    }

    static async generateWallTile() {
        await this._removeOldWallTile()

        let lineWidth = game.settings.get(WallDisplayApplication.MODULE_ID, Config.LINE_THICKNESS)
        let doorWidth = game.settings.get(WallDisplayApplication.MODULE_ID, Config.DOOR_THICKNESS)
        let g, wallData, textureType, rotationMatrix, coords, rawCoords
        let loadedTextures = false
        g = new PIXI.Graphics()
        g.name = "_innerGeneratedWalls"
        loadedTextures = await WallDisplayApplication.loadTextures()
        if (!loadedTextures) {
            return
        }

        let minX = Infinity
        let minY = Infinity
        let leftmostPoint
        let topmostPoint

        // noinspection JSValidateTypes
        /** @var {Wall[]} placeables */
        let placeables = canvas.walls.placeables
        placeables.forEach((c) => {
            /** {{c: int[], dir: int, door: int, ds: int, move: int, sense: int, sound: int}} wallData */
            wallData = c.data
            rawCoords = wallData.c
            textureType = WallDisplayApplication.getTextureTypeForWall(wallData)
            if (textureType && loadedTextures[textureType] !== null) {
                leftmostPoint = rawCoords[0] < rawCoords[2] ? rawCoords[0] : rawCoords[2]
                topmostPoint = rawCoords[1] < rawCoords[3] ? rawCoords[1] : rawCoords[3]
                if (leftmostPoint < minX) minX = leftmostPoint;
                if (topmostPoint < minY) minY = topmostPoint;

                coords = WallDisplayApplication.adjustLineCoordinates(rawCoords, lineWidth, doorWidth, textureType === Config.TEXTURE_DOOR)

                rotationMatrix = new PIXI.Matrix();
                rotationMatrix.rotate(Math.atan2(coords[3] - coords[1], coords[2] - coords[0]) + Math.PI / 2);
                g.beginTextureFill({
                    texture: loadedTextures[textureType],
                    matrix: rotationMatrix
                }).drawPolygon(coords).endFill()
            }
        })

        canvas.background.addChild(g)
        let target = canvas.background.children.find(c => c.name === '_innerGeneratedWalls')
        let container = new PIXI.Container()
        container.addChild(target)

        let tiles = await canvas.scene.createEmbeddedDocuments('Tile', [{
            img: await canvas.app.renderer.extract
                .base64(container, "image/webp", 0.1)
                .replace("webp", "png"),
            height: container.height,
            width: container.width,
            x: minX - lineWidth / 2,
            y: minY - lineWidth / 2
        }])

        await tiles[0].setFlag(this.MODULE_ID, 'generated', true)
    }
}
