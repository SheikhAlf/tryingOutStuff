"use strict";

class TrackNode {
  constructor(x, y, z, a, next) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.a = a;
    this.next = next;
  }
}

class Track {
  constructor() {
    this.head = null;
    this.tail = null;
    this.line = null;
  }

  addPoint(x, y, z, a) {
    const node = new TrackNode(x, y, z, a, null);
    if (!this.head) {
        this.head = node;
        this.tail = node;
        return;
    }
    this.tail.next = node;
    if (this.arrow) {
      this.arrow.dispose();
    }
    if (this.tail !== this.head || this.head !== node) { 
      this.arrow = this.createArrow(this.tail);
    }
    this.tail = node;
  }


  createArrow(node) {
    const shaft = BABYLON.MeshBuilder.CreateCylinder("shaft", {
        height: 8,
        diameter: 0.15
    }, scene);

    const head = BABYLON.MeshBuilder.CreateCylinder("head", {
        height: 2,
        diameterTop: 0,
        diameterBottom: 0.6
    }, scene);

    head.position.y = 5; 

    const arrow = BABYLON.Mesh.MergeMeshes([shaft, head], true);
    arrow.position.copyFrom(new BABYLON.Vector3(node.x, node.y, node.z));
    arrow.rotationQuaternion = BABYLON.Quaternion.Identity();

    const mat = new BABYLON.StandardMaterial("arrowMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 0.3, 0.3);
    arrow.material = mat;

    if (this.tail && this.tail.gizmo) {
        this.tail.gizmo.attachedMesh = null;
        this.tail.gizmo.dispose();
        this.tail.gizmo = null;
    }

    const gizmo = new BABYLON.RotationGizmo();
    gizmo.attachedMesh = arrow;
    gizmo.updateGizmoRotationToMatchAttachedMesh = true;

    node.arrow = arrow;
    node.gizmo = gizmo;
    return {
        mesh: arrow,
        gizmo: gizmo,
        dispose() { 
            if (this.gizmo) {
                this.gizmo.attachedMesh = null;
                this.gizmo.dispose();
                this.gizmo = null;
            }
            if (this.mesh) {
                this.mesh.dispose();
                this.mesh = null;
            }
        }
    };
  }

  toString() {
    let c = this.head;
    let s = "";
    while (c !== undefined) {
      s += `x: ${c.x}, y: ${c.y}, z: ${c.z}, a: ${c.a} | `;
      c = c.next;
    }
    return s;
  }
}

let path = new Track();

const canvas = document.querySelector("canvas");
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
scene.collisionsEnabled = true;
scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
    "/assets/environment.env",
    scene
);

const camera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-320, 1262, 409),
  scene,
);
scene.activeCamera = camera;
camera.speed = 10;
camera.attachControl(canvas, true);
camera.rotation = new BABYLON.Vector3(1.3135351989207036, 1.5185824993276926, 0);

const light = new BABYLON.PointLight(
  "light",
  new BABYLON.Vector3(10, 10, 0),
  scene,
);

const car = BABYLON.SceneLoader.ImportMeshAsync(
  "",
  "/assets/",      
  "FormulaPrototype.glb",
  scene
).then(model => {
  model.meshes.forEach(m => { m.isPickable ;})}
);

const track = BABYLON.SceneLoader.ImportMeshAsync(
  "",
  "/assets/",      
  "CavTestTrack.glb",
  scene
)

scene.onPointerObservable.add(pointerInfo => {
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
    const pick = scene.pick(
      scene.pointerX,
      scene.pointerY
    );

    if (pick.hit && pick.pickedMesh) {
      placeNode(pick.pickedPoint);
      path.addPoint(
        pick.pickedPoint.x,
        pick.pickedPoint.y,
        pick.pickedPoint.z
      );
    }
  }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { // confirm with Enter
        confirmArrow();
    }
});


function placeNode(position) {
  const node = BABYLON.MeshBuilder.CreateSphere(
    "node",
    {diameter: 4},
    scene
  );

  node.position.copyFrom(position);

  const mat = new BABYLON.StandardMaterial("nodeMat", scene);
  mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
  node.material = mat;
}

function renderLoop() {
  scene.render();
}
engine.runRenderLoop(renderLoop);