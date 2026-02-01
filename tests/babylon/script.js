"use strict";

class TrackNode {
  constructor(x, y, z, a, next) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.a = a;
    this.next = next;
  }

  toVector() {
    return new BABYLON.Vector3(
      this.x,
      this.y,
      this.z
    );
  }
}

class Track {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  addPoint(x, y, z, a) {
    const node = new TrackNode(x, y, z, a, null);

    if (!this.head) {
      this.head = node;
      this.tail = node;
      return node;
    }

    this.tail.next = node;

    //arrowController will exist just for the first 2 nodes
    if (this.head.next === node) {
      this.arrowController = this.createArrow(this.head);
    } else if (this.arrowController) {
        let points = this.connect(
          this.head, 
          this.arrowController, 
          this.head.next
        ).getPoints()
        this.arrowController.dispose();
        delete this.arrowController;
        this.tail = this.tail.next;
        return;
    }
    this.tail = this.tail.next;
    
    return node;
  }

  insert(previousNode, node) {
    node.next = previousNode.next;
    previousNode.next = node;
  }

  addPoints(arc, p1, p2) {
    let current = this.head;
    while (current) {
      if (current === p1) {

      }
    }
  }

  connect(p1, p2, p3) {
    let arc = BABYLON.Curve3.ArcThru3Points(
      p1.toVector(), 
      p2.toVector(), 
      p3.toVector(), 
      67, false, false
    );
    const len = Math.floor(arc.length());
    console.log(len);
    arc = BABYLON.Curve3.ArcThru3Points(
      p1.toVector(), 
      p2.toVector(), 
      p3.toVector(), 
      len, false, false
    );
    this.arcMesh = BABYLON.MeshBuilder.CreateLines("arcDebug", {
        points: arc.getPoints(),
        updatable: false
    });
    this.arcMesh.color = new BABYLON.Color3(0, 0, 1);
    return arc;
  }

  createArrow(node) {
      const pos = node.toVector();

      const sphere = BABYLON.MeshBuilder.CreateSphere("gizmoSphere", { diameter: 1 }, scene);
      sphere.position.copyFrom(pos);

      const mat = new BABYLON.StandardMaterial("gizmoMat", scene);
      mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
      sphere.material = mat;

      const gizmo = new BABYLON.PositionGizmo();
      gizmo.attachedMesh = sphere;
      gizmo.yGizmo.isEnabled = false;

      gizmo.onDragObservable.add(() => {
        if (!trackMeshes.length) {
          return;
        }  

        const origin = new BABYLON.Vector3(
          sphere.position.x,
          1000,
          sphere.position.z
        );

        const ray = new BABYLON.Ray(origin, BABYLON.Vector3.Down(), 2000);
        const hit = scene.pickWithRay(ray, m => trackMeshes.includes(m));

        if (hit && hit.pickedPoint) {
          sphere.position.y = hit.pickedPoint.y;
        }

        gizmo.position = new BABYLON.Vector3(
          sphere.position.x,
          sphere.position.y,
          sphere.position.z
        );
      });

      const arrowController = {
        mesh: sphere,
        gizmo: gizmo,
        toVector() {
          return gizmo.position;
        },
        dispose() {
          if (this.gizmo) {
            return;
          }
          this.gizmo.attachedMesh = null;
          this.gizmo.dispose();
          this.gizmo = null;
          if (this.mesh) {
            return;
          }
          this.mesh.dispose();
          this.mesh = null;
        }
      }

      return arrowController;
  }

  toString() {
    let current = this.head;
    let s = "";
    while (current) {
      s = s + "x:" + current.x + ", y:" + current.y + ", z:" + current.z + "; ";
      current = current.next;
    }
    return s;
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
camera.speed = 12;
camera.rotation = new BABYLON.Vector3(1.3135, 1.5185, 0);

const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);

const axes = new BABYLON.AxesViewer(scene, 50);

let trackMeshes = [];

BABYLON.SceneLoader.ImportMeshAsync("", "/assets/", "CavTestTrack.glb", scene)
  .then(result => {
    trackMeshes = result.meshes.filter(m => m.isPickable);
  });

scene.onPointerObservable.add((pi) => {
  //pi is pointerInfo
  if (pi.type !== BABYLON.PointerEventTypes.POINTERDOWN) {
    return;
  }  

  const pick = scene.pick(scene.pointerX, scene.pointerY);
  if (!pick.hit || !pick.pickedPoint) {
    return;
  }  

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

let list = new Track();
let p1 = list.addPoint(1, 1, 1);
let p2 = list.addPoint(3, 3, 3);
list.insert(p1, new TrackNode(2, 2, 2));
console.log(list.toString());