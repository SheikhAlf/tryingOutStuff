"use strict";

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

BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "CavTestTrack.glb", scene)
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

  const node = new TrackNode(
    pick.pickedPoint.x, pick.pickedPoint.y, pick.pickedPoint.z
  );

  node.render();
  path.addPoint(node.x, node.y, node.z);
});

engine.runRenderLoop(() => {
  scene.render();
});