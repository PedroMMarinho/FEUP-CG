import { CGFobject, CGFtexture } from '../../../lib/CGF.js';
import { MyTree } from './MyTree.js';

export class MyForest extends CGFobject {
    constructor(scene, rows, cols, treeDensity = 0.5, forestWidth = 50, forestDepth = 50) {
        super(scene);
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.treeDensity = treeDensity;
        
        // Forest area parameters (remain constant)
        this.forestWidth = forestWidth;
        this.forestDepth = forestDepth;
        
        // Calculate spacing between potential tree positions
        this.updateSpacing();
        
        this.forest = [];
        this.treeInstances = [];
        this.foliageColors = [
            { r: 0.2, g: 0.7, b: 0.2 },
            { r: 0.1, g: 0.5, b: 0.1 },
            { r: 0.3, g: 0.8, b: 0.3 },
            { r: 0.1, g: 0.6, b: 0.2 },
        ];
        this.trunkTextures = [];
        this.leafTextures = [];
        this.loadTextures(scene);
        this.populateForest();
    }

    /**
     * Update spacing calculations based on current rows/cols
     */
    updateSpacing() {
        this.xSpacing = this.forestWidth / Math.max(1, this.cols - 1);
        this.zSpacing = this.forestDepth / Math.max(1, this.rows - 1);
        
        // If only one row/col, center it
        if (this.cols === 1) this.xSpacing = this.forestWidth / 2;
        if (this.rows === 1) this.zSpacing = this.forestDepth / 2;
    }

    /**
     * Get the world position for a tree at grid position (row, col)
     */
    getTreeWorldPosition(row, col) {
        let x, z;
        
        if (this.cols === 1) {
            x = this.forestWidth / 2;
        } else {
            x = (col / (this.cols - 1)) * this.forestWidth;
        }
        
        if (this.rows === 1) {
            z = this.forestDepth / 2;
        } else {
            z = (row / (this.rows - 1)) * this.forestDepth;
        }
        
        return { x, z };
    }

    loadTextures(scene) {
        for (let i = 1; i <= 4; i++) {
            this.trunkTextures.push(new CGFtexture(scene, `textures/trunk${i}.jpg`));
            this.leafTextures.push(new CGFtexture(scene, `textures/leaf${i}.jpg`));
        }
    }

    getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    createTreeData(row, col) {
        const tiltDegreesRange = { min: -10, max: 10 };
        const tiltAxisOptions = ['x', 'z'];
        const radiusRange = { min: 0.3, max: 0.6 };
        const heightRange = { min: 6, max: 8 };

        const treeTiltDegrees = this.getRandomInRange(tiltDegreesRange.min, tiltDegreesRange.max);
        const treeTiltAxis = tiltAxisOptions[Math.floor(Math.random() * tiltAxisOptions.length)];
        const trunkRadius = this.getRandomInRange(radiusRange.min, radiusRange.max);
        const treeHeight = this.getRandomInRange(heightRange.min, heightRange.max);
        const selectedColor = this.foliageColors[Math.floor(Math.random() * this.foliageColors.length)];
        const foliageColorRGB = [selectedColor.r, selectedColor.g, selectedColor.b];
        const trunkTexture = this.trunkTextures[Math.floor(Math.random() * this.trunkTextures.length)];
        const leafTexture = this.leafTextures[Math.floor(Math.random() * this.leafTextures.length)];

        // Get base world position for this grid cell
        const worldPos = this.getTreeWorldPosition(row, col);
        
        // Add small random offset within reasonable bounds
        const maxOffset = Math.min(this.xSpacing, this.zSpacing) * 0.2; // 20% of smallest spacing
        const positionOffset = {
            x: this.getRandomInRange(-maxOffset, maxOffset),
            z: this.getRandomInRange(-maxOffset, maxOffset),
        };

        return {
            treeTiltDegrees,
            treeTiltAxis,
            trunkRadius,
            treeHeight,
            foliageColorRGB,
            worldPosition: {
                x: worldPos.x + positionOffset.x,
                z: worldPos.z + positionOffset.z,
            },
            gridPosition: { row, col },
            trunkTexture,
            leafTexture,
        };
    }



    updateForestLines(value) {
        this.rows = Math.max(1, value);
        this.updateSpacing();
        this.populateForest();
    }

    updateForestColumns(value) {
        this.cols = Math.max(1, value);
        this.updateSpacing();
        this.populateForest();
    }

    populateForest() {
        // Clear existing forest
        this.forest = [];
        this.treeInstances = [];

        // Initialize arrays
        for (let i = 0; i < this.rows; i++) {
            this.forest[i] = [];
            this.treeInstances[i] = [];
            
            for (let j = 0; j < this.cols; j++) {
                if (Math.random() < this.treeDensity) {
                    const treeData = this.createTreeData(i, j);
                    this.forest[i][j] = treeData;
                    
                    const tree = new MyTree(
                        this.scene,
                        treeData.treeTiltDegrees,
                        treeData.treeTiltAxis,
                        treeData.trunkRadius,
                        treeData.treeHeight,
                        treeData.foliageColorRGB,
                        treeData.trunkTexture,
                        treeData.leafTexture
                    );
                    this.treeInstances[i][j] = tree;
                } else {
                    this.forest[i][j] = null;
                    this.treeInstances[i][j] = null;
                }
            }
        }
    }

    display() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const tree = this.treeInstances[i][j];
                const treeData = this.forest[i][j];
                
                if (tree && treeData) {
                    this.scene.pushMatrix();
                    this.scene.translate(
                        treeData.worldPosition.x, 
                        0, 
                        treeData.worldPosition.z
                    );
                    tree.display();
                    this.scene.popMatrix();
                }
            }
        }
    }
}