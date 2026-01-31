"use strict";

class TrackNode {
  constructor(x, y, z, a, next) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.a = a;
    this.arrow = null;
    this.next = next;
  }
}

class Track {
  constructor() {
    this.head = null;
    this.tail = null;
    this.arrowController = null;
  }

  addPoint(x, y, z, a) {
    const node = new TrackNode(x, y, z, a, null);
    if (!this.head) {
      this.head = node;
      this.tail = node;
      return;
    }
    this.tail.next = node
    if (this.arrowController) {
      this.arrowController.dispose();
      this.arrowController = null;
    }
    this.arrowController = this.createArrow(this.tail);
    this.tail = node;
  }

  createArrow(node) {
      const pos = new BABYLON.Vector3(node.x, node.y, node.z);

      const sphere = BABYLON.MeshBuilder.CreateSphere("gizmoSphere", { diameter: 1 }, scene);
      sphere.position.copyFrom(pos);

      const mat = new BABYLON.StandardMaterial("gizmoMat", scene);
      mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
      sphere.material = mat;

      const gizmo = new BABYLON.PositionGizmo();
      gizmo.attachedMesh = sphere;
      
      return {
          mesh: sphere,
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

}

let path = new Track();

const canvas = document.querySelector("canvas");
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
scene.environmentTexture =
  BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/environment.env", scene);

const camera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-320, 1262, 409),
  scene
);
camera.attachControl(canvas, true);
camera.speed = 10;
camera.rotation = new BABYLON.Vector3(1.3135, 1.5185, 0);

new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);

BABYLON.SceneLoader.ImportMeshAsync("", "/assets/", "CavTestTrack.glb", scene);

scene.onPointerObservable.add((pi) => {
  if (pi.type !== BABYLON.PointerEventTypes.POINTERDOWN) return;

  const pick = scene.pick(scene.pointerX, scene.pointerY);
  if (!pick.hit || !pick.pickedPoint) return;

  const nodeMesh = BABYLON.MeshBuilder.CreateSphere(
    "node",
    { diameter: 4 },
    scene
  );
  nodeMesh.position.copyFrom(pick.pickedPoint);

  const mat = new BABYLON.StandardMaterial("nodeMat", scene);
  mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
  nodeMesh.material = mat;

  path.addPoint(
    pick.pickedPoint.x,
    pick.pickedPoint.y,
    pick.pickedPoint.z
  );
});

engine.runRenderLoop(() => {
  scene.render();
});
