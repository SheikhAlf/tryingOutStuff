const canvas = document.querySelector('canvas');
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/environment.env", scene);

const defaultSpeed = 3;
let fovChange = 0.0005;

let freeCamera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-5.6334244397982065, 4.714844991974612, 13.893594048703429),
  scene
);
freeCamera.attachControl(canvas, true);
freeCamera.speed = defaultSpeed;


const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);


//mouse position stuff

window.addEventListener('mousemove', mouseMoveHandler);

let relativeX;
let relativeY;

let viewPortWidth = document.documentElement.clientWidth;
let viewPortHeight = document.documentElement.clientHeight;

let xBounds = {min: (viewPortWidth/100)*25, max: viewPortWidth};
let yBounds = {min: 0, max: viewPortHeight};

function checkMouse(){
    if(relativeX >= xBounds.min && relativeX <= xBounds.max 
    && relativeY >= yBounds.min && relativeY <= yBounds.max){
        return true;
    }

    return false;
}


function mouseMoveHandler(e){
    relativeX = e.clientX;
    relativeY = e.clientY;
}



//keys related controls

//Camera Speed while holding Shift
window.addEventListener("keydown", (e) => {
  if (e.shiftKey) {
    freeCamera.speed = 1;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) {
    freeCamera.speed = defaultSpeed;
  }
});


//Camera Speed while holding Ctrl
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    freeCamera.speed = 10;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.ctrlKey) {
    freeCamera.speed = defaultSpeed;
  }
});

window.addEventListener("wheel", (e)=>{
  if(checkMouse()){
    freeCamera.fov += e.deltaY * fovChange;
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

//Important things
let car;
let carName;
let carLoaded = false;

let trackMesh;
let trackName;
let trackMeshLoaded = false;

let line;
let lineLoaded = false;


//menu Toggle
const menuToggle = {element: document.querySelector('#menuToggle'), state: 0};

const moveRightAnim = [
    {transform:"translatex(0vw)"},
    {transform:"translatex(-23.7vw)"}
];

const moveLeftAnim = [
    {transform:"translatex(-23.7vw)"},
    {transform:"translatex(0vw)"}
];

const moveTiming = { 
  duration: 155,
  iterations: 1,
};

//menuToggle button
menuToggle.element.addEventListener("click", (event) => {
    if(menuToggle.state == 0){
       ui.animate(moveRightAnim, moveTiming);
       ui.style.transform = "translatex(-23.7vw)";
       menuToggle.element.textContent = '>';
       menuToggle.state = 1;
       xBounds.min = 0;
    }else{
        ui.animate(moveLeftAnim, moveTiming);
        ui.style.transform = "translatex(0vw)";
        menuToggle.element.textContent = '<';
        menuToggle.state = 0;
        xBounds.min = (viewPortWidth/100)*25;
    }
});

//Important HTML elements

const content = document.querySelector("#content");


//inputs

//Select Car
const carInput = document.querySelector("#selectCarIn");

carInput.addEventListener("change",async (e) =>{
  const file = e.target.files[0];
  if (!file) return;

  carName = file.name.replace(".RLSdata","");

  const text = await file.text();   
  car = JSON.parse(text);
  carLoaded = true;

  checkSimulationBtn();
  activateSimSetup();
});


//Select Track
const trackInput = document.querySelector("#selectTrack");

trackInput.addEventListener("change", async (e) =>{
  const file = e.target.files[0];
  if (!file) return;

  trackName = file.name.replace(".glb","");

  const url = URL.createObjectURL(file);

  if(trackMesh) trackMesh.dispose();
  BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, ".glb")
    .then((result) => {
      URL.revokeObjectURL(url);

      trackMeshLoaded = true;
      checkSimulationBtn();

      trackMesh = result.meshes[0];
    });
});


//Select Line
const lineInput = document.querySelector("#selectLineIn");

lineInput.addEventListener("change", async (e) =>{
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();   
  line = JSON.parse(text);

  lineLoaded = true;
  checkSimulationBtn();
});

//Run Simulation Button
const simulationBtn = document.querySelector("#RunSimulation");

function checkSimulationBtn(){
  if(carLoaded && trackMeshLoaded && lineLoaded){
    if(simulationBtn.hasAttribute("disabled")) simulationBtn.removeAttribute("disabled");
  }
}





//Activate Simulation Setup HTML
function activateSimSetup(){
  fetch('/simulationSetup.html')
  .then(response => response.text())
  .then(
    (data) => {
      content.innerHTML = data;

      //Preview Image
      const previewImage = document.querySelector("#previewImage");
      previewImage.setAttribute("src", car.previewImageURL);

      //Car Infos
      const carNameModelYear = document.querySelector("#carNameModelYear");
      carNameModelYear.innerHTML = `${car.manufacture} ${car.model} '<i>${car.year}</i>`

      const category = document.querySelector("#category");
      category.innerHTML = car.category;

      const description = document.querySelector("#description");
      description.innerHTML = car.description;

    });
}

//Render Loop
engine.runRenderLoop(() => {
  scene.render();
});