function calculateLap(data){
    const simpleCar = {
        mass: 800,
        Cl: -3,
        Cd: 0.9,
        A: 1.6,
        Power: 745.7,
    }

    const simpleTyre = {
        FrC: 1.6
    }

    let airDens = 1.225;
    let g = 9.81;

    //line length test
    let totalDistance = 0;
    for(let i=0; i < data.length-1; i++){
        if(data[i].d) totalDistance += data[i].d;
    }

    console.log("Line Length in m: "+totalDistance);

    //limits pass
    for(let i=0; i < data.length; i++){
        
    }




    //directly copied from tests, so modifications are needed
    function calculateDeceleration(list, endPoint) {
    let i = endPoint - 1;
    let brakingSamples = 0;
    while (list[i] >= list[i+1]) {
        if (list[i+1] + decelerationForce + similDrag * list[i+1] < list[i-1]) {
            list[i] = list[i+1]+decelerationForce+similDrag * list[i+1];
        }
        i--;
        brakingSamples++;
    }

    let BrakingData={maxSpeed: list[i],samples: brakingSamples};
    return BrakingData;
}
}