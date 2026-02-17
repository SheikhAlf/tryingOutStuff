let car={
    manufacture: "",
    model: "",
    year: 0,
    category:"",
    description: "",

    mass: {min: null, max: null},
    fuel: {min: null, max: null},

    area: {min: null, max: null},
    Cl: {min: null, max: null},
    Cd: {min: null, max: null},
    bindedAero: false,

    Fan:{
        force:{min: null, max: null},
        fuelConsumption:{min: null, max: null},
        energyConsumption:{min: null ,max: null},
        bindedPowerConsumption: false,

        deploySpeed:{min: null, max: null},
        deployCutSpeed:{min: null, max: null}
    },

    steeringRatio: 1,

    brakingTorque:{min: null,max: null},
    AvrgWheelRadius: 0.5,

    ICE:{
        hasICE: false,
        power:{min: null,max: null},
        powerCap:{min: null, max: null},
        fuelConsumption:{min: null, max: null},
        bindedPowerConsumption: false,
        powerCanBeZero: false,
        engineBraking: null,

        deploySpeed:{min: null,max: null},
        deployCutSpeed:{min: null,max: null}
    },


    EE:{
        hasEE: false,
        power:{min: null, max: null},
        powerCap:{min: null, max: null},
        energyConsumption:{min: null, max: null},
        bindedPowerConsumption: false,

        powerCanBeZero: false,
        engineBraking: {min: null, max: null},
        energyRecovery: {min: null, max: null},
        bindedBrakingRecovery: false,

        deployPerLap:{min: null, max: null},
        recoveryPerLap:{min: null, max: null},

        deploySpeed:{min: null, max: null},
        deployCutSpeed:{min: null,max: null}
    },


    PU:{
        powerCap:{min: null, max: null},
        topSpeedCap:{min: null, max: null}
    },


    gearBox:{
        RPM:{
            idle: null, 
            min: null, 
            shift: null,
            max: null, 
            variation: null
        },

        
        gears:[
            0
        ]
    }
};

//remove function in the final version
function activateCarUi(){
//Car Ui inputs
manufactureIn = document.querySelector("#manufactureIn");
modelIn = document.querySelector("#modelIn");
yearIn = document.querySelector("#yearIn");
categoryIn = document.querySelector("#categoryIn");
descriptionIn = document.querySelector("#descriptionIn");


//inputs events
manufactureIn.addEventListener("change", (e) =>{
    car.manufacture = manufactureIn.value;
});

modelIn.addEventListener("change", (e) =>{
    car.model = modelIn.value;
});

yearIn.addEventListener("change", (e) =>{
    car.year = yearIn.value;
});

categoryIn.addEventListener("change", (e) =>{
    car.category = categoryIn.value;
});

manufactureIn.addEventListener("change", (e) =>{
    car.manufacture = manufactureIn.value;
});

descriptionIn.addEventListener("change", (e) =>{
    car.description = descriptionIn.value;
});



//image
const previewImage = ui.querySelector("#previewImage");
const previewImageInput = ui.querySelector("#selectImageInput");

previewImageInput.addEventListener('change', async (event)=>{
  const file = event.target.files[0]; 
  const url = URL.createObjectURL(file);

  previewImageFile = file;

  previewImage.setAttribute("src", url);
});

}

function activateAnimations(){
//Animations Inputs

wheelsRadiusIn = document.querySelector("#wheelsRadiusIn");
steeringRatioIn = document.querySelector("#steeringRatioIn");

steeringRatioIn.addEventListener("change", (e) =>{
    car.steeringRatio = Number(steeringRatioIn.value);
});

wheelsRadiusIn.addEventListener("change", (e) =>{
    car.AvrgWheelRadius = Number(wheelsRadiusIn.value);
    radius = car.AvrgWheelRadius;
});


//sliders
steeringSlider = document.querySelector("#steeringIn");
steeringValue = document.querySelector("#steeringValue");


steeringSlider.addEventListener("input", (e) =>{
    steeringValue.innerHTML = e.target.value+"°";

    if(meshLoaded){
        //console.log("Components for steering animation found");

        steerableWheel.forEach(wheel => {
            wheel.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, e.target.value * Math.PI/180);
        });

        steerables.forEach(steer =>{
            steer.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, e.target.value * Math.PI/180);
        });

        steeringWheel.forEach(steer =>{
            steer.rotation = new BABYLON.Vector3(0, 0, (e.target.value * Math.PI/180)*car.steeringRatio);
        });
    }
});



speedSlider = document.querySelector("#speedIn");
speedValue = document.querySelector("#speedValue");

speedSlider.addEventListener("input", (e) =>{
    speedValue.innerHTML = e.target.value+" Km/h";

    if(meshLoaded && radius){
        //console.log("Components for rolling animation found");
        wheelsSpeedRotation = (e.target.value/3.6)/(radius*60);
    }
});

}


//export
function exportCarJSON(){
    return JSON.stringify(car, null, 2);
}


const saveCar = document.querySelector('#saveCar');
saveCar.addEventListener("click", () => {
  const json = exportCarJSON();
  const blob = new Blob(
    [json],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "newCar.json";
  a.click();
  URL.revokeObjectURL(url);
});