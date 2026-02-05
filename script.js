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
    //export button
    const exportTrackBtn = document.querySelector('#exportTrack');
    exportTrackBtn.addEventListener("click", () => {
      const json = path.exportJSON();
      const blob = new Blob(
        [json],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "track_nodes.json";
      a.click();
      URL.revokeObjectURL(url);
    });
    //import button
    const importTrackInput = document.querySelector('#importTrack');

    importTrackInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }  
      const text = await file.text();   
      const data = JSON.parse(text);     

      path.nodes = [];

      data.forEach(p => {
        const node = new TrackNode(p.x, p.y, p.z);
        path.nodes.push(node);
        path.nodes[path.nodes.length-1].render(); 
        const len = path.nodes.length;
        if (len > 1) {
          BABYLON.MeshBuilder.CreateLines("line", {
            points: [
              path.nodes[path.nodes.length-1].toVector(),
              path.nodes[path.nodes.length-2].toVector()],
            updatable: false
          }).color = new BABYLON.Color3(0, 0, 1);
        }
      });
      importTrackInput.value = '';
    });
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
  path.addPoint(node.x, node.y, node.z);
});

engine.runRenderLoop(() => {
  scene.render();
});