let car={
    manufacture: "",
    model: "",
    year: 0,
    category:"",
    description: "",

    mass: {min: 0, max: 0},
    fuel: {min: 0, max: 0},

    area: {min: 0, max: 0},
    Cl: {min: 0, max: 0},
    Cd: {min: 0, max: 0},
    bindedAero: false,

    Fan:{
        hasFan: false,
        force:{min: 0, max: 0},
        fuelConsumption:{min: 0, max: 0},
        energyConsumption:{min: 0 ,max: 0},
        bindedPowerConsumption: false,

        deploySpeed:{min: 0, max: 0},
        deployCutSpeed:{min: 0, max: 0}
    },

    steeringRatio: 1,

    brakingTorque:{min: 0,max: 0},
    AvrgWheelRadius: 0.5,

    ICE:{
        hasICE: false,
        power:{min: 0,max: 0},
        fuelConsumption:{min: 0, max: 0},
        bindedPowerConsumption: false,
        powerCanBeZero: false,
        engineBraking: 0,

        deploySpeed:{min: 0,max: 0},
        deployCutSpeed:{min: 0,max: 0}
    },


    EE:{
        hasEE: false,
        power:{min: 0, max: 0},
        energyConsumption:{min: 0, max: 0},
        bindedPowerConsumption: false,

        powerCanBeZero: false,
        engineBraking: {min: 0, max: 0},
        energyRecovery: {min: 0, max: 0},
        bindedBrakingRecovery: false,

        deployPerLap:{min: 0, max: 0},
        recoveryPerLap:{min: 0, max: 0},

        deploySpeed:{min: 0, max: 0},
        deployCutSpeed:{min: 0,max: 0}
    },


    PU:{
        powerCap:{min: 0, max: 0},
        splitAtCap:{min: [0,0], max: [0,0]},
        topSpeedCap:{min: 0, max: 0}
    },


    gearBox:{
        RPM:{
            idle: 0, 
            min: 0, 
            shift: 0,
            max: 0, 
            variation: 0
        },

        
        gears:[
            0
        ]
    },

    cameras:{
        driverCam:{
            x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
        },

        Tcam:{
            x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
        },

        bumperCam:{
            x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
        },

        onboard1:{
            x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
        },

        onboard2:{
            x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
        },

        onboard3:{
            x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
        },
    }
};


//you can find activateCarUi at the end of uiScript

function activateCarSetup(){
fetch('/src/carSetup.html')
.then(response => response.text())
.then(
    (data) => {
        content.innerHTML = data;

        //Car Setup Inputs

        //Mass
        const massMin = document.querySelector("#massMinIn");
        const massMax = document.querySelector("#massMaxIn");

        massMin.value = car.mass.min;
        massMax.value = car.mass.max;

        massMin.addEventListener("change", (e) => {
            car.mass.min = Number(massMin.value);
        });

        massMax.addEventListener("change", (e) => {
            car.mass.max = Number(massMax.value);
        });


        
    });
}



function activateAnimations(){
//Animations

fetch('/src/animations.html')
.then(response => response.text())
.then(
    (data) => {
        content.innerHTML = data;

        //Animations Inputs
        
        const wheelsRadiusIn = document.querySelector("#wheelsRadiusIn");
        const steeringRatioIn = document.querySelector("#steeringRatioIn");

        steeringRatioIn.value = car.steeringRatio;
        wheelsRadiusIn.value = car.AvrgWheelRadius;
        
        steeringRatioIn.addEventListener("change", (e) =>{
            car.steeringRatio = Number(steeringRatioIn.value);
        });
        
        wheelsRadiusIn.addEventListener("change", (e) =>{
            car.AvrgWheelRadius = Number(wheelsRadiusIn.value);
            radius = car.AvrgWheelRadius;
        });
        
        
        //sliders
        const steeringSlider = document.querySelector("#steeringIn");
        const steeringValue = document.querySelector("#steeringValue");
        
        
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

                helmet.forEach(element =>{
                    element.rotation = new BABYLON.Vector3(0, - e.target.value * Math.PI/180, 0);
                    console.log(helmet);
                });
            }
        });
        
        
        
        const speedSlider = document.querySelector("#speedIn");
        const speedValue = document.querySelector("#speedValue");
        
        speedSlider.addEventListener("input", (e) =>{
            speedValue.innerHTML = e.target.value+" Km/h";
        
            if(meshLoaded && radius){
                //console.log("Components for rolling animation found");
                wheelsSpeedRotation = (e.target.value/3.6)/(radius*60);
            }
        });


});

}



function activateCameras(){
    //Cameras

    fetch('/src/cameras.html')
    .then(response => response.text())
    .then(
        (data) => {
            content.innerHTML = data;

            let currentCamera = car.cameras.driverCam;


            //Camera Lock button
            const cameraLockButton = document.querySelector("#cameraLock");
            let cameraLockLabel = {element: document.querySelector("#cameraLockLabel"), state: 0}

            //inputs
            const XIn = document.querySelector("#XIn");
            const YIn = document.querySelector("#YIn");
            const ZIn = document.querySelector("#ZIn");
            const PitchIn = document.querySelector("#PitchIn");
            const YawIn = document.querySelector("#YawIn");
            const RollIn = document.querySelector("#RollIn");
            const fovIn = document.querySelector("#fovIn");
            const hideHelmetIn = {element: document.querySelector("#hideHelmet"), state:0};


            XIn.value = currentCamera.x;
            YIn.value = currentCamera.y;
            ZIn.value = currentCamera.z;
            PitchIn.value = currentCamera.pitch;
            YawIn.value = currentCamera.yaw;
            RollIn.value = currentCamera.roll;
            fovIn.value = currentCamera.fov;


            XIn.addEventListener("change", (e)=>{
                if(e.target.value) currentCamera.x = Number(e.target.value);

                if(cameraLockLabel.state == 1) freeCamera._position._x = currentCamera.x;
            });

            YIn.addEventListener("change", (e)=>{
                if(e.target.value) currentCamera.y = Number(e.target.value);

                if(cameraLockLabel.state == 1) freeCamera._position._y = currentCamera.y;
            });

            ZIn.addEventListener("change", (e)=>{
                if(e.target.value) currentCamera.z = Number(e.target.value);

                if(cameraLockLabel.state == 1) freeCamera._position._z = currentCamera.z;
            });

            PitchIn.addEventListener("change", (e)=>{
                if(e.target.value) currentCamera.pitch = Number(e.target.value);

                if(cameraLockLabel.state == 1) freeCamera.rotation._x = currentCamera.pitch;
            });

            YawIn.addEventListener("change", (e)=>{
                if(e.target.value) currentCamera.yaw = Number(e.target.value);

                if(cameraLockLabel.state == 1) freeCamera.rotation._y = currentCamera.yaw;
            });

            RollIn.addEventListener("change", (e)=>{
                if(e.target.value) currentCamera.roll = Number(e.target.value);

                if(cameraLockLabel.state == 1) freeCamera.rotation._z = currentCamera.roll;
            });

            fovIn.addEventListener("change", (e)=>{
                if(e.target.value) currentCamera.fov = Number(e.target.value);

                if(cameraLockLabel.state == 1) freeCamera.fov = currentCamera.fov;
            });

            hideHelmetIn.element.addEventListener("change", (e)=>{
                if(hideHelmetIn.state == 0){
                    hideHelmet();
                    hideHelmetIn.state = 1;
                }else{
                    showHelmet();
                    hideHelmetIn.state = 0;                    
                }
            });


            function reloadPositionInputs(){
                XIn.value = currentCamera.x;
                YIn.value = currentCamera.y;
                ZIn.value = currentCamera.z;
                PitchIn.value = currentCamera.pitch
                YawIn.value = currentCamera.yaw;
                RollIn.value = currentCamera.roll;
                fovIn.value = currentCamera.fov;
            }

            function loadCurrentCameraDataInFC(){
                console.log(freeCamera);
                freeCamera._position._x = currentCamera.x;
                freeCamera._position._y = currentCamera.y;
                freeCamera._position._z = currentCamera.z;
                freeCamera.rotation._x = currentCamera.pitch;
                freeCamera.rotation._y = currentCamera.yaw;
                freeCamera.rotation._z = currentCamera.roll;
                freeCamera.fov = currentCamera.fov;
            }





            //Camera Lock button event
        
            cameraLockButton.addEventListener("click", (e) =>{
                if(cameraLockLabel.state == 0){
                    cameraLockLabel.element.textContent = "Unlock view ○";
                    cameraLockLabel.state = 1;
                    freeCamera.detachControl(canvas);
                    fovChange = 0;
                    loadCurrentCameraDataInFC();
                }else if( cameraLockLabel.state == 1){
                    cameraLockLabel.element.textContent = "Lock view ●";
                    cameraLockLabel.state = 0;
                    freeCamera.attachControl(canvas, true);
                    fovChange = 0.0005;
                }
            });
        
        
            
            //Camera set buttons
            const driverCamElement = document.querySelector("#DriverCam");
            const TcamElement = document.querySelector("#Tcam");
            const bumperCamElement = document.querySelector("#BumperCam");
            const OnboardCam1Element = document.querySelector("#OnboardCam1");
            const OnboardCam2Element = document.querySelector("#OnboardCam2");
            const OnboardCam3Element = document.querySelector("#OnboardCam3");

            //label
            const cameraLabel = document.querySelector("#cameraTitle");
        
        
            driverCamElement.addEventListener("click", (e)=>{
                currentCamera = car.cameras.driverCam;
                reloadPositionInputs();
                loadCurrentCameraDataInFC();

                cameraLabel.innerHTML = e.target.textContent;
            });

            TcamElement.addEventListener("click", (e)=>{
                currentCamera = car.cameras.Tcam;
                reloadPositionInputs();
                loadCurrentCameraDataInFC();

                cameraLabel.innerHTML = e.target.textContent;
            });

            bumperCamElement.addEventListener("click", (e)=>{
                currentCamera = car.cameras.bumperCam;
                reloadPositionInputs();
                loadCurrentCameraDataInFC();

                cameraLabel.innerHTML = e.target.textContent;

                showHelmet();
            });

            OnboardCam1Element.addEventListener("click", (e)=>{
                currentCamera = car.cameras.onboard1;
                reloadPositionInputs();
                loadCurrentCameraDataInFC();

                cameraLabel.innerHTML = e.target.textContent;

                showHelmet();
            });

            OnboardCam2Element.addEventListener("click", (e)=>{
                currentCamera = car.cameras.onboard2;
                reloadPositionInputs();
                loadCurrentCameraDataInFC();

                cameraLabel.innerHTML = e.target.textContent;

                showHelmet();
            });

            OnboardCam3Element.addEventListener("click", (e)=>{
                currentCamera = car.cameras.onboard3;
                reloadPositionInputs();
                loadCurrentCameraDataInFC();

                cameraLabel.innerHTML = e.target.textContent;

                showHelmet();
            });
        
        
            const setCurrentCamera = document.querySelector("#setCameraCurrent");
        
            setCurrentCamera.addEventListener("click", (e)=>{
                currentCamera.x = freeCamera._deferredPositionUpdate._x;
                currentCamera.y = freeCamera._deferredPositionUpdate._y;
                currentCamera.z = freeCamera._deferredPositionUpdate._z;
                currentCamera.pitch = freeCamera.rotation._x;
                currentCamera.yaw = freeCamera.rotation._y;
                currentCamera.roll = freeCamera.rotation._z;
                currentCamera.fov = freeCamera.fov;

                reloadPositionInputs();
            });
        });

}

//inport
const selectCarDataFileBtn = document.querySelector("#selectCarDataFile");
const selectCarDataFileIn = document.querySelector("#selectCarDataFileIn");

selectCarDataFileIn.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }  
    const text = await file.text();   
    car = JSON.parse(text);

    radius = car.AvrgWheelRadius;

    switch (activeTab){
        case "carUi":
            activateCarUi();
            break;
        case "carSetup":
            activateCarSetup();
            break;
        case "animations":
            activateAnimations();
            break;
        case "camera":
            activateCameras();
            break;
    }
});


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
  a.download = "car.RLSdata";
  a.click();
  URL.revokeObjectURL(url);
});