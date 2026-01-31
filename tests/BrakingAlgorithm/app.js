let canvas = document.getElementById('canvas');
canvas.width = 1000;
canvas.height = 700;
let ctx = canvas.getContext('2d');
let accelerationForce = 0.6;
let decelerationForce = 1;
let similDrag = 0.003;
let dataDiv = document.querySelector("#data");

const nodesList = [];

for(let i=0; i < 1000; i++){
    if(i == 0){
        nodesList[i]=accelerationForce;
    }else{
         nodesList[i] = accelerationForce-similDrag*nodesList[i-1]+nodesList[i-1];
    }
    console.log(nodesList[i]);
}

ctx.beginPath();
ctx.strokeStyle = "blue"
ctx.lineWidth = 7;
for(let i=0; i < nodesList.length; i++){
     ctx.moveTo(i, canvas.height - nodesList[i]);
     ctx.lineTo(i+1, canvas.height - nodesList[i+1]);
     ctx.stroke();
}

ctx.fill();
ctx.closePath();

nodesList[nodesList.length-1] = 0;



for(i=0; i < nodesList.length-1; i++){
    if(nodesList[i] > nodesList [i+1]){
        let data = calculateDeceleration(nodesList, i+1);
        dataDiv.innerHTML+= "Car successfully stopped from a speed of "+ data.maxSpeed+" to still in a space of "+ data.samples+" samples.";
    }
}

ctx.beginPath();
ctx.strokeStyle = "red"
ctx.lineWidth = 2;
for(let i=0; i < nodesList.length; i++){
     ctx.moveTo(i, canvas.height - nodesList[i]);
     ctx.lineTo(i+1, canvas.height - nodesList[i+1]);
     ctx.stroke();
}

ctx.fill();
ctx.closePath();


function calculateDeceleration(list, endPoint){
    let i = endPoint-1;
    let brakingSamples = 0;
    while(list[i] >= list[i+1]){
        if(list[i+1]+decelerationForce+similDrag*list[i+1] < list[i-1]){
            list[i] = list[i+1]+decelerationForce+similDrag*list[i+1];
        }
        i--;
        brakingSamples++;
    }

    let BrakingData={maxSpeed: list[i],samples: brakingSamples};
    return BrakingData;
}