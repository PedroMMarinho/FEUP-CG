// MyBuilding.js
import { CGFobject } from "../../../lib/CGF.js";
import { MyMainBuilding } from "./MyMainBuilding.js";
import { MySideBuilding } from "./MySideBuilding.js";

export class MyBuilding extends CGFobject { 
    constructor(scene, totalWidth, mainFloors, sideFloors, windowsPerFloor, windowTexture, buildingColor) {
        super(scene);
        this.totalWidth = totalWidth;
        this.mainFloors = mainFloors;
        this.sideFloors = sideFloors;
        this.windowsPerFloor = windowsPerFloor;
        this.windowTexture = windowTexture;
        this.buildingColor = buildingColor;

        this.mainBuildingWidth = totalWidth * 0.4; 
        this.sideBuildingWidth = (totalWidth - this.mainBuildingWidth) / 2; 
        this.sideBuildingDepth = this.mainBuildingWidth * 0.75; 

        this.mainBuilding = new MyMainBuilding(scene, mainFloors, windowsPerFloor, windowTexture, buildingColor, this.mainBuildingWidth);
        this.leftSideBuilding = new MySideBuilding(scene, sideFloors, windowsPerFloor, windowTexture, this.sideBuildingWidth, this.sideBuildingDepth, buildingColor);
        this.rightSideBuilding = new MySideBuilding(scene, sideFloors, windowsPerFloor, windowTexture, this.sideBuildingWidth, this.sideBuildingDepth, buildingColor);
    }

    refreshMainBuilding(value){
        this.mainBuilding.refreshBuildingFloors(value);
    }

    refreshSideBuildings(value){
        this.leftSideBuilding.refreshBuildingFloors(value);
        this.rightSideBuilding.refreshBuildingFloors(value);
    }

    refreshWindowsPerFloor(value){
        this.mainBuilding.refreshWindows(value);
        this.rightSideBuilding.refreshWindows(value);
        this.leftSideBuilding.refreshWindows(value);
    }

    display() {
        const s = this.scene;

        const mainBuildingX = 0;
        const leftSideBuildingX = -this.mainBuildingWidth / 2 - this.sideBuildingWidth / 2;
        const rightSideBuildingX = this.mainBuildingWidth / 2 + this.sideBuildingWidth / 2;

        s.pushMatrix();
        s.translate(mainBuildingX, 0, 0); 
        this.mainBuilding.display();
        s.popMatrix();

        s.pushMatrix();
        s.translate(leftSideBuildingX,0, 0);
        this.leftSideBuilding.display();
        s.popMatrix();

        s.pushMatrix();
        s.translate(rightSideBuildingX, 0, 0); 
        this.rightSideBuilding.display();
        s.popMatrix();
    }
}