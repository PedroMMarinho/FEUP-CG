import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyWindow } from './MyWindow.js';
import { MyUnitCube } from '../shape_utils/MyUnitCube.js';

export class MySideBuilding extends CGFobject {
    constructor(scene, numFloors, windowsPerFloor, windowTexture, width, depth, color) {
        super(scene);
        this.scene = scene;
        this.numFloors = numFloors;
        this.windowsPerFloor = windowsPerFloor;
        this.windowTexture = windowTexture;
        this.width = width;
        this.depth = depth;
        this.color = color;

        this.unitCube = new MyUnitCube(scene);

        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(...color);
        this.appearance.setDiffuse(0.6, 0.6, 0.6, 1);
        this.appearance.setSpecular(0.1, 0.1, 0.1, 1);
        this.appearance.setShininess(10.0);

        this.window = new MyWindow(scene, this.windowTexture); 

        this.windowTransforms = this.computeWindowTransforms();
    }

    refreshBuildingFloors(value){
        this.numFloors = value;
        this.windowTransforms = this.computeWindowTransforms();
    }

    refreshWindows(value){
        this.windowsPerFloor = value;
        this.windowTransforms = this.computeWindowTransforms();
    }

    computeWindowTransforms() {
        const transforms = [];

        const availableWidth = this.width;
        const availableHeight = this.numFloors;
        const numHorizontalSpaces = this.windowsPerFloor + 1;
        const completeFloors = Math.floor(this.numFloors);

        const desiredWindowWidthRatio = 0.4;
        const totalWindowWidth = availableWidth * desiredWindowWidthRatio;
        const totalHorizontalSpacing = availableWidth - totalWindowWidth;
        const windowWidth = totalWindowWidth / this.windowsPerFloor;
        const horizontalSpacing = totalHorizontalSpacing / numHorizontalSpaces;

        const floorHeight = availableHeight / this.numFloors;
        const desiredWindowHeightRatio = 0.6;
        const totalWindowHeightPerFloor = floorHeight * desiredWindowHeightRatio;
        const totalVerticalSpacingPerFloor = floorHeight - totalWindowHeightPerFloor;
        const windowHeight = totalWindowHeightPerFloor;
        const verticalSpacing = totalVerticalSpacingPerFloor / (2 + 1);

        const depthOffset = this.depth / 2 + 0.01;

        for (let floor = 0; floor < completeFloors; floor++) {
            const y = verticalSpacing + floor * floorHeight + windowHeight / 2;

            for (let i = 0; i < this.windowsPerFloor; i++) {
                const x = -availableWidth / 2 + horizontalSpacing + i * (windowWidth + horizontalSpacing) + windowWidth / 2;

                transforms.push({
                    x, y, z: depthOffset,
                    scaleX: windowWidth,
                    scaleY: windowHeight
                });
            }
        }

        return transforms;
    }

    display() {
        const s = this.scene;

        s.pushMatrix();
        this.appearance.apply();
        s.translate(0, this.numFloors / 2, 0);
        s.scale(this.width, this.numFloors, this.depth);
        this.unitCube.display();
        s.popMatrix();

        for (const t of this.windowTransforms) {
            s.pushMatrix();
            s.translate(t.x, t.y, t.z);
            s.scale(t.scaleX, t.scaleY, 1);
            this.window.display();
            s.popMatrix();
        }
    }
}
