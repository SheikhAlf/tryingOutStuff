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

  addPoint(x, y, z) {
    const node = new TrackNode(x, y, z, NaN, null);
    if (!this.head) {
      this.head = node;
      this.tail = node;
      return;
    }
    this.tail.next = node;
    //tail perultimo, node ultimo
    BABYLON.MeshBuilder.CreateLines("line",
      {
        points: [
        new BABYLON.Vector3(this.tail.x, this.tail.y, this.tail.z), 
        new BABYLON.Vector3(this.tail.next.x, this.tail.next.y, this.tail.next.z)
      ] 
      }, scene
    );
    this.tail = node;
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