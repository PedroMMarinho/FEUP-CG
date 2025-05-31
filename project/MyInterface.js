import { CGFinterface, dat } from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        super.init(application);

        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();
        
        // === DISPLAY CONTROLS ===
        const displayFolder = this.gui.addFolder('Display Controls');
        displayFolder.add(this.scene, 'displayAxis').name('Display Axis');
        displayFolder.add(this.scene, 'displayPlane').name('Display Plane');
        displayFolder.add(this.scene, 'displayPanorama').name('Display Panorama');
        displayFolder.add(this.scene, 'displayBuilding').name('Display Building');
        displayFolder.add(this.scene, 'displayForest').name('Display Forest');
        displayFolder.add(this.scene, 'displayHeli').name('Display Helicopter');
        displayFolder.add(this.scene, 'displayLake').name('Display Lake');
        displayFolder.add(this.scene, 'displayFire').name('Display Fire');
        displayFolder.add(this.scene, 'displayStaticTrees').name('Display Static Trees');

        displayFolder.open(); // Keep this section open by default
        
        // === BUILDING CONFIGURATION ===
        const buildingFolder = this.gui.addFolder('Building Configuration');
        buildingFolder.add(this.scene, 'centerBuildingFloors', 5, 25).step(1).onChange(this.scene.onCenterBuildingHeightChanged.bind(this.scene)).name('Center Building Floors');
        buildingFolder.add(this.scene, 'sideBuildingFloors', 5, 25).step(1).onChange(this.scene.onSideBuildingHeightChanged.bind(this.scene)).name('Side Building Floors');
        buildingFolder.add(this.scene, 'windowsPerFloor', 2 , 20).step(1).onChange(this.scene.onWindowsPerFloorChanged.bind(this.scene)).name('Building Windows');
        
        // === FOREST CONFIGURATION ===
        const forestFolder = this.gui.addFolder('Forest Configuration');
        forestFolder.add(this.scene, 'forestLines', 2 , 80).step(1).onChange(this.scene.onForestLinesChanged.bind(this.scene)).name('Forest Lines');
        forestFolder.add(this.scene, 'forestColumns', 2 , 80).step(1).onChange(this.scene.onForestColumnsChanged.bind(this.scene)).name('Forest Columns');
        
        // === HELICOPTER CONTROLS ===
        const helicopterFolder = this.gui.addFolder('Helicopter Controls');
        helicopterFolder.add(this.scene, 'helicopterTakeOffHeight', 0, 20).step(1).onChange(this.scene.onHeliTakeOffHeightChanged.bind(this.scene)).name('Take Off Height');
        helicopterFolder.add(this.scene, 'speedFactor', 0.1, 3).onChange(this.scene.onSpeedFactorChanged.bind(this.scene)).name('Speed Factor');
        
        // === AUDIO SETTINGS ===
        const audioFolder = this.gui.addFolder('Audio Settings');
        audioFolder.add(this.scene, 'enableSoundEffects').onChange(this.scene.onSoundEffectsChanged.bind(this.scene)).name('Enable Sound Effects');
        
        this.initKeys();

        return true;
    }

    initKeys() {
        this.scene.gui = this;

        this.processKeyboard = function () { };

        this.activeKeys = {};
    }
    
    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}