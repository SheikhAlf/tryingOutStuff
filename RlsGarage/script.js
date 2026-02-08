const canvas = document.querySelector('canvas');
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
const modelInput = document.querySelector('#selectCarModelIn');

scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/environment.env", scene);
BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "Showroom.glb", scene);

const defaultSpeed = 0.2;
const freeCamera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-5.6334244397982065, 4.714844991974612, 13.893594048703429),
  scene
);
freeCamera.attachControl(canvas, true);
freeCamera.speed = defaultSpeed;
freeCamera.rotation = new BABYLON.Vector3(0.297601403656662, 2.5303772749927615, 0);
freeCamera.minZ = 0;

const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);


//keys related controls
window.addEventListener("keydown", (e) => {
  if (e.shiftKey) {
    freeCamera.speed = 0.05
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) {
    freeCamera.speed = defaultSpeed;
  }
});


window.addEventListener("wheel", (e)=>{
  if(checkMouse()){
    freeCamera.fov += e.deltaY * 0.0005;
    if(freeCamera.fov < 0.08){
      freeCamera.fov = 0.08;
    }
  
      if(freeCamera.fov > 2.9){
      freeCamera.fov = 2.9;
    }
  }
});

//camera fov reset: Shift+f
window.addEventListener("keydown", (e)=>{
  if(e.key === "F") freeCamera.fov = 0.8;
});


//3D model loader
modelInput.addEventListener('change', async (event) => {
  const file = event.target.files[0]; 
  const url = URL.createObjectURL(file);
  
  BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, ".glb")
      .then((result) => {
          URL.revokeObjectURL(url);
      });
});


engine.runRenderLoop(() => {
  scene.render();
  //console.log("rot: "+freeCamera.rotation+"  Pos:"+freeCamera._deferredPositionUpdate+ "Fov: "+freeCamera.fov);
});