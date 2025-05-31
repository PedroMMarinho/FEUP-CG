import { CGFobject, CGFtexture } from '../../../lib/CGF.js';
import { MyTree } from './MyTree.js';


export class MyStaticTrees extends CGFobject {
    /**
     * Constructor for the MyStaticTrees object
     * @param {CGFscene} scene - Reference to the scene
     */
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.leafTexture = new CGFtexture(scene, 'textures/leaf1.jpg');
        this.trunkTexture = new CGFtexture(scene, 'textures/trunk1.jpg');
        
        this.tree = new MyTree(this.scene,0, 'X', 0.2, 5, [0.13, 1, 0.13],  this.trunkTexture,this.leafTexture);
        
       this.trees = [
            // cluster 1 
            { position: [-100, 0, -50], rotation: { x: 0, y: 0 }, scale: { x: 3.0, y: 3.0, z: 3.0 } },
            { position: [-106, 0, -51], rotation: { x:  -Math.PI / 32, y: 0 }, scale: { x: 2.7, y: 2.3, z: 2.7 } },
            // cluster 2 
            { position: [-15, 0, -65], rotation: { x: 0, y: 0 }, scale: { x: 2.2, y: 2.6, z: 2.2 } },
            { position: [-20, 0, -70], rotation: { x: 0, y: Math.PI / 2 }, scale: { x: 1.6, y: 2.2, z: 1.6 } },
            { position: [-17, 0, -70], rotation: { x: 0, y: 2 * Math.PI / 3 }, scale: { x: 2.0, y: 2.8, z: 2.0 } },
            { position: [-14, 0, -70], rotation: { x: 0, y: Math.PI }, scale: { x: 2.4, y: 2.0, z: 2.4 } },
            // cluster 3 
            { position: [-15, 0, -206], rotation: { x: 0, y: 0 }, scale: { x: 2.0, y: 2.4, z: 2.0 } },
            { position: [-20, 0, -210], rotation: { x: 0, y: Math.PI / 2 }, scale: { x: 1.5, y: 2.0, z: 1.5 } },
            { position: [-20, 0, -206], rotation: { x: 0, y: 2 * Math.PI / 3 }, scale: { x: 1.8, y: 2.5, z: 1.8 } },
            { position: [-14, 0, -210], rotation: { x: 0, y: Math.PI }, scale: { x: 2.2, y: 1.8, z: 2.2 } },
            // cluster 4 
            { position: [-100, 0, -240], rotation: { x: 0, y: 0 }, scale: { x: 2.5, y: 3.0, z: 2.5 } },
            { position: [-106, 0, -245], rotation: { x: -Math.PI / 32, y: 0 }, scale: { x: 2.3, y: 2.5, z: 2.3 } },
            { position: [-102, 0, -250], rotation: { x: Math.PI / 16, y: 0 }, scale: { x: 2.0, y: 2.8, z: 2.0 } },
            { position: [-98, 0, -255], rotation: { x: Math.PI / 8, y: 0 }, scale: { x: 2.1, y: 2.4, z: 2.1 } },
            // cluster 5
            { position: [-50, 0, -220], rotation: { x: 0, y: 0 }, scale: { x: 2.5, y: 3.0, z: 2.5 } },
            { position: [-55, 0, -225], rotation: { x: -Math.PI / 32, y: 0 }, scale: { x: 2.3, y: 2.5, z: 2.3 } },
            { position: [-52, 0, -220], rotation: { x: Math.PI / 16, y: 0 }, scale: { x: 2.0, y: 2.8, z: 2.0 } },
            { position: [-48, 0, -225], rotation: { x: Math.PI / 8, y: 0 }, scale: { x: 2.1, y: 2.4, z: 2.1 } },
            // cluster 6
            { position: [70, 0, -150], rotation: { x: 0, y: 0 }, scale: { x: 2.5, y: 3.0, z: 2.5 } },
            { position: [65, 0, -155], rotation: { x: -Math.PI / 32, y: 0 }, scale: { x: 2.3, y: 2.5, z: 2.3 } },
            { position: [65, 0, -150], rotation: { x: Math.PI / 16, y: 0 }, scale: { x: 2.0, y: 2.8, z: 2.0 } },
            { position: [70, 0, -155], rotation: { x: Math.PI / 8, y: 0 }, scale: { x: 2.1, y: 2.4, z: 2.1 } },
            // cluster 7
            { position: [20, 0, -68], rotation: { x: 0, y: 0 }, scale: { x: 2.5, y: 3.0, z: 2.5 } },
            { position: [25, 0, -73], rotation: { x: -Math.PI / 32, y: 0 }, scale: { x: 2.3, y: 2.5, z: 2.3 } },
            { position: [28, 0, -68], rotation: { x: Math.PI / 16, y: 0 }, scale: { x: 2.0, y: 2.8, z: 2.0 } },
            { position: [22, 0, -73], rotation: { x: Math.PI / 8, y: 0 }, scale: { x: 2.1, y: 2.4, z: 2.1 } },
            // cluster 8
            { position: [-230, 0, -100], rotation: { x: 0, y: 0 }, scale: { x: 2.5, y: 3.0, z: 2.5 } },
            { position: [-225, 0, -105], rotation: { x: -Math.PI / 32, y: 0 }, scale: { x: 2.3, y: 2.5, z: 2.3 } },
            { position: [-228, 0, -100], rotation: { x: Math.PI / 16, y: 0 }, scale: { x: 2.0, y: 2.8, z: 2.0 } },
            { position: [-232, 0, -105], rotation: { x: Math.PI / 8, y: 0 }, scale: { x: 2.1, y: 2.4, z: 2.1 } },
            // cluster 9
            { position: [-170, 0, -232], rotation: { x: 0, y: 0 }, scale: { x: 2.5, y: 3.0, z: 2.5 } },
            { position: [-175, 0, -230], rotation: { x: -Math.PI / 32, y: 0 }, scale: { x: 2.3, y: 2.5, z: 2.3 } },
            { position: [-172, 0, -232], rotation: { x: Math.PI / 16, y: 0 }, scale: { x: 2.0, y: 2.8, z: 2.0 } },
            { position: [-178, 0, -232], rotation: { x: Math.PI / 8, y: 0 }, scale: { x: 2.1, y: 2.4, z: 2.1 } },
            // cluster 10
            { position: [-240, 0, -150], rotation: { x: 0, y: 0 }, scale: { x: 2.5, y: 3.0, z: 2.5 } },
            { position: [-235, 0, -155], rotation: { x: -Math.PI / 32, y: 0 }, scale: { x: 2.3, y: 2.5, z: 2.3 } },
            { position: [-232, 0, -150], rotation: { x: Math.PI / 16, y: 0 }, scale: { x: 2.0, y: 2.8, z: 2.0 } },
            { position: [-238, 0, -155], rotation: { x: Math.PI / 8, y: 0 }, scale: { x: 2.1, y: 2.4, z: 2.1 } },
            // cluster 11
            { position: [-170, 0, -50], rotation: { x: 0, y: 0 }, scale: { x: 2.5, y: 3.0, z: 2.5 } },
            { position: [-170, 0, -55], rotation: { x: -Math.PI / 32, y: 0 }, scale: { x: 2.3, y: 2.5, z: 2.3 } },
            
        ];
    }

    /**
     * Display method, called periodically to render the trees in the scene
     */
    display() {
        for (const tree of this.trees) {
            this.scene.pushMatrix();
            
            const [x, y, z] = tree.position;
            this.scene.translate(x, y, z);
            
            this.scene.rotate(tree.rotation.y, 0, 1, 0);
            this.scene.rotate(tree.rotation.x, 1, 0, 0);
            
            const scale = tree.scale;
            this.scene.scale(scale.x, scale.y, scale.z);
            
            this.tree.display();
            
            this.scene.popMatrix();
        }
    }
    
}
