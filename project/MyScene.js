import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { CGFtexture } from "../lib/CGF.js";
import { MyPanorama } from "./objects/panorama/MyPanorama.js";
import { MyBuilding } from "./objects/building/MyBuilding.js";
import { MyForest } from "./objects/forest/MyForest.js";
import { MyHeli } from "./objects/helicopter/MyHeli.js";
import { MyLake } from "./objects/lake/MyLake.js";
import {MySurface} from "./objects/ground_surface/MySurface.js";
import { MySphere } from "./objects/shape_utils/MySphere.js";
import { MyFire } from "./objects/fire/MyFire.js";
import { SoundManager } from "./sound_vfx/SoundManager.js";
import { MyStaticTrees } from "./objects/forest/MyStaticTrees.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }
  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0, 0, 0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

    this.setUpdatePeriod(50);

    // Apply textures
    this.earthTexture = new CGFtexture(this, "textures/earth.jpg");
    this.panoramaTexture = new CGFtexture(this, "textures/panorama1.jpg");
    this.windowTexture = new CGFtexture(this, "textures/window.png");
    this.trunkTexture = new CGFtexture(this, "textures/trunk1.jpg");
    
    //Initialize scene objects
    this.axis = new CGFaxis(this, 20, 1);
    this.plane = new MySurface(this, "textures/grass.jpg", "textures/lake.png", "shaders/surface.vert", "shaders/surface.frag");
    this.skySphere = new MySphere(this, 32, 16);
    this.panorama = new MyPanorama(this, this.panoramaTexture);

    this.centerBuildingFloors = 20;
    this.sideBuildingFloors = 15;
    this.windowsPerFloor = 3;

    this.building = new MyBuilding(
      this,
      30,
      this.centerBuildingFloors,
      this.sideBuildingFloors,
      this.windowsPerFloor,
      this.windowTexture,
      [0.55, 0.63, 0.63, 1.0]
    );
    
    this.forestLines = 25;
    this.forestColumns = 25;

    this.forest = new MyForest(this, this.forestLines, this.forestColumns, 0.3, 150 , 150);
    this.forest2 = new MyForest(this, this.forestLines, this.forestColumns, 0.3, 100 , 100);
    this.forest3 = new MyForest(this, this.forestLines, this.forestColumns, 0.1, 70 , 70);

    this.forests = [this.forest, this.forest2, this.forest3];
    this.forestPositions = [
      [-180, 0, 50],  // Forest 1 position
      [100, 0, 80],    // Forest 2 position
      [120, 0, -80]     // Forest 3 position
    ];
    this.staticTrees = new MyStaticTrees(this);
    this.firePatches = {
      "fire1": { position: [-180, 0, 50], rows: 30, cols: 30, fireDensity: 0.05 },
      "fire2": { position: [100, 0, 80], rows: 20, cols: 20, fireDensity: 0.05 },
      "fire3": { position: [120, 0, -80], rows: 15, cols: 15, fireDensity: 0.05 }
    }
    this.fire = new MyFire(this, this.firePatches, "textures/flame1.png", "shaders/flame.vert", "shaders/flame.frag");
    this.lake = new MyLake(this, "textures/waterTex.jpg", "textures/lake.png", "textures/waterMap.jpg", "shaders/water.vert", "shaders/water.frag");

    this.initSoundEffects();
    
    this.helicopterTakeOffHeight = 8;
    this.helicopter = new MyHeli(this, [0,this.centerBuildingFloors + 3.6,0]);




    // Interface checkbox
    this.displayAxis = false;
    this.displayPlane = true;
    this.displayPanorama = true;
    this.displayBuilding = true;
    this.displayForest = true;
    this.displayHeli = true;
    this.displayLake = true;
    this.displayFire = true; 
    this.enableSoundEffects = true;
    this.displayStaticTrees = true;

    this.speedFactor = 1;


    // Camera settings
    this.followCamera = false;    
    this.cameraDistance = 30;    
    this.cameraHeight = 8;       
    this.cameraLag = 0.1;        

    //anim stuff 
    this.prevKeyStates = {};
    this.setUpdatePeriod(50);
  }

  initSoundEffects() {
    this.soundManager = new SoundManager();
    this.soundManager.loadSound("heli_blade", "sounds/heli_blade.mp3", true, 0.05);
    this.soundManager.loadSound("returning_base", "sounds/returning_base.mp3", false, 0.2);
    this.soundManager.loadSound("helicopter_helicopter", "sounds/helicopter_helicopter.mp3", false, 0.4, 1.0);
    this.soundManager.loadSound("drop-the-bomb-man", "sounds/drop-the-bomb-man.mp3", false, 0.1);
    this.soundManager.loadSound("water-impact", "sounds/water-impact.mp3", false, 0.2);
    this.soundManager.loadSound("water-filling", "sounds/water-filling.mp3", false, 0.1);
    this.soundManager.loadSound("water-full", "sounds/water-full.mp3", false, 0.1);
    this.soundManager.loadSound("fireExtinguished", "sounds/fire-extinguished.mp3", false, 0.1);
}

  onSoundEffectsChanged(value) {
    this.enableSoundEffects = value;
      if (this.soundManager) {
        if (value) {
            this.soundManager.isMuted = false;
        } else {
            this.soundManager.isMuted = true;
            Object.keys(this.soundManager.currentlyPlaying).forEach(soundId => {
                this.soundManager.stop(soundId);
            });
        }
    }
  }

  initLights() {
    this.lights[0].setPosition(200, 200, 200, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }
  
  initCameras() {
    this.freeCamera = new CGFcamera(
      1.0,
      0.1,
      1000,
      vec3.fromValues(50, 50, 50),
      vec3.fromValues(0, 0, 0)
    );
    this.camera = this.freeCamera;
  }
  
  updateFollowCamera() {
    if (!this.followCamera) return;
    
    const heliPos = this.helicopter.pos;
    const heliOrientation = this.helicopter.orientation;
    
    const offsetX = -Math.sin(heliOrientation) * this.cameraDistance;
    const offsetZ = -Math.cos(heliOrientation) * this.cameraDistance;
    
    const lookAheadDistance = 10;
    const targetX = heliPos[0] + Math.sin(heliOrientation) * lookAheadDistance;
    const targetZ = heliPos[2] + Math.cos(heliOrientation) * lookAheadDistance;
    
    const currentPos = this.camera.position;
    
    const newPosX = currentPos[0] + (heliPos[0] + offsetX - currentPos[0]) * this.cameraLag;
    const newPosY = currentPos[1] + (heliPos[1] + this.cameraHeight - currentPos[1]) * this.cameraLag;
    const newPosZ = currentPos[2] + (heliPos[2] + offsetZ - currentPos[2]) * this.cameraLag;
    
    this.camera.setPosition(vec3.fromValues(newPosX, newPosY, newPosZ));
    this.camera.setTarget(vec3.fromValues(targetX, heliPos[1], targetZ));
  }
  
  checkKeys() {
    let justPressed = [];
    let heldDown = [];

    const keyMap = {
        "KeyW": "W",
        "KeyS": "S",
        "KeyA": "A",
        "KeyD": "D",
        "KeyG": "G",
        "KeyR": "R",
        "KeyP": "P",
        "KeyL": "L",
        "KeyO": "O",
        "KeyC": "C",  // Toggle follow camera
    };

    for (const keyCode in keyMap) {
        const key = keyMap[keyCode];
        const isPressed = this.gui.isKeyPressed(keyCode);

        if (isPressed) {
            heldDown.push(key);
            if (!this.prevKeyStates[key]) {
                justPressed.push(key);
            }
        }

        this.prevKeyStates[key] = isPressed;
    }
    return { justPressed, heldDown };
}


  update(t) {
    const currentTime = t / 1000.0; 
    if (this.lastTime === undefined) {
        this.lastTime = currentTime;
        return;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    var { justPressed: keysPressed, heldDown: keysHeld } = this.checkKeys();
    
    this.helicopter.update(t / 100, keysPressed, keysHeld);
    this.lake.update(t) ;
    this.fire.update(t);
    
    if (keysPressed.includes('C')) {
      this.followCamera = !this.followCamera;
      
      if (!this.followCamera) {
        this.camera = this.freeCamera;
      }
    }
    this.building.mainBuilding.update(deltaTime, this.helicopter.state, this.helicopter.landingPhase);
    
    this.updateFollowCamera();
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }

  onHeliTakeOffHeightChanged(value){
    this.helicopterTakeOffHeight = value;
    this.helicopter.updateTakeOffHeight(value);
  }

  onForestColumnsChanged(value){
    this.forestColumns = value;
    this.forest.updateForestColumns(value);
  }
  
  onForestLinesChanged(value){
    this.forestLines = value;
    this.forest.updateForestLines(value);
  }

  onWindowsPerFloorChanged(value){
    this.windowsPerFloor = value;
    this.building.refreshWindowsPerFloor(value);
  }

  onCenterBuildingHeightChanged(value){
    this.centerBuildingFloors = value;
    this.helicopter.updateStartPosition(value + 3.6); 
    this.building.refreshMainBuilding(value);
  }

  onSideBuildingHeightChanged(value){
    this.sideBuildingFloors = value;
    this.building.refreshSideBuildings(value);
  }

  onSpeedFactorChanged(value) {
    this.helicopter.updateSpeedFactor(value);
  }
  
  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.lights[0].update();
    
    // Draw axis
    if (this.displayAxis) this.axis.display();

    this.setDefaultAppearance();

    if (this.displayBuilding) {
      this.building.display();
    }

    if (this.displayPanorama) {
      this.panorama.display();
    }

    if (this.displayBuilding) {
      this.building.display();
    }
    
    if (this.displayForest) {
      for (let i = 0; i < this.forests.length; i++) {
        this.pushMatrix();
        const [x, y, z] = this.forestPositions[i];
        this.translate(x, y, z);
        this.forests[i].display();
        this.popMatrix();
      }
    }

    if(this.displayHeli){
      this.helicopter.display();
    }

    if (this.displayPlane) {
      this.plane.display();
    }

    if(this.displayLake){
      this.lake.display();

    }
    if(this.displayStaticTrees){
      this.staticTrees.display();
    }

    if(this.displayFire){
      this.fire.display();
    }
  }
}