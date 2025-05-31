import { CGFobject, CGFappearance, CGFtexture } from "../../../lib/CGF.js";
import { MyCylinder } from "../shape_utils/MyCylinder.js";
import { MyCircle } from "../shape_utils/MyCircle.js";
import { MyPlane } from "../shape_utils/MyPlane.js";
import {
  vertices,
  normals,
  texCoords,
  indices,
  materials,
  objectGroups,
} from "../../scripts/heli.js";

/**
 * MyHeliPart - Component for a part of the helicopter with specific material
 */
class MyHeliPart extends CGFobject {
  constructor(
    scene,
    vertices,
    normals,
    texCoords,
    indices,
    material,
    objectName
  ) {
    super(scene);
    this.objectName = objectName;
    this.vertices = vertices;
    this.normals = normals;
    this.texCoords = texCoords;
    this.indices = indices;
    this.material = material;
    this.centroid = this.getCentroid();
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  getCentroid() {
    let sumX = 0,
      sumY = 0,
      sumZ = 0;
    const numVerts = this.vertices.length / 3;

    for (let i = 0; i < this.vertices.length; i += 3) {
      sumX += this.vertices[i];
      sumY += this.vertices[i + 1];
      sumZ += this.vertices[i + 2];
    }

    return [sumX / numVerts, sumY / numVerts, sumZ / numVerts];
  }

  display() {
    this.material.apply();
    super.display();
  }
}

const HeliState = {
  STATIONARY: "STATIONARY",
  TAKING_OFF: "TAKING_OFF",
  FLYING: "FLYING",
  LANDING_BASE: "LANDING_BASE",
  LANDING_WATER: "LANDING_WATER",
  WATER_LANDED: "WATER_LANDED",
};

const LandingPhase = {
  ROTATING: "ROTATING",
  POSITIONING: "POSITIONING",
  RETRACTING: "RETRACTING",
  DESCENDING: "DESCENDING",
};

/**
 * MyHeli - Main Helicopter Object using Components
 * @constructor
 * @param scene - Reference to MyScene object
 * @param initialPos - Array [x, y, z] for initial position
 */
export class MyHeli extends CGFobject {
  constructor(scene, initialPos = [0, 0, 0]) {
    super(scene);

    // Basic properties
    this.scene = scene;
    this.initialPos = [...initialPos];
    this.pos = [...initialPos];
    this.parts = [];
    this.textures = {};
    this.state = HeliState.STATIONARY;
    this.speedFactor = 1;

    this.initMovementParameters();

    this.initAnimationParameters();

    this.initBucketParameters();

    this.landingPhase = null;


    this.initSoundEffects();

    this.initMaterials();
    this.initParts();
    this.initWaterDropEffect();

    this.calculateBucketOffsets();
  }

  getWaterPercentage() {
    return Math.round((this.currentWaterAmount / this.waterCapacity) * 100);
  }

  updateTakeOffHeight(newHeight) {
    this.takeOff_offset = newHeight;
  }

  calculateBucketOffsets() {
    const bucketBodyPart = this.parts.find(
      (part) => part.groupName === "BucketBody"
    );

    if (!bucketBodyPart) {
      this.bucketBottomOffset = -2.0;
      return;
    }

    let minY = Infinity;

    for (let i = 1; i < bucketBodyPart.vertices.length; i += 3) {
      minY = Math.min(minY, bucketBodyPart.vertices[i]);
    }

    this.bucketBottomOffset = minY;
  }

  initWaterDropEffect() {
    this.waterDropMaterial = new CGFappearance(this.scene);
    this.waterDropMaterial.setAmbient(0.1, 0.4, 0.8, 0.7);
    this.waterDropMaterial.setDiffuse(0.1, 0.4, 0.8, 0.7);
    this.waterDropMaterial.setSpecular(0.5, 0.9, 1.0, 0.7);
    this.waterDropMaterial.setShininess(120);

    this.waterDropMaterial.setTexture(this.waterTexture);

    this.waterStream = new MyCylinder(this.scene, 8, 1, 1, true);
    this.waterSplash = new MyPlane(this.scene, 20);

     
    this.waterDropActive = false;
    this.waterHitGround = false;
    this.waterDropProgress = 0;
    this.waterDropSpeed = 0.6;
    this.waterDropDuration = 4.0;
    

    this.targetFirePosition = null;
    this.targetFires = [];
  }

  initMovementParameters() {
    this.orientation = 0;
    this.velocity = [0, 0, 0];
    this.prevTime = 0;
    this.takeOff_offset = this.scene.helicopterTakeOffHeight;

    this.maxVelocity = 5.0;
    this.acceleration = 0.05;
    this.backwardAcceleration = 0.03;
    this.turnAcceleration = 1.0;
    this.brakeForce = 0.2;
    this.frictionCoefficient = 0.02;
  }

  /**
   * Initialize animation parameters
   */
  initAnimationParameters() {
    this.motorOn = false;
    this.mainRotorAngle = 0;
    this.sideRotorAngle = 0;

    this.pitchAngle = 0;
    this.maxPitchAngle = 0.25;
    this.pitchSpeed = 0.2;
    this.pitchRecoverySpeed = 0.1;
  }

  /**
   * Initialize bucket parameters
   */
  initBucketParameters() {
    this.bucketExtended = false;
    this.bucketAnimationProgress = 0;
    this.bucketAnimationSpeed = 0.4;
    this.bucketAnimationInProgress = false;

    this.bucketBottomOpen = false;
    this.bucketBottomAnimationProgress = 0;
    this.bucketBottomAnimationSpeed = 1.0;
    this.bucketBottomAnimationInProgress = false;

    this.waterCapacity = 50;
    this.currentWaterAmount = 0;
    this.waterFillRate = 1;
    this.waterFilled = false;
    this.waterFillStarted = false;
    this.radiusPerWaterUnit = 0.8;
    this.baseRadiusWater = 5;
  }

  /**
   * Initialize sound effects
   */
  initSoundEffects() {
    this.soundStates = {
      blade: {
        bladeVolume: 0.05,
        fadingOut: false,
      },
      waterFilling: {
        playbackPosition: 0,
        lastUpdateTime: 0,
        playing: false,
      },
    };
  }

  /**
   * Initialize materials from MTL data
   */
  initMaterials() {
    this.cgfMaterials = {};

    if (!materials) return;

    const textureBasePath = "textures/";

    for (const materialName in materials) {
      const mtlData = materials[materialName];
      const material = new CGFappearance(this.scene);

      this.applyMaterialProperties(material, mtlData);

      this.loadMaterialTextures(
        material,
        materialName,
        mtlData,
        textureBasePath
      );

      this.cgfMaterials[materialName] = material;
    }

    this.initWaterMaterial();
  }

  /**
   * Apply material properties from MTL data
   */
  applyMaterialProperties(material, mtlData) {
    if (mtlData.ambient) {
      material.setAmbient(...mtlData.ambient);
    }

    if (mtlData.diffuse) {
      material.setDiffuse(...mtlData.diffuse);
    }

    if (mtlData.specular) {
      material.setSpecular(...mtlData.specular);
    }

    if (mtlData.shininess) {
      material.setShininess(mtlData.shininess);
    }

    if (mtlData.transparency !== undefined && mtlData.transparency < 1.0) {
      const diffuse = [...mtlData.diffuse];
      diffuse[3] = mtlData.transparency;
      material.setDiffuse(...diffuse);
    }
  }

  /**
   * Load textures for materials
   */
  loadMaterialTextures(material, materialName, mtlData, textureBasePath) {
    if (!mtlData.textures || Object.keys(mtlData.textures).length === 0) {
      return;
    }

    if (mtlData.textures.kd) {
      try {
        const texturePath = textureBasePath + mtlData.textures.kd;
        this.textures[materialName] = new CGFtexture(this.scene, texturePath);
        material.setTexture(this.textures[materialName]);
        material.setTextureWrap("REPEAT", "REPEAT");
      } catch (e) {
        console.warn(`Failed to load texture for material ${materialName}:`, e);
      }
    }
  }

  /**
   * Initialize water material for bucket
   */
  initWaterMaterial() {
    this.waterMaterial = new CGFappearance(this.scene);
    this.waterMaterial.setAmbient(0.1, 0.4, 0.8, 0.9);
    this.waterMaterial.setDiffuse(0.1, 0.4, 0.8, 0.9);
    this.waterMaterial.setSpecular(0.5, 0.9, 1.0, 0.9);
    this.waterMaterial.setShininess(120);

    this.waterTexture = new CGFtexture(this.scene, "textures/waterTex.jpg");
    this.waterMaterial.setTexture(this.waterTexture);
    this.waterMaterial.setTextureWrap("REPEAT", "REPEAT");

    this.waterPlane = new MyCircle(this.scene, 20);
  }

  /**
   * Update water surface material based on fill percentage
   */
  updateWaterSurfaceMaterial(fillPercentage) {
    const blueIntensity = 0.4 + fillPercentage * 0.2;
    this.waterMaterial.setAmbient(0.1, 0.3, blueIntensity, 0.9);
    this.waterMaterial.setDiffuse(0.1, 0.3, blueIntensity, 0.9);
  }
  updateStartPosition(newPosY) {
    this.initialPos[1] = newPosY;
    this.pos[1] = newPosY;
  }

  getBucketBottomPosition() {
    const bucketBottom = this.parts.find(
      (part) => part.groupName === "BucketBottom"
    );

    if (!bucketBottom) {
      console.warn("Bucket bottom part not found");
      return (
        this.pos[1] +
        this.bucketBottomOffset +
        (1 - this.bucketAnimationProgress) * 2
      );
    }

    const bottomYOffset = (1 - this.bucketAnimationProgress) * 2;
    return this.pos[1] + bucketBottom.centroid[1] + bottomYOffset;
  }

  /**
   * Display water in the bucket when filled
   */
  displayWaterInBucket() {
    if (this.currentWaterAmount <= 0 || !this.bucketExtended) {
      return;
    }
    const bucketBottom = this.parts.find(
      (part) => part.groupName === "BucketBottom"
    );
    const bucketBody = this.parts.find(
      (part) => part.groupName === "BucketBody"
    );

    if (!bucketBottom || !bucketBody) {
      return;
    }

    const fillPercentage = this.currentWaterAmount / this.waterCapacity;

    this.updateWaterSurfaceMaterial(fillPercentage);

    this.waterMaterial.apply();

    this.scene.pushMatrix();

    const bucketYOffset = (1 - this.bucketAnimationProgress) * 2;

    const bucketDimensions = this.calculateBucketDimensions(bucketBody);
    const bucketBottomDimensions = this.calculateBucketDimensions(bucketBottom);

    const minScale =
      Math.min(bucketBottomDimensions.width, bucketBottomDimensions.depth) *
      0.85;
    const maxScale =
      Math.min(bucketDimensions.width, bucketDimensions.depth) * 0.85;

    const fillScaleFactor = Math.min(1.0, fillPercentage);
    const currentScale = minScale + fillScaleFactor * (maxScale - minScale);

    const bucketBottomY = this.getLowestPoint(bucketBottom);
    const bucketHeight = this.getHeightOfPart(bucketBody);

    const baseHeight = bucketBottomY + 0.08;
    const maxRise = bucketHeight * 0.4;
    const waterHeight = baseHeight + fillPercentage * maxRise;

    const centerX = bucketBottomDimensions.centerX;
    const centerZ = bucketBottomDimensions.centerZ;

    this.scene.translate(centerX, bucketYOffset + waterHeight, centerZ);
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);

    const waterScaleX = currentScale;
    const waterScaleZ = currentScale;
    this.scene.scale(waterScaleX, waterScaleZ, 1);

    this.waterPlane.display();

    this.scene.popMatrix();
  }

  /**
   * Calculate dimensions of a bucket part
   */
  calculateBucketDimensions(part) {
    if (!part || !part.vertices) {
      console.warn("Invalid part data");
      return { width: 0.7, depth: 0.7, height: 2 };
    }

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < part.vertices.length; i += 3) {
      const x = part.vertices[i];
      const y = part.vertices[i + 1];
      const z = part.vertices[i + 2];

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }

    return {
      width: maxX - minX,
      height: maxY - minY,
      depth: maxZ - minZ,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      centerZ: (minZ + maxZ) / 2,
    };
  }

  /**
   * Get the lowest Y point of a part
   */
  getLowestPoint(part) {
    if (!part || !part.vertices) {
      console.warn("Invalid part data");
      return 0;
    }

    let minY = Infinity;

    for (let i = 1; i < part.vertices.length; i += 3) {
      const y = part.vertices[i];
      minY = Math.min(minY, y);
    }

    return minY;
  }

  /**
   * Get the height of a part
   */
  getHeightOfPart(part) {
    if (!part || !part.vertices) {
      console.warn("Invalid part data");
      return 2;
    }

    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 1; i < part.vertices.length; i += 3) {
      const y = part.vertices[i];
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    return maxY - minY;
  }

  initParts() {
    if (!objectGroups || !vertices || !normals || !texCoords || !indices)
      return;

    for (const groupName in objectGroups) {
      const group = objectGroups[groupName];

      for (const materialName in group.materials) {
        const material = this.cgfMaterials[materialName];

        if (!material) continue;

        for (const range of group.materials[materialName]) {
          this.createPartFromRange(groupName, material, range);
        }
      }
    }
  }

  /**
   * Create a helicopter part from a specific index range
   */
  createPartFromRange(groupName, material, range) {
    const { startIndex, count } = range;

    const partIndices = indices.slice(startIndex, startIndex + count);

    const usedVertices = new Set();
    for (let i = 0; i < partIndices.length; i++) {
      usedVertices.add(partIndices[i]);
    }

    const vertexMap = {};
    const partVertices = [];
    const partNormals = [];
    const partTexCoords = [];

    let newIndex = 0;
    for (const oldIndex of usedVertices) {
      vertexMap[oldIndex] = newIndex;

      for (let i = 0; i < 3; i++) {
        partVertices.push(vertices[oldIndex * 3 + i]);
      }

      for (let i = 0; i < 3; i++) {
        partNormals.push(normals[oldIndex * 3 + i]);
      }

      for (let i = 0; i < 2; i++) {
        partTexCoords.push(texCoords[oldIndex * 2 + i]);
      }

      newIndex++;
    }

    const remappedIndices = [];
    for (let i = 0; i < partIndices.length; i++) {
      remappedIndices.push(vertexMap[partIndices[i]]);
    }

    const part = new MyHeliPart(
      this.scene,
      partVertices,
      partNormals,
      partTexCoords,
      remappedIndices,
      material,
      groupName
    );

    part.groupName = groupName;
    this.parts.push(part);
  }

  /**
   * Display the helicopter
   */
  display() {
    this.scene.pushMatrix();

    this.scene.translate(...this.pos);
    this.scene.rotate(this.orientation, 0, 1, 0);
    this.scene.rotate(this.pitchAngle, 1, 0, 0); 

    if (this.parts.length > 0) {
      this.displayParts();
    } else {
      super.display();
    }

    this.scene.popMatrix();

    if (this.waterDropActive) {
      this.displayWaterDrop();
    }
  }

  displayWaterDrop() {
    if (!this.waterDropActive) return;

    const dropProgress = this.waterDropProgress / this.waterDropDuration;

    this.waterDropMaterial.apply();

    this.scene.pushMatrix();

    const bucketPos = this.getBucketWorldPosition();
    const groundHeight = 0.1;

    if (dropProgress < 0.5) {
      const streamProgress = dropProgress * 2;
      const streamLength = bucketPos[1] * streamProgress;
      const streamWidth =
        0.3 + (0.2 * this.initialWaterAmount) / this.waterCapacity;

      this.scene.pushMatrix();
      this.scene.translate(
        bucketPos[0],
        bucketPos[1] - streamLength / 2,
        bucketPos[2]
      );
      this.scene.scale(streamWidth, streamLength, streamWidth);
      this.scene.rotate(Math.PI / 2, 1, 0, 0);
      this.waterStream.display();
      this.scene.popMatrix();

    } else {
      const splashProgress = (dropProgress - 0.5) * 2;
      
      
      const finalExtinguishRadius = this.baseRadiusWater + this.initialWaterAmount * this.radiusPerWaterUnit;

      const currentSplashSize = finalExtinguishRadius * splashProgress;

      this.scene.pushMatrix();
      this.scene.translate(
        this.targetFirePosition[0],
        groundHeight,
        this.targetFirePosition[2]
      );
      this.scene.rotate(-Math.PI / 2, 1, 0, 0);
      this.scene.scale(currentSplashSize, currentSplashSize, 1);

      const alpha = 0.8 * (1 - Math.pow(splashProgress, 2));
      this.waterDropMaterial.setDiffuse(0.1, 0.4, 0.8, alpha);

      this.waterSplash.display();
      this.scene.popMatrix();


      if (splashProgress > 0.6 && this.bucketBottomOpen) {
        this.bucketBottomOpen = false;
        this.bucketBottomAnimationInProgress = true;
      }
    }

    this.scene.popMatrix();
  }

  

  /**
   * Display all helicopter parts
   */
  displayParts() {
    for (const part of this.parts) {
      if (this.shouldSkipPart(part)) {
        continue;
      }

      this.scene.pushMatrix();

      this.applyPartTransformations(part);

      part.display();
      this.scene.popMatrix();
    }

    this.displayWaterInBucket();
  }

  /**
   * Determine if a part should be skipped in rendering
   */
  shouldSkipPart(part) {
    return (
      (part.groupName === "BucketBody" ||
        part.groupName === "BucketCable" ||
        part.groupName === "BucketBottom") &&
      this.bucketAnimationProgress === 0
    );
  }

  /**
   * Apply part-specific transformations
   */
  applyPartTransformations(part) {
    if (part.groupName === "MainRotor") {
      this.applyRotorTransformation(part, this.mainRotorAngle, [0, 1, 0]);
    } else if (part.groupName === "SideRotor") {
      this.applyRotorTransformation(part, this.sideRotorAngle, [1, 0, 0]);
    } else if (
      part.groupName === "BucketBody" ||
      part.groupName === "BucketCable"
    ) {
      this.applyBucketTransformation(part);
    } else if (part.groupName === "BucketBottom") {
      this.applyBucketBottomTransformation(part);
    }
  }

  applyBucketBottomTransformation(part) {
    const [x, y, z] = part.centroid;

    const offsetY = (1 - this.bucketAnimationProgress) * 2;
    this.scene.translate(0, offsetY, 0);

    if (this.bucketBottomAnimationProgress > 0) {
      this.scene.translate(x, y, z);
      this.scene.rotate(
        (this.bucketBottomAnimationProgress * Math.PI) / 2,
        1,
        0,
        0
      );
      this.scene.translate(-x, -y, -z);
    }
  }

  /**
   * Apply rotor transformation
   */
  applyRotorTransformation(part, angle, axis) {
    const [x, y, z] = part.centroid;
    this.scene.translate(x, y, z);
    this.scene.rotate(angle, ...axis);
    this.scene.translate(-x, -y, -z);
  }

  /**
   * Apply bucket transformation
   */
  applyBucketTransformation(part) {
    const [x, y, z] = part.centroid;

    if (part.groupName === "BucketCable") {
      this.scene.translate(x, y, z);
      this.scene.scale(1, this.bucketAnimationProgress, 1);
      this.scene.translate(-x, -y, -z);
    } else if (
      part.groupName === "BucketBody" ||
      part.groupName === "BucketBottom"
    ) {
      const offsetY = (1 - this.bucketAnimationProgress) * 2;
      this.scene.translate(0, offsetY, 0);
    }
  }

  getBucketBottomPosition() {
    const bucketLengthOffset = 2.5;
    return this.pos[1] + this.bucketBottomOffset + bucketLengthOffset;
  }

  /**
   * Main update method - called every frame
   */
  update(timeFactor, keysPressed, keysHeld) {
    if (this.prevTime === 0) {
      this.prevTime = timeFactor;
      return;
    }

    const deltaTime = timeFactor - this.prevTime;

    this.updateBucketAnimation(deltaTime);
    this.updateRotorAnimation(deltaTime);
    this.updateRotorSound(deltaTime);
    this.updateWaterDrop(deltaTime);
    this.processKeyInput(keysPressed, keysHeld, deltaTime);

    this.updateState(deltaTime, keysHeld);

    this.prevTime = timeFactor;
  }

  /**
   * Update bucket animation
   */
  updateBucketAnimation(deltaTime) {
    if (this.bucketAnimationInProgress) {
      if (this.bucketExtended) {
        this.bucketAnimationProgress -= this.bucketAnimationSpeed * deltaTime;
        if (this.bucketAnimationProgress <= 0) {
          this.bucketAnimationProgress = 0;
          this.bucketExtended = false;
          this.bucketAnimationInProgress = false;
        }
      } else {
        this.bucketAnimationProgress += this.bucketAnimationSpeed * deltaTime;
        if (this.bucketAnimationProgress >= 1) {
          this.bucketAnimationProgress = 1;
          this.bucketExtended = true;
          this.bucketAnimationInProgress = false;

          if (this.state === HeliState.TAKING_OFF) {
            this.state = HeliState.FLYING;
          }
        }
      }
    }

    if (this.bucketBottomAnimationInProgress) {
      if (this.bucketBottomOpen) {
        this.bucketBottomAnimationProgress +=
          this.bucketBottomAnimationSpeed * deltaTime;
        if (this.bucketBottomAnimationProgress >= 1) {
          this.bucketBottomAnimationProgress = 1;
          this.bucketBottomAnimationInProgress = false;
        }
      } else {
        this.bucketBottomAnimationProgress -=
          this.bucketBottomAnimationSpeed * deltaTime;
        if (this.bucketBottomAnimationProgress <= 0) {
          this.bucketBottomAnimationProgress = 0;
          this.bucketBottomAnimationInProgress = false;
        }
      }
    }
  }

  /**
   * Update rotor animation
   */
  updateRotorAnimation(deltaTime) {
    if (this.motorOn) {
      const mainRotorSpeed = 100;
      const sideRotorSpeed = 150;

      this.mainRotorAngle =
        (this.mainRotorAngle + mainRotorSpeed * deltaTime) % (2 * Math.PI);
      this.sideRotorAngle =
        (this.sideRotorAngle + sideRotorSpeed * deltaTime) % (2 * Math.PI);
    }
  }

  updateRotorSound(deltaTime) {
    if (!this.scene.soundManager || !this.scene.soundManager.sounds["heli_blade"]) {
      return;
    }

    if (this.motorOn && !this.soundStates.blade.fadingOut) {
      let targetVolume = 0.05;
      this.scene.soundManager.play("heli_blade");
      const currentSpeed = Math.sqrt(
        this.velocity[0] ** 2 + this.velocity[2] ** 2
      );
      const speedFactor = Math.min(1, currentSpeed / this.maxVelocity);
      targetVolume += speedFactor * 0.02;

      if (Math.abs(this.soundStates.blade.bladeVolume - targetVolume) > 0.01) {
        const direction =
          this.soundStates.blade.bladeVolume < targetVolume ? 1 : -1;
        this.soundStates.blade.bladeVolume += direction * 0.1 * deltaTime;
        this.scene.soundManager.setVolume(
          "heli_blade",
          this.soundStates.blade.bladeVolume
        );
      }
    }

    if (this.soundStates.blade.fadingOut) {
      this.soundStates.blade.bladeVolume = Math.max(
        0,
        this.soundStates.blade.bladeVolume - 0.01 * deltaTime
      );
      this.scene.soundManager.setVolume(
        "heli_blade",
        this.soundStates.blade.bladeVolume
      );

      if (this.soundStates.blade.bladeVolume <= 0) {
        this.scene.soundManager.stop("heli_blade");
        this.soundStates.blade.fadingOut = false;
      }
    }
  }

  processKeyInput(keysPressed, keysHeld, deltaTime) {
    // Takeoff - P key
    if (keysPressed.includes("P")) {
      this.handleTakeoffInput();
    }

    // Landing - L key
    if (keysPressed.includes("L")) {
      this.handleLandingInput();
    }
    // Reset - R key
    if (keysPressed.includes("R")) {
      this.handleResetInput();
    }
    // Water drop - O key
    if (keysPressed.includes("O")) {
      this.handleWaterDropInput();
    }
  }

  /**
   * Update water drop effect and extinguish fires
   */
  updateWaterDrop(deltaTime) {
    if (!this.waterDropActive) return;

    this.waterDropProgress += this.waterDropSpeed * deltaTime;

    const emptyingProgress = Math.pow(
      this.waterDropProgress / this.waterDropDuration,
      3
    );
    this.currentWaterAmount = this.initialWaterAmount * (1 - emptyingProgress);

    if (this.currentWaterAmount < 0) {
      this.currentWaterAmount = 0;
    }

    if (
      this.waterDropProgress >= this.waterDropDuration / 2 &&
      !this.waterHitGround
    ) {
      this.waterHitGround = true;

      if (this.targetFires.length > 0) {
        
        const extinguishRadius =
          this.baseRadiusWater + this.initialWaterAmount * this.radiusPerWaterUnit;
        
        for (const fire of this.targetFires) {
          fire.extinguishWithWater(
            this.targetFirePosition[0],
            this.targetFirePosition[2],
            extinguishRadius
          );
        }
        this.scene.soundManager.play("water-impact");
      }
    }

    if (this.waterDropProgress >= this.waterDropDuration) {
      this.waterDropActive = false;
      this.waterHitGround = false;
      this.currentWaterAmount = 0;
      this.drops = [];
      this.targetFires = [];
    }
  }
  getBucketWorldPosition() {
    const heliPos = [...this.pos];

    const bucketBottom = this.parts.find(
      (part) => part.groupName === "BucketBottom"
    );

    if (!bucketBottom) {
      console.warn("Bucket bottom part not found");
      return heliPos;
    }

    const localPos = [...bucketBottom.centroid];

    const bucketYOffset = (1 - this.bucketAnimationProgress) * 2;
    localPos[1] += bucketYOffset;

    const cosO = Math.cos(this.orientation);
    const sinO = Math.sin(this.orientation);

    const rotatedX = localPos[0] * cosO - localPos[2] * sinO;
    const rotatedZ = localPos[0] * sinO + localPos[2] * cosO;

    const worldX = heliPos[0] + rotatedX;
    const worldY = heliPos[1] + localPos[1];
    const worldZ = heliPos[2] + rotatedZ;

    return [worldX, worldY, worldZ];
  }

handleWaterDropInput() {
    if (
      this.currentWaterAmount > 0 &&
      this.bucketExtended &&
      this.isOverFire() &&
      !this.waterDropActive &&
      !this.bucketBottomAnimationInProgress && 
      this.state === HeliState.FLYING
    ) {
      this.bucketBottomOpen = true;
      this.bucketBottomAnimationInProgress = true;
      this.waterDropActive = true;
      this.waterDropProgress = 0;
      this.initialWaterAmount = this.currentWaterAmount;
      this.scene.soundManager.play("drop-the-bomb-man");
    }
  }

  isOverFire() {

    this.targetFires = [];
    this.targetFirePosition = this.getBucketWorldPosition();


    for (const fire of this.scene.fire.fireInstances) {
      if (!fire.active) continue;

      const fireBounds = fire.getBounds();

      if (!fireBounds) continue;


      if (
        this.targetFirePosition[0] >= fireBounds.minX &&
        this.targetFirePosition[0] <= fireBounds.maxX &&
        this.targetFirePosition[2] >= fireBounds.minZ &&
        this.targetFirePosition[2] <= fireBounds.maxZ
      ) {
        this.targetFires.push(fire);
      }
    }

    return this.targetFires.length > 0;
  }

  handleTakeoffInput() {
    if (this.isAtBase() && this.state === HeliState.STATIONARY) {
      this.state = HeliState.TAKING_OFF;
      this.motorOn = true;

      this.scene.soundManager.play("helicopter_helicopter");

      this.soundStates.blade.fadingOut = false;
    } else if (this.state === HeliState.WATER_LANDED) {
      if (this.soundStates.waterFilling.playing) {
        const currentPosition =
          this.scene.soundManager.getCurrentTime("water-filling");
        this.soundStates.waterFilling.playbackPosition = currentPosition;
        this.soundStates.waterFilling.playing = false;

        this.scene.soundManager.pause("water-filling");
      }

      this.waterFillStarted = false;
      this.state = HeliState.TAKING_OFF;
      this.motorOn = true;
    }
  }

  /**
   * Handle landing input
   */
  handleLandingInput() {
    if (this.state === HeliState.FLYING) {
      this.velocity = [0, 0, 0];
      this.pitchAngle = 0;

      if (this.scene.lake.isInLake(this.pos[0], this.pos[2])) {
        this.state = HeliState.LANDING_WATER;
      } else {
        this.state = HeliState.LANDING_BASE;
        this.scene.soundManager.play("returning_base");
      }
    }
  }

  /**
   * Handle reset input
   */
  handleResetInput() {
    this.mainRotorAngle = 0;
    this.sideRotorAngle = 0;
    this.pos = [...this.initialPos];
    this.velocity = [0, 0, 0];
    this.orientation = 0;
    this.pitchAngle = 0;
    this.motorOn = false;
    this.state = HeliState.STATIONARY;

    this.bucketExtended = false;
    this.bucketAnimationProgress = 0;
    this.bucketAnimationInProgress = false;
    this.bucketBottomOpen = false;
    this.bucketBottomAnimationProgress = 0;
    this.bucketBottomAnimationInProgress = false;

    this.currentWaterAmount = 0;
    this.waterFilled = false;
    this.waterFillStarted = false;
    this.waterDropActive = false;
    this.waterHitGround = false;
    this.waterDropProgress = 0;
    this.drops = [];
    this.targetFires = [];
    this.targetFirePosition = null;

    this.landingPhase = null;

    this.scene.soundManager.stop("heli_blade");
    this.scene.soundManager.stop("helicopter_helicopter");
    this.scene.soundManager.stop("returning_base");
    this.scene.soundManager.stop("drop-the-bomb-man");
    this.scene.soundManager.stop("water-filling");
    this.scene.soundManager.stop("water-full");
    this.scene.soundManager.stop("water-impact");

    this.soundStates.blade.bladeVolume = 0.05;
    this.soundStates.blade.fadingOut = false;

    this.soundStates.waterFilling.playbackPosition = 0;
    this.soundStates.waterFilling.lastUpdateTime = 0;
    this.soundStates.waterFilling.playing = false;
  }

  /**
   * Update helicopter state
   */
  updateState(deltaTime, keysHeld) {
    switch (this.state) {
      case HeliState.TAKING_OFF:
        this.updateTakingOffState(deltaTime);
        break;

      case HeliState.LANDING_WATER:
        this.updateLandingWaterState(deltaTime);
        break;

      case HeliState.LANDING_BASE:
        this.updateLandingBaseState(deltaTime);
        break;

      case HeliState.FLYING:
        this.updateFlyingState(deltaTime, keysHeld);
        break;

      case HeliState.WATER_LANDED:
        this.updateWaterLandedState(deltaTime);
      case HeliState.STATIONARY:
        break;
    }
  }

  updateWaterLandedState(deltaTime) {
    if (this.bucketExtended) {
      if (this.currentWaterAmount === 0) {
        if (!this.soundStates.waterFilling.playing) {
          this.scene.soundManager.play("water-filling");
          this.soundStates.waterFilling.playing = true;
          this.soundStates.waterFilling.lastUpdateTime = Date.now();
        }
      } else if (
        this.currentWaterAmount < this.waterCapacity &&
        !this.waterFilled
      ) {
        if (!this.soundStates.waterFilling.playing) {
          if (this.soundStates.waterFilling.playbackPosition > 0) {
            this.scene.soundManager.play("water-filling");
            this.scene.soundManager.seekTo(
              "water-filling",
              this.soundStates.waterFilling.playbackPosition
            );
          } else {
            this.scene.soundManager.play("water-filling");
          }

          this.soundStates.waterFilling.playing = true;
          this.soundStates.waterFilling.lastUpdateTime = Date.now();
        }
      }

      if (this.currentWaterAmount < this.waterCapacity) {
        this.currentWaterAmount += this.waterFillRate * deltaTime;

        if (this.currentWaterAmount >= this.waterCapacity) {
          this.currentWaterAmount = this.waterCapacity;
          this.waterFilled = true;

          if (this.soundStates.waterFilling.playing) {
            this.soundStates.waterFilling.playing = false;
          }

          this.scene.soundManager.stop("water-filling");
          this.scene.soundManager.play("water-full");
        }
      }
    } else {
      if (this.soundStates.waterFilling.playing) {
        const currentPosition =
          this.scene.soundManager.getCurrentTime("water-filling");
        this.soundStates.waterFilling.playbackPosition = currentPosition;
        this.soundStates.waterFilling.playing = false;

        this.scene.soundManager.pause("water-filling");
      }
    }
  }

  updateLandingWaterState(deltaTime) {
    if (!this.landingPhase) {
      this.landingPhase = LandingPhase.DESCENDING;
    }
    this.handleWaterLandingDescendingPhase(deltaTime);
    
  }


  handleWaterLandingDescendingPhase(deltaTime) {
    const bucketBottomY = this.getBucketBottomPosition();
    const waterSurfaceY = this.scene.lake.getHeight();
    if (bucketBottomY > waterSurfaceY) {
      this.pos[1] -= 1 * deltaTime;
    } else {
      this.velocity = [0, 0, 0];
      this.landingPhase = null;
      this.state = HeliState.WATER_LANDED;
    }
  }

  updateTakingOffState(deltaTime) {
    this.pos[1] += 1 * deltaTime;

    if (this.pos[1] >= this.initialPos[1] + this.takeOff_offset) {
      this.pos[1] = this.initialPos[1] + this.takeOff_offset;

      if (!this.bucketExtended && !this.bucketAnimationInProgress) {
        this.bucketAnimationInProgress = true;
      } else {
        this.state = HeliState.FLYING;
      }
    }
  }

  updateLandingBaseState(deltaTime) {
    if (!this.landingPhase) {
      this.landingPhase = LandingPhase.ROTATING;
    }

    if (this.landingPhase === LandingPhase.ROTATING) {
      this.handleLandingRotationPhase();
    } else if (this.landingPhase === LandingPhase.POSITIONING) {
      this.handleLandingPositioningPhase();
    } else if (this.landingPhase === LandingPhase.RETRACTING) {
      this.handleLandingRetractingPhase();
    } else if (this.landingPhase === LandingPhase.DESCENDING) {
      this.handleLandingDescendingPhase(deltaTime);
    }
  }

  handleLandingRotationPhase() {
    const targetAngle = Math.atan2(
      this.initialPos[0] - this.pos[0],
      this.initialPos[2] - this.pos[2]
    );
    const angleDiff = this.normalizeAngle(targetAngle - this.orientation);

    if (Math.abs(angleDiff) > 0.03) {
      const turnDirection = angleDiff > 0 ? 1 : -1;
      this.turn(turnDirection * 0.05);
    } else {
      this.orientation = targetAngle;
      this.landingPhase = LandingPhase.POSITIONING;
    }
  }

  handleLandingPositioningPhase() {
    if (
      Math.abs(this.pos[0] - this.initialPos[0]) > 0.8 ||
      Math.abs(this.pos[2] - this.initialPos[2]) > 0.8
    ) {
      const moveSpeed = 0.02;
      this.pos[0] += (this.initialPos[0] - this.pos[0]) * moveSpeed;
      this.pos[2] += (this.initialPos[2] - this.pos[2]) * moveSpeed;
      this.pitchAngle = 0.25;
    } else {
      this.pitchAngle = 0;
      this.pos[0] = this.initialPos[0];
      this.pos[2] = this.initialPos[2];

      const originalOrientation = 0;
      const finalAngleDiff = this.normalizeAngle(
        originalOrientation - this.orientation
      );

      if (Math.abs(finalAngleDiff) > 0.03) {
        const turnDirection = finalAngleDiff > 0 ? 1 : -1;
        this.turn(turnDirection * 0.05);
      } else {
        this.orientation = originalOrientation;
        this.landingPhase = LandingPhase.RETRACTING;
      }
    }
  }

  handleLandingRetractingPhase() {
    if (this.bucketExtended && !this.bucketAnimationInProgress) {
      this.bucketAnimationInProgress = true;
    } else if (!this.bucketExtended && !this.bucketAnimationInProgress) {
      this.landingPhase = LandingPhase.DESCENDING;
    }
  }

  handleLandingDescendingPhase(deltaTime) {
    if (!this.soundStates.blade.fadingOut) {
      this.soundStates.blade.fadingOut = true;
    }

    this.pos[1] -= 1 * deltaTime;
    if (this.pos[1] <= this.initialPos[1]) {
      this.pos[1] = this.initialPos[1];
      this.state = HeliState.STATIONARY;
      this.motorOn = false;
      this.velocity = [0, 0, 0];
      this.landingPhase = null;
      this.waterFilled = false; 
      this.currentWaterAmount = 0; 
    }
  }

  updateFlyingState(deltaTime, keysHeld) {
    this.updatePitchAngle(deltaTime, keysHeld);

    this.processMovementInput(deltaTime, keysHeld);

    this.updatePhysics(deltaTime, keysHeld);

    this.updatePosition(deltaTime);
  }

  processMovementInput(deltaTime, keysHeld) {
    if (keysHeld.includes("W")) {
      this.accelerate(this.acceleration * deltaTime * 20);
    }

    if (keysHeld.includes("S")) {
      this.accelerate(-this.backwardAcceleration * deltaTime * 20);
    }

    if (keysHeld.includes("A")) {
      this.turn(this.turnAcceleration * deltaTime * 0.2);
    }

    if (keysHeld.includes("D")) {
      this.turn(-this.turnAcceleration * deltaTime * 0.2);
    }
  }

  updatePhysics(deltaTime, keysHeld) {
    if (!keysHeld.includes("W") && !keysHeld.includes("S")) {
      this.applyFriction(deltaTime);
    }

    this.limitVelocity();
  }

  updatePosition(deltaTime) {
    this.pos = [
      this.pos[0] + this.velocity[0] * deltaTime * this.speedFactor,
      this.pos[1] + this.velocity[1] * deltaTime * this.speedFactor,
      this.pos[2] + this.velocity[2] * deltaTime * this.speedFactor,
    ];
  }

  updatePitchAngle(deltaTime, keysHeld) {
    let targetPitch = 0;

    if (keysHeld.includes("W")) {
      targetPitch = this.maxPitchAngle;
    } else if (keysHeld.includes("S")) {
      targetPitch = -this.maxPitchAngle;
    }

    if (Math.abs(this.pitchAngle - targetPitch) > 0.01) {
      const pitchRate =
        targetPitch === 0 ? this.pitchRecoverySpeed : this.pitchSpeed;
      const pitchChange = pitchRate * deltaTime;

      if (this.pitchAngle < targetPitch) {
        this.pitchAngle = Math.min(this.pitchAngle + pitchChange, targetPitch);
      } else {
        this.pitchAngle = Math.max(this.pitchAngle - pitchChange, targetPitch);
      }
    } else {
      this.pitchAngle = targetPitch;
    }
  }

  /**
   * Apply friction to slow down helicopter
   */
  applyFriction(deltaTime) {
    const currentSpeed = Math.sqrt(
      this.velocity[0] ** 2 + this.velocity[2] ** 2
    );

    if (currentSpeed > 0.001) {
      const friction = this.frictionCoefficient * deltaTime;
      const frictionFactor = Math.max(0, 1 - friction);

      this.velocity[0] *= frictionFactor;
      this.velocity[2] *= frictionFactor;

      if (Math.abs(this.velocity[0]) < 0.001) this.velocity[0] = 0;
      if (Math.abs(this.velocity[2]) < 0.001) this.velocity[2] = 0;
    }
  }

  /**
   * Apply brakes to quickly stop the helicopter
   */
  applyBrakes(deltaTime) {
    const brakeEffect = this.brakeForce * deltaTime;
    const brakeFactor = Math.max(0, 1 - brakeEffect);

    this.velocity[0] *= brakeFactor;
    this.velocity[2] *= brakeFactor;

    if (Math.abs(this.velocity[0]) < 0.01) this.velocity[0] = 0;
    if (Math.abs(this.velocity[2]) < 0.01) this.velocity[2] = 0;
  }

  isAtBase() {
    return (
      Math.abs(this.pos[0] - this.initialPos[0]) < 0.1 &&
      Math.abs(this.pos[1] - this.initialPos[1]) < 0.1 &&
      Math.abs(this.pos[2] - this.initialPos[2]) < 0.1
    );
  }


  limitVelocity() {
    const velocityMagnitude = Math.sqrt(
      this.velocity[0] ** 2 + this.velocity[2] ** 2
    );

    if (velocityMagnitude > this.maxVelocity) {
      const scaleFactor = this.maxVelocity / velocityMagnitude;
      this.velocity[0] *= scaleFactor;
      this.velocity[2] *= scaleFactor;
    }
  }

  getForwardSpeed() {
    const vx = this.velocity[0];
    const vz = this.velocity[2];
    const sinO = Math.sin(this.orientation);
    const cosO = Math.cos(this.orientation);

    return vx * sinO + vz * cosO;
  }

  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  /**
   * Rotates the helicopter and adjusts the velocity vector
   * @param {number} angle - Angle to rotate by (in radians)
   */
  turn(angle) {
    this.orientation = (this.orientation + angle) % (2 * Math.PI);

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const vx = this.velocity[0];
    const vz = this.velocity[2];

    this.velocity[0] = vx * cosA + vz * sinA;
    this.velocity[2] = -vx * sinA + vz * cosA;
  }

  /**
   * Change helicopter speed in the direction it's facing
   * @param {number} acc - Acceleration to apply
   */
  accelerate(acc) {
    const newVelocityX = this.velocity[0] + acc * Math.sin(this.orientation);
    const newVelocityZ = this.velocity[2] + acc * Math.cos(this.orientation);

    this.velocity[0] = newVelocityX;
    this.velocity[2] = newVelocityZ;

    this.limitVelocity();
  }
  updateSpeedFactor(speedFactor) {
    this.acceleration = speedFactor * 0.03;
    this.backwardAcceleration = speedFactor * 0.02;
    this.turnAcceleration = speedFactor;
  }
}
