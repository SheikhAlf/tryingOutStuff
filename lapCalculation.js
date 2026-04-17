function calculateLap(data){
    const simpleCar = {
        mass: 800,
        Cl: -3.3,
        Cd: 0.93,
        A: 1.6,
        Power: 745.7,
        brakingPower: 2000,
        steeringRatio: 12
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
    function calculateAccelerationFL(m, Fr){
        return Fr/m
    }


    //Power Limited Acceleration
    function calculateAccelerationPL(m, P, Fd, V){
        let f = ((P * 1000) - Fd * V)/(m * V);
        return f < 0 ? (P/(m*V)) : f;
    }

    //Maximum acceleration trought a turn of radius r
    function calculateAccelerationForR(m, aFL, aPL, Fr, Fc){
        let a = aFL < aPL ? aFL : aPL;
        let FLat = Fc < Fr ? Fc : Fr;
        let FLatNorm = FLat/Fr;
        return Math.sin(Math.cos(FLatNorm))*a;
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

    //radius from Velocity
    function radiusFromVelocity(m, Fl, V, FrC, roll){
        return (2*(V**2)*m*(Math.cos(roll)-FrC*Math.sin(roll)))/
                ((2*m*g+2*Fl)*(Math.sin(roll)+FrC*Math.cos(roll)));
    }

    //wheels angle from radius (doesn't work)
    function wheelsAngleFromR(r, x1, y1, x2, y2){  //x and y in 2d space from top view
        let x = x1 - x2;
        let y = y1 - y2;
        let dir = Math.atan2(y, x) > 0 ? 1 : -1;
        return Math.atan(2/r)*dir;
    }

    //throttle/brake percentage
    function calculatePedalInput(m, Fd, aPL, a){
        if(aPL <= a) return 100;
        let t = a/aPL*100+(Fd/m)/aPL*100;
        if(t > 100) return 100;
        return t;
    }

    let terminalVel = calculateTerminalVel(simpleCar.Power, airDens, simpleCar.Cd, simpleCar.A);
    
    //deceleration function
    function calculateDeceleration(car, tyre, list, endPoint) {
        let i = endPoint - 1;
        let brakingSamples = 0;
        let brakingDistance = 0;

        let m = car.mass;
        let FrC = tyre.FrC;
        let Bp = car.brakingPower;
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
            let aFL = N*FrC/m;
            let aBL = calculateAccelerationPL(m, Bp, -Fd, V);
            let a = calculateAccelerationForR(m, aFL, aBL, Fr, Fc);

            simulatedLap.nodes[i].throttle = 0;
            simulatedLap.nodes[i].brake = calculatePedalInput(m, Fd, aBL, a);

            let t = list[i].d/V;
            let newSpeed = list[i+1].V + a*(t-t*timeError); //to account for the time error
            if (newSpeed < list[i].V) {
                list[i].V = newSpeed;
                list[i].t = list[i].d/newSpeed;
            }

            simulatedLap.nodes[i].wheelsAngle = wheelsAngleFromR(radiusFromVelocity(m, Fl, newSpeed, FrC, 0), simulatedLap.nodes[i].x, simulatedLap.nodes[i].z, simulatedLap.nodes[i+1].x, simulatedLap.nodes[i+1].z);

            i--;
            brakingSamples++;
            brakingDistance += list[i].d;
        }

        let BrakingData={maxSpeed: list[i], samples: brakingSamples, distance: brakingDistance};
        return BrakingData;
    }

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
    const limitSpeed = [];
    for(let i=0; i < data.length; i++){
        simulatedLap.nodes[i].V = maxVelforR(simpleCar.mass, g, data[i].r, simpleTyre.FrC, simpleCar.Cl, simpleCar.A, airDens, 0, terminalVel);
        limitSpeed.push(simulatedLap.nodes[i].V);
    }

    //actual lap simulation
    simulatedLap.nodes[0].V = simulatedLap.tyre.FrC * g / simulatedLap.nodes[0].d;
    simulatedLap.nodes[0].throttle = 100;
    simulatedLap.nodes[0].brake = 0;
    simulatedLap.nodes[0].wheelsAngle = 0;
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

        let aFL = calculateAccelerationFL(m, Fr);

        let Fc = calculateCentripetalForce(m, V, simulatedLap.nodes[i].r);

        let aPL = calculateAccelerationPL(m, P, Fd, V);

        let a = calculateAccelerationForR(m, aFL, aPL, Fr, Fc);

        let newVel = V+a*(t-t*timeError); //to account for the time error

        simulatedLap.nodes[i].brake = 0;
        simulatedLap.nodes[i].throttle = calculatePedalInput(m, Fd, aPL, a);

        if(!newVel){
            newVel = V;
        }

        simulatedLap.nodes[i].wheelsAngle = wheelsAngleFromR(radiusFromVelocity(m, Fl, V, FrC, 0), simulatedLap.nodes[i].x, simulatedLap.nodes[i].z, simulatedLap.nodes[i+1].x, simulatedLap.nodes[i+1].z);

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


    let csv = "Speed m/s;Speed Km/h;Limit Speed Km/h;Throttle;Brake;Wheels Angle\r\n";
    for(let i=0; i < simulatedLap.nodes.length-1; i++){
        csv += 
        decStringWithComma(simulatedLap.nodes[i].V)+";"+
        decStringWithComma(simulatedLap.nodes[i].V*3.6)+";"+
        decStringWithComma(limitSpeed[i]*3.6)+";"+
        decStringWithComma(simulatedLap.nodes[i].throttle)+";"+
        decStringWithComma(simulatedLap.nodes[i].brake)+";"+
        decStringWithComma(simulatedLap.nodes[i].wheelsAngle*57.2958*simulatedLap.car.steeringRatio)+"\r\n";
    }

    downloadFile(csv);


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