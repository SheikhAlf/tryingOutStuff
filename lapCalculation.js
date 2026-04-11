function calculateLap(data){
    const simpleCar = {
        mass: 800,
        Cl: -3.5,
        Cd: 0.9,
        A: 1.6,
        Power: 745.7,
        brakingTorque: 6500,
        tyreRadius: 0.56
    }

    const simpleTyre = {
        FrC: 1.5
    }

    let airDens = 1.225;
    let g = 9.81;


    //FORMULAS

    const timeError = 23/100;

    //Lift Force
    function calculateLiftForce(p, V, Cl, A){
        return p/2 * (V**2) *(Cl * -1) * A;
    }


    //Normal Force
    function calculateNormalForce(m, g, Fl, FrC, roll){
        return (m*g+Fl)/(Math.cos(roll) - FrC * Math.sin(roll));
    }


    //Centripetal Force
    function calculateCentripetalForce(m, V, r){
        return (m*(V**2))/r;
    }


    //Friction Force
    function calculateFrictionForce(FrC, roll, N){
        return N*(Math.sin(roll) + FrC * Math.cos(roll));
    }


    //Drag Force
    function calculateDragForce(p, V, Cd, A){
        return p/2 * (V**2) * Cd * A;
    }

    //Friction Limited Acceleration
    function calculateAccelerationFL(m, Fr, Fd){
        return (Fr - Fd)/m
    }


    //Power Limited Acceleration
    function calculateAccelerationPL(m, P, Fd, V){
        let f = ((P * 1000) - Fd * V)/(m * V);
        return f < 0 ? (P/(m*V)) : f;
    }

    function calculateAccelerationBrake(m, Bt, tR, Fd){
        return Bt/(m * tR) + Fd/m
    }


    //Maximum acceleration trought a turn of radius r
    function calculateAccelerationForR(m, aFL, aPL, Fr, Fc){
        let aMin = aFL < aPL ? aFL : aPL;
        let Fmin = m * aMin;
        let Ftemp = 1 < Fmin/Fr ? 1 : Fmin/Fr;
        let FrTot = Fr * (-1 > Ftemp ? -1 : Ftemp);
        let Fres = Math.sqrt(FrTot**2 - Fc**2);
        if(!Fres) Fres = 0;
        return Fres / m;
    }

    //terminal velocity
    function calculateTerminalVel(P, p, Cd, A){
        return Math.cbrt(
                        (2*(P*1000))/   //*1000 to convert from Kw to W
                        (p*Cd*A));
    }

    //Maximum Velocity trought a turn af radius r
    function maxVelforR(m, g, r, FrC, Cl, A, p, roll, AltSpeed){

        Cl *= -1;
        
        let den = (2*m*(Math.cos(roll) - FrC * Math.sin(roll)) - p*Cl*A*r*(Math.sin(roll) + FrC * Math.cos(roll)));

        if(den == 0 || (2*r*m*g*(Math.sin(roll) + FrC * Math.cos(roll)))/den < 0){
            return AltSpeed;
        }else{
            return Math.sqrt(
                            (2*r*m*g*(Math.sin(roll) + FrC * Math.cos(roll)))/den
                        );
                }
    }

    let terminalVel = calculateTerminalVel(simpleCar.Power, airDens, simpleCar.Cd, simpleCar.A);

    //line length test
    let totalDistance = 0;
    for(let i=0; i < data.length-1; i++){
        if(data[i].d) totalDistance += data[i].d;
    }

    console.log("Line Length in m: "+totalDistance);


    let simulatedLap = { 
        nodes: data,
        car: simpleCar,
        tyre: simpleTyre,
        airDensity: airDens,
        lengthInMeters: totalDistance
    }

    //limits pass
    for(let i=0; i < data.length; i++){
        simulatedLap.nodes[i].V = maxVelforR(simpleCar.mass, g, data[i].r, simpleTyre.FrC, simpleCar.Cl, simpleCar.A, airDens, 0, terminalVel);
    }

    //actual lap simulation
    simulatedLap.nodes[0].V = simulatedLap.tyre.FrC * g / simulatedLap.nodes[0].d;
    console.log(simulatedLap.nodes[0]);
    for(let i=1; i < simulatedLap.nodes.length-1; i++){
        let V = simulatedLap.nodes[i-1].V;
        let t = simulatedLap.nodes[i-1].d/V;
        simulatedLap.nodes[i-1].t = t-t*timeError;  //to account for the time error

        let m = simulatedLap.car.mass;
        let P = simulatedLap.car.Power;
        let FrC = simulatedLap.tyre.FrC;
        let roll = 0;
        let Cd = simulatedLap.car.Cd;
        let Cl = simulatedLap.car.Cl;
        let p = simulatedLap.airDensity;
        let A = simulatedLap.car.A;
        let Fl = calculateLiftForce(p, V, Cl, A);

        let N = calculateNormalForce(m, g, Fl, FrC, roll);

        let Fd = calculateDragForce(p, V, Cd, A);

        let Fr = calculateFrictionForce(FrC, roll, N);

        let aFL = calculateAccelerationFL(m, Fr, Fd);

        let Fc = calculateCentripetalForce(m, V, simulatedLap.nodes[i].r);

        let aPL = calculateAccelerationPL(m, P, Fd, V);

        let a = calculateAccelerationForR(m, aFL, aPL, Fr, Fc);

        let newVel = V+a*(t-t*timeError); //to account for the time error

        if(!newVel){
            newVel = V;
        }

        console.log("New Vel: "+newVel);

        console.log(simulatedLap.nodes[i]);

        if (newVel <= simulatedLap.nodes[i].V){ 
            simulatedLap.nodes[i].V = newVel
        }else if(simulatedLap.nodes[i].V != terminalVel && newVel > simulatedLap.nodes[i].V){
            calculateDeceleration(simulatedLap.car, simulatedLap.tyre, simulatedLap.nodes, i);
        }
    }

    simulatedLap.totalTime = 0;

    for(let i=0; i < simulatedLap.nodes.length-2; i++){
        simulatedLap.totalTime += simulatedLap.nodes[i].t;
    }

    console.log("Time: "+simulatedLap.totalTime);


    let csv = "Speed m/s;Speed Km/h\r\n";
    for(let i=0; i < simulatedLap.nodes.length; i++){
        csv += decStringWithComma(simulatedLap.nodes[i].V)+";"+decStringWithComma(simulatedLap.nodes[i].V*3.6)+"\r\n";
    }

    downloadFile(csv);


    function calculateDeceleration(car, tyre, list, endPoint) {
        let i = endPoint - 1;
        let brakingSamples = 0;
        let brakingDistance = 0;

        let m = car.mass;
        let FrC = tyre.FrC;
        let Bt = car.brakingTorque;
        let tR = car.tyreRadius;
        let Cd = car.Cd;
        let Cl = car.Cl;
        let A = car.A;

        while (list[i].V >= list[i+1].V) {
            let V = list[i+1].V;
            let Fl = calculateLiftForce(airDens, V, Cl, A);
            let N = calculateNormalForce(m, g, Fl, FrC, 0);
            let Fr = calculateFrictionForce(FrC, 0, N);
            let Fc = calculateCentripetalForce(m, V, list[i].r);
            let Fd = calculateDragForce(airDens, V, Cd, A);
            let aFL = calculateAccelerationFL(m, Fr, Fd);
            let aBL = calculateAccelerationBrake(m, Bt, tR, Fd);

            let t = list[i].d/V
            let newSpeed = list[i+1].V + calculateAccelerationForR(m, aFL, aBL, Fr, Fc)*(t-t*timeError); //to account for the time error
            if (newSpeed < list[i].V) {
                list[i].V = newSpeed;
                list[i].t = t-t*0.2;
            }
            i--;
            brakingSamples++;
            brakingDistance += list[i].d;
        }

        let BrakingData={maxSpeed: list[i], samples: brakingSamples, distance: brakingDistance};
        return BrakingData;
    }


    function decStringWithComma(num){
        num = String(num);
        let str = "";
        
        for(let i = 0; i < num.length; i++){
            if(num[i]){
                if(num[i] === "."){
                    str += ",";
                }else{
                    str += num[i];
                }
            }
        }

        return str;
    }


    function downloadFile(csv){
    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "simulation.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
}