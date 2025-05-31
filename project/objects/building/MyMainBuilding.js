import { CGFobject, CGFappearance, CGFtexture, CGFshader } from "../../../lib/CGF.js"; // Added CGFshader
import { MyUnitCube } from "../shape_utils/MyUnitCube.js";
import { MyWindow } from "./MyWindow.js";
import { MyPlane } from "../shape_utils/MyPlane.js";

export class MyMainBuilding extends CGFobject {
  constructor(
    scene,
    numFloors,
    windowsPerFloor,
    windowTexture,
    buildingColor,
    width
  ) {
    super(scene);
    this.scene = scene;
    this.numFloors = numFloors;
    this.windowsPerFloor = windowsPerFloor;
    this.buildingColor = buildingColor;
    this.width = width;
    this.windowTexture = windowTexture;

    this.unitCube = new MyUnitCube(scene);
    this.door = new MyPlane(scene, 10);
    this.sign = new MyPlane(scene, 10);
    this.helipad = new MyPlane(scene,10,0,1,0,1/3); 


    this.previousHelicopterState = "STATIONARY";
    this.takingOffFromStationary = false;


    // Appearances
    this.doorAppearance = new CGFappearance(scene);
    this.doorAppearance.setTexture(new CGFtexture(scene, "textures/door.jpg"));

    this.signAppearance = new CGFappearance(scene);
    this.signAppearance.setTexture(
      new CGFtexture(scene, "textures/bombeiros.jpg")
    );

    this.helipadTexture = new CGFtexture(scene, "textures/helipad.png");
    

   
    this.helipadAppearance = new CGFappearance(scene);

    this.helipadAppearance.setTexture(this.helipadHTexture); 
    this.helipadAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
    this.helipadAppearance.setAmbient(0.3, 0.3, 0.3, 1);
    this.helipadAppearance.setDiffuse(0.7, 0.7, 0.7, 1);
    this.helipadAppearance.setSpecular(0.1, 0.1, 0.1, 1);
    this.helipadAppearance.setShininess(10.0);


    this.defaultAppearance = new CGFappearance(scene);
    this.defaultAppearance.setAmbient(...buildingColor);
    this.defaultAppearance.setDiffuse(0.6, 0.6, 0.6, 1);
    this.defaultAppearance.setSpecular(0.1, 0.1, 0.1, 1);
    this.defaultAppearance.setShininess(10.0);

    // Lights animation
    this.textureFlashTime = 0;
    this.flashDuration = 0.2; 
    this.initCornerLights();

    this.initWindows();

    // --- Shader Initialization for Helipad ---
    this.helipadShader = new CGFshader(this.scene.gl, "shaders/helipad.vert", "shaders/helipad.frag");
    this.cornerLightShader = new CGFshader(this.scene.gl, "shaders/cornerLight.vert", "shaders/cornerLight.frag");
    this.cornerLightShader.setUniformsValues({ uTime: 0.0, uActive: false });

    
    this.helipadShader.setUniformsValues({ uSampler: 0 });
    
    this.helipadShader.setUniformsValues({ uTextureMode: 0 }); 
    this.helipadShader.setUniformsValues({ uShowAlternateTexture: 0.0 }); 
  }

  initCornerLights() {
    this.cornerLight = new MyUnitCube(this.scene);

    this.cornerLightMaterial = new CGFappearance(this.scene);
    this.cornerLightMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
    this.cornerLightMaterial.setDiffuse(0.8, 0.8, 0.8, 1.0);
    this.cornerLightMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
    this.cornerLightMaterial.setShininess(120);

    this.cornerLightActiveMaterial = new CGFappearance(this.scene);
    this.cornerLightActiveMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
    this.cornerLightActiveMaterial.setDiffuse(1, 0, 0, 1.0); 
    this.cornerLightActiveMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
    this.cornerLightActiveMaterial.setShininess(120);
    this.cornerLightActiveMaterial.setEmission(0,0,0,1); 

    this.pulseTime = 0;
    this.pulseFrequency = 1.5;
    this.activeLights = false;
  }

  refreshBuildingFloors(value) {
    this.numFloors = value;
    this.initWindows();
  }

  refreshWindows(value) {
    this.windowsPerFloor = value;
    this.initWindows();
  }

  initWindows() {
    const totalWindowWidthRatio = 0.4;
    const totalWindowHeightRatio = 0.6;
    const availableWidth = this.width;
    const totalWindowWidth = availableWidth * totalWindowWidthRatio;
    const totalSpacingWidth = availableWidth - totalWindowWidth;
    const spacing = totalSpacingWidth / (this.windowsPerFloor + 1);
    const windowWidth = totalWindowWidth / this.windowsPerFloor;

    this.windowData = [];

    for (let floor = 2; floor <= this.numFloors + 1; floor++) {
      const y = -0.5 + floor;
      for (let i = 0; i < this.windowsPerFloor; i++) {
        const x =
          -this.width / 2 +
          spacing +
          i * (windowWidth + spacing) +
          windowWidth / 2;
        this.windowData.push({
          x,
          y,
          scaleX: windowWidth,
          scaleY: totalWindowHeightRatio,
          window: new MyWindow(this.scene, this.windowTexture),
        });
      }
    }
  }
  displayCornerLights() {
    const s = this.scene;
    const heightPosition = this.numFloors + 1.05; 
    const halfWidth = this.width / 2;
    const offset = 0.05 * this.width; 

    const cornerPositions = [
      [-halfWidth + offset, halfWidth - offset],
      [halfWidth - offset, halfWidth - offset],
      [-halfWidth + offset, -halfWidth + offset],
      [halfWidth - offset, -halfWidth + offset],
    ];
    if (this.activeLights) {
      s.setActiveShader(this.cornerLightShader);
    } else {
      this.cornerLightMaterial.apply();
    }
    for (const [x, z] of cornerPositions) {
      s.pushMatrix();

      

      s.translate(x, heightPosition, z);
      const lightSize = 0.05 * this.width; 
      s.scale(lightSize, lightSize, lightSize);
      this.cornerLight.display();

      s.popMatrix();
    }
    if (this.activeLights) s.setActiveShader(s.defaultShader);

}

  update(deltaTime, helicopterState, landingState) {
    this.textureFlashTime += deltaTime;
    this.pulseTime += deltaTime;


    if (this.previousHelicopterState === "STATIONARY" && helicopterState === "TAKING_OFF") {
    this.takingOffFromStationary = true;
    }
    if (helicopterState !== "TAKING_OFF") {
      this.takingOffFromStationary = false;
    }

    const isTakingOff = helicopterState === "TAKING_OFF" && this.takingOffFromStationary;
    const isLanding =
      helicopterState === "LANDING_BASE" && landingState === "DESCENDING";

    let currentTextureMode = 0; 
    let showAlternate = 0.0;   

    if (isTakingOff || isLanding) {
      showAlternate = (Math.floor(this.textureFlashTime / this.flashDuration) % 2 === 1) ? 1.0 : 0.0;
      
      if (isTakingOff) {
        currentTextureMode = 1; 
      } else { 
        currentTextureMode = 2;
      }
      
      this.activeLights = true;
      const intensity = 0.5 + 0.5 * Math.sin(this.pulseTime * this.pulseFrequency * 2 * Math.PI);
      this.cornerLightActiveMaterial.setEmission(intensity, 0, 0, 1);
      this.cornerLightShader.setUniformsValues({ uActive: true, uTime: this.pulseTime });

    } else {
      currentTextureMode = 0; 
      showAlternate = 0.0;
      this.activeLights = false;
      this.cornerLightActiveMaterial.setEmission(0,0,0,1); 
      this.textureFlashTime = 0;
      this.cornerLightShader.setUniformsValues({ uActive: false, uTime: 0.0 });

    }
    this.helipadShader.setUniformsValues({ uTextureMode: currentTextureMode });
    this.helipadShader.setUniformsValues({ uShowAlternateTexture: showAlternate });

    this.previousHelicopterState = helicopterState;
  }

  display() {
    const s = this.scene;

    // Main Building Body
    s.pushMatrix();
    this.defaultAppearance.apply();
    s.translate(0, (this.numFloors + 1) / 2, 0);
    s.scale(this.width, this.numFloors + 1, this.width);
    this.unitCube.display();
    s.popMatrix();

    // Windows
    for (const { x, y, scaleX, scaleY, window } of this.windowData) {
      s.pushMatrix();
      s.translate(x, y, this.width / 2 + 0.01); 
      s.scale(scaleX, scaleY, 1);
      window.display();
      s.popMatrix();
    }

    // --- Helipad ---
    s.pushMatrix();
    
    this.helipadAppearance.apply(); 

    s.setActiveShader(this.helipadShader);
   
    this.helipadTexture.bind(0);

    s.gl.enable(s.gl.BLEND);
    s.gl.blendFunc(s.gl.SRC_ALPHA, s.gl.ONE_MINUS_SRC_ALPHA);
    s.gl.depthMask(false); 

    s.scale(this.width, 1, this.width);
    s.translate(0, this.numFloors + 1.01, 0);
    s.rotate(-Math.PI / 2, 1, 0, 0);
    this.helipad.display();

    s.gl.depthMask(true); 
    s.gl.disable(s.gl.BLEND); 

    s.setActiveShader(s.defaultShader);

    s.popMatrix();

    // Helipad Lights
    this.displayCornerLights();

    // Door
    s.pushMatrix();
    this.doorAppearance.apply();
    s.translate(0, 0.4, this.width / 2 + 0.01);
    s.scale(0.8, 0.8, 0.8);
    this.door.display();
    s.popMatrix();

    // Sign
    s.pushMatrix();
    this.signAppearance.apply();
    s.translate(0, 1, this.width / 2 + 0.01);
    s.scale(1, 0.2, 0.5);
    this.sign.display();
    s.popMatrix();
  }
}