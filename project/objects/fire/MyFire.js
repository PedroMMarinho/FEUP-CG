import { CGFobject, CGFtexture, CGFappearance, CGFshader } from '../../../lib/CGF.js';

export class MyFire extends CGFobject{
    /**
     * Represents a single flame object.
     * @param {CGFscene} scene - The scene this flame belongs to.
     * @param {CGFtexture} texture - The texture for the flame.
     * @param {number} height - Height of the flame.
     * @param {number} width - Width of the flame.
     * @param {number} rotation - Rotation angle of the flame in radians.
     */
    constructor(scene, firePatches, texture, vShader, fShader) {
        super(scene);
        this.scene = scene;
        this.firePatches = firePatches;
        this.texture = new CGFtexture(scene, texture);
        this.appearance = new CGFappearance(this.scene);
        this.appearance.setEmission(1.0, 0.5, 0.0, 1.0); 
        this.appearance.setTexture(this.texture);
        this.appearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
        this.shader = new CGFshader(this.scene.gl, vShader, fShader);
        this.shader.setUniformsValues({
            uTime: 0,
        });
        this.createFirePatches(firePatches);
    }
    

    createFirePatches(firePatches) {
        this.fireInstances = [];
        for (const patchKey in firePatches) {
            const patch = firePatches[patchKey];
            const firePatch = new MyFirePatch(
                this.scene, 
                patch.rows, 
                patch.cols, 
                patch.position, 
                patch.fireDensity
            );
            this.fireInstances.push(firePatch);
        }

    }

    display(){
        this.scene.setActiveShader(this.shader);
        this.appearance.apply();

        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        
        this.scene.gl.depthMask(false);
        
        this.scene.gl.disable(this.scene.gl.CULL_FACE);
        
        for (const firePatch of this.fireInstances) {
            firePatch.display();
        }

        this.scene.gl.enable(this.scene.gl.CULL_FACE);
        this.scene.gl.depthMask(true);
        this.scene.gl.disable(this.scene.gl.BLEND);
        
        this.scene.setActiveShader(this.scene.defaultShader);
    }
    
    update(deltaTime) {
        this.shader.setUniformsValues({
            uTime: (deltaTime / 500) % 1000,
        });
    }
}

class MyFlame extends CGFobject {
    /**
     * @param {Object} scene - The scene this flame belongs to
     * @param {Number} height - Height of the flame
     * @param {Number} width - Width of the flame
     * @param {Number} rotation - Rotation angle of the flame
     */
    constructor(scene, height, width, rotation) {
        super(scene);
        this.scene = scene;
        this.height = height;
        this.width = width;
        this.rotation = rotation;
        
        this.initBuffers();
    }
    
    initBuffers() {
        const segments = 5;
        this.vertices = [];
        this.indices = [];
        this.texCoords = [];
        this.normals = [];
        
        for (let i = 0; i <= segments; i++) {
            let y = i / segments;
            this.vertices.push(-0.5, y, 0);
            this.vertices.push( 0.5, y, 0);
        
            this.texCoords.push(0, 1 - y);
            this.texCoords.push(1, 1 - y);
            
            this.normals.push(0, 0, 1);
            this.normals.push(0, 0, 1);
        }
        
        for (let i = 0; i <= segments; i++) {
            let y = i / segments;
            this.vertices.push(-0.5, y, 0);
            this.vertices.push( 0.5, y, 0);
        
            this.texCoords.push(1, 1 - y);  
            this.texCoords.push(0, 1 - y);
            
            this.normals.push(0, 0, -1);
            this.normals.push(0, 0, -1);
        }
        
        for (let i = 0; i < segments; i++) {
            let base = i * 2;
            this.indices.push(base, base + 1, base + 2);
            this.indices.push(base + 1, base + 3, base + 2);
        }
        
        const backOffset = (segments + 1) * 2;
        for (let i = 0; i < segments; i++) {
            let base = backOffset + i * 2;
            this.indices.push(base, base + 2, base + 1); 
            this.indices.push(base + 1, base + 2, base + 3);  
        }
    
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    
    display() { 
        this.scene.pushMatrix();
        
        this.scene.rotate(this.rotation, 0, 1, 0);  
        this.scene.scale(this.width * 2, this.height * 2, 1);  
        super.display();
        
        this.scene.popMatrix();
    }
}

class FlameBatch {
    constructor(scene, height, width, rotation) {
        this.scene = scene;
        this.height = height;
        this.width = width;
        this.rotation = rotation;
        this.positions = [];
        this.flameInstance = new MyFlame(scene, height, width, rotation);
    }
    
    addFlame(position) {
        this.positions.push(position);
    }
    
    display() {
        if (this.positions.length === 0) return;
        
        for (const pos of this.positions) {
            this.scene.pushMatrix();
            this.scene.translate(pos.x, pos.y, pos.z);
            this.flameInstance.display();
            this.scene.popMatrix();
        }
    }
    
    clear() {
        this.positions = [];
    }
    
    getBatchKey() {
        return `${this.height}_${this.width}_${this.rotation}`;
    }
    
    sort() {
        const camera = this.scene.camera;
        if (!camera) return;
        
        this.positions.sort((a, b) => {
            const distA = Math.pow(a.x - camera.position[0], 2) + 
                          Math.pow(a.y - camera.position[1], 2) + 
                          Math.pow(a.z - camera.position[2], 2);
            
            const distB = Math.pow(b.x - camera.position[0], 2) + 
                          Math.pow(b.y - camera.position[1], 2) + 
                          Math.pow(b.z - camera.position[2], 2);
            
            return distB - distA; 
        });
    }
}

class MyFirePatch extends CGFobject {
    /**
     * @param {Object} scene - The scene this fire belongs to
     * @param {Number} rows - Number of rows in the fire grid
     * @param {Number} cols - Number of columns in the fire grid
     * @param {Array} position - [x,y,z] position of the fire
     * @param {Number} fireDensity - Density of flames (0-1)
     */
    constructor(scene, rows, cols, position, fireDensity = 0.5) {
        super(scene);
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.position = position;
        this.fireDensity = fireDensity;
        this.fireSize = 5;
        
        this.active = true;
        this.extinguishPercentage = 0;
        
        // Batching system
        this.flameBatches = new Map();
        this.needsBatchUpdate = true;
        
        //  flame parameters for batching
        this.ROTATION_STEPS = 6;  
        this.HEIGHT_STEPS = 2;    
        this.WIDTH_STEPS = 1;     
        
        this.flameData = Array(rows).fill().map(() => Array(cols).fill(null));
        
        this.populateFire();
        this.updateBatches();
    }
    

    getRotation() {
        const step = Math.floor(Math.random() * this.ROTATION_STEPS);
        return (step * (Math.PI * 2)) / this.ROTATION_STEPS;
    }
    

    getHeight() {
        const heights = [0.8, 1.2]; 
        return heights[Math.floor(Math.random() * heights.length)];
    }
    
    getWidth() {
        const widths = [ 0.35];
        return widths[Math.floor(Math.random() * widths.length)];
    }
    
    /**
     * Calculate the bounding box of the active fire
     * @returns {Object|null} Bounding box or null if fire is inactive
     */
    getBounds() {
        if (!this.active) return null;
        

        const activeFlames = this.getAllFlames();
        if (activeFlames.length === 0) return null;

        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (const flame of activeFlames) {
            const flameWorldCenterX = this.position[0] + flame.data.position.row * this.fireSize;
            const flameWorldCenterZ = this.position[2] + flame.data.position.col * this.fireSize;
            const halfExtent = 0.5 * flame.data.width * this.fireSize;

            minX = Math.min(minX, flameWorldCenterX - halfExtent);
            maxX = Math.max(maxX, flameWorldCenterX + halfExtent);
            minZ = Math.min(minZ, flameWorldCenterZ - halfExtent);
            maxZ = Math.max(maxZ, flameWorldCenterZ + halfExtent);
        }

        const width = maxX - minX;
        const depth = maxZ - minZ;
        const margin = Math.max(width, depth) * 0.05; 

        
        return {
           minX: minX - margin,
            maxX: maxX + margin,
            minZ: minZ - margin,
            maxZ: maxZ + margin

        };
    }
    getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    createFlameData(row, col) {
        const positionOffset = {
            x: this.getRandomInRange(-0.02, 0.02), 
            y: this.getRandomInRange(-0.02, 0.02), 
        };

        return {
            position: { 
                row: row - positionOffset.x, 
                col: col - positionOffset.y 
            },
            height: this.getHeight(),
            width: this.getWidth(),
            rotation: this.getRotation(),
            depth: this.getRandomInRange(0, 0.05), 
            active: true
        };
    }

    populateFire() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (Math.random() < this.fireDensity) {
                    const flameData = this.createFlameData(i, j);
                    this.flameData[i][j] = flameData;
                }
            }
        }
    }
    
    updateBatches() {
        this.flameBatches.clear();
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const data = this.flameData[i][j];
                if (data && data.active) {
                    const batchKey = `${data.height}_${data.width}_${data.rotation}`;
                    
                    if (!this.flameBatches.has(batchKey)) {
                        this.flameBatches.set(batchKey, new FlameBatch(
                            this.scene, 
                            data.height, 
                            data.width, 
                            data.rotation
                        ));
                    }
                    
                    const batch = this.flameBatches.get(batchKey);
                    batch.addFlame({
                        x: data.position.row,
                        y: 0,
                        z: data.position.col
                    });
                }
            }
        }
        
        this.needsBatchUpdate = false;
        
        
    }

    /**
     * Get all active flames
     * @returns {Array} Array of active flame objects
     */
    getAllFlames() {
        const allFlames = [];
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const data = this.flameData[i][j];
                if (data && data.active) {
                    allFlames.push({
                        data: data,
                        rowIdx: i,
                        colIdx: j
                    });
                }
            }
        }
        
        return allFlames;
    }

    /**
     * Extinguish flames within radius of a water drop
     * @param {number} x - X position in world coordinates
     * @param {number} z - Z position in world coordinates
     * @param {number} radius - Effect radius
     * @returns {number} Number of flames extinguished
     */
    extinguishWithWater(x, z, radius) {
        if (!this.active) return 0;
        
        const localX = (x - this.position[0]) / this.fireSize;
        const localZ = (z - this.position[2]) / this.fireSize;
        const scaledRadius = radius / this.fireSize;
        
        let totalActiveFlames = 0;
        let flamesExtinguished = 0;
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.flameData[i][j]?.active) {
                    totalActiveFlames++;
                }
            }
        }
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const data = this.flameData[i][j];
                if (data?.active) {
                    const flameX = data.position.row;
                    const flameZ = data.position.col;
                    
                    const distance = Math.sqrt(
                        Math.pow(flameX - localX, 2) + 
                        Math.pow(flameZ - localZ, 2)
                    );
                    
                    if (distance <= scaledRadius) {
                        data.active = false;
                        flamesExtinguished++;
                    }
                }
            }
        }

        if (totalActiveFlames > 0) {
            const newlyExtinguishedPercent = (flamesExtinguished / totalActiveFlames) * 100;
            this.extinguishPercentage += newlyExtinguishedPercent;
            
            if (this.extinguishPercentage >= 85) {
                this.active = false;
                this.scene.soundManager.play('fireExtinguished');
            } 
        }
        
        if (flamesExtinguished > 0) {
            this.needsBatchUpdate = true;
        }
        
        return flamesExtinguished;
    }

    display() {
        if (!this.active) return;
        
        if (this.needsBatchUpdate) {
            this.updateBatches();
        }
        
        if (this.flameBatches.size === 0) return;

        this.scene.pushMatrix();
        this.scene.translate(this.position[0], this.position[1], this.position[2]);
        this.scene.scale(this.fireSize, this.fireSize, this.fireSize);
        
        for (const batch of this.flameBatches.values()) {
            batch.sort();
            batch.display();
        }
    
        this.scene.popMatrix();
    }
}