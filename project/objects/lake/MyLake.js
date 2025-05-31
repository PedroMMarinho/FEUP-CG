import { CGFobject, CGFappearance, CGFshader, CGFtexture } from "../../../lib/CGF.js";
import { MyPlane } from "../shape_utils/MyPlane.js";

export class MyLake extends CGFobject {
    constructor(scene, waterTexture, heightMap ,noiseTexture, vertexShader, fragmentShader) {
        super(scene);
        this.water = new MyPlane(scene, 64);
        this.scene = scene;
        this.waterTexture = new CGFtexture(scene, waterTexture);
        this.noiseTexture = new CGFtexture(scene, noiseTexture);
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        
        this.loadHeightMapMask(heightMap);
        
        this.init();
    }

    loadHeightMapMask(heightMapPath) {
        const image = new Image();
        image.crossOrigin = "";
        image.src = heightMapPath;
    
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this.generateLakeMask(imageData);
        };
    
        image.onerror = () => {
            console.error("Failed to load height map image:", heightMapPath);
        };
    }
    
    generateLakeMask(imageData) {
        const { width, height, data } = imageData;
    
        this.initBoundaries(width, height);
    
        this.maskResolution = 100; 
        this.lakeMask = [];
    
        for (let i = 0; i < this.maskResolution; i++) {
            this.lakeMask[i] = [];
            for (let j = 0; j < this.maskResolution; j++) {
                const x = -300 + (i + 0.5) * (600 / this.maskResolution);
                const z = -300 + (j + 0.5) * (600 / this.maskResolution);
    
                const u = Math.floor((x + 300) / 600 * width);
                const v = Math.floor((z + 300) / 600 * height);
    
                const index = (v * width + u) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                const val = (r + g + b) / 3;    
    
                this.lakeMask[i][j] = val;
            }
        }
    }
    
    

    init() {
        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(0.0, 0.0, 0.0, 1);
        this.material.setDiffuse(0.0, 0.0, 0.0, 1);
        this.material.setSpecular(0.0, 0.0, 0.0, 1);
        this.material.setShininess(10.0);
        this.material.setTexture(this.waterTexture);
        this.material.setTextureWrap('REPEAT', 'REPEAT');
        
        this.shader = new CGFshader(this.scene.gl, this.vertexShader, this.fragmentShader);
        this.shader.setUniformsValues({
            uSampler: 0,
            uSampler2: 1,
            timeFactor: 0,
            uAmbient: [0.3, 0.3, 0.3, 1.0],   
            uDiffuse: [0.6, 0.6, 0.6, 1.0],   
            uSpecular: [0.3, 0.3, 0.3, 1.0], 
            uShininess: 50.0,               
            uLightPosition: [200.0, 200.0, 200.0],
            uLightColor: [1.0, 1.0, 1.0, 1.0],
        });
    }

    initBoundaries( imageWidth = 600, imageHeight = 600) {
        this.mapWidth = imageWidth;
        this.mapHeight = imageHeight;
    
        this.boundaries = {
            minX: -300,
            maxX: 300,
            minZ: -300,
            maxZ: 300,
            y: -5
        };
    }

    display() {
        const previousShader = this.scene.activeShader;
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        this.scene.setActiveShader(this.shader);
    
        this.waterTexture.bind(0);
        this.noiseTexture.bind(1);
    
        this.material.apply();
    
        this.scene.pushMatrix();
    
        const tilesPerSide = 10; 
        const tileSize = 600 / tilesPerSide;
        const mat4 = this.scene.gl.matrix || this.scene.gl.mat4 || window.mat4; 
        this.scene.translate(0, -5, 0); 
        this.scene.scale(1, 1, 1); 
    
        for (let i = 0; i < tilesPerSide; i++) {
            for (let j = 0; j < tilesPerSide; j++) {

                const maskX = Math.floor(i / tilesPerSide * this.maskResolution);
                const maskZ = Math.floor(j / tilesPerSide * this.maskResolution);
                if (!this.isLakeTile(i, j, tilesPerSide, this.lakeMask, this.maskResolution)) continue;
                

                this.scene.pushMatrix();
    
                const x = -300 + tileSize / 2 + i * tileSize;
                const z = -300 + tileSize / 2 + j * tileSize;
    
                this.scene.translate(x, 0, z);
                this.scene.scale(tileSize, 1, tileSize);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);

                const modelMatrix = mat4.create();
                mat4.translate(modelMatrix, modelMatrix, [x, 0, z]);
                mat4.scale(modelMatrix, modelMatrix, [tileSize, 1, tileSize]);
                mat4.rotate(modelMatrix, modelMatrix, -Math.PI / 2, [1, 0, 0]); 
                
                this.shader.setUniformsValues({
                uModelMatrix: modelMatrix 
                });
                this.water.display();
    
                this.scene.popMatrix();
            }
        }
    
        this.scene.popMatrix();
        this.scene.setActiveShader(previousShader);
        this.scene.gl.disable(this.scene.gl.BLEND);

    }
    

    update(deltaTime) {
        this.shader.setUniformsValues({ 
            timeFactor: deltaTime / 100 % 1000,
            helicopterPosition: this.scene.helicopter.pos,
            helicopterAltitude: this.scene.helicopter.pos[1],
        });
    }

    isInLake(x, z) {
        if (!this.lakeMask) return false;
    
        const { minX, maxX, minZ, maxZ } = this.boundaries;
        if (x < minX || x > maxX || z < minZ || z > maxZ) return false;
    
        const i = Math.floor((x - minX) / (maxX - minX) * this.maskResolution);
        const j = Math.floor((z - minZ) / (maxZ - minZ) * this.maskResolution);
    
        return this.lakeMask?.[i]?.[j] === 0;
    }

    getHeight() {   
        return this.boundaries.y;
    }

    isLakeTile(i, j, tilesPerSide, mask, maskRes) {
        const checkPoints = [
            [i, j],
            [i + 1/ 2, j],
            [i + 1, j],
            [i, j + 1],
            [i , j + 1/ 2],
            [i + 1/2, j + 1],
            [i + 1, j + 1/2],
            [i + 1/2, j + 1/2],
            [i + 1, j + 1]
        ];
    
        for (const [ti, tj] of checkPoints) {
            const maskX = Math.floor(ti * maskRes / tilesPerSide);
            const maskZ = Math.floor(tj * maskRes / tilesPerSide);
            if (mask?.[maskX]?.[maskZ] === 0) return true;
        }
        return false;
    }
    
}