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
camera.attachControl(canvas, true);
camera.setTarget(BABYLON.Vector3.Zero());
camera.rotation = new BABYLON.Vector3(1.3135351989207036, 1.5185824993276926, 0);

const light = new BABYLON.PointLight(
  "light",
  new BABYLON.Vector3(10, 10, 0),
  scene,
);

BABYLON.SceneLoader.ImportMeshAsync(
  "",
  "/assets/",      
  "FormulaPrototype.glb",
  scene
)

BABYLON.SceneLoader.ImportMeshAsync(
  "",
  "/assets/",      
  "CavTestTrack.glb",
  scene
)

function renderLoop() {
  scene.render();
}
engine.runRenderLoop(renderLoop);
