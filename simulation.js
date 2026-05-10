async function startSimulation(path, scene, engine) {

  calculateLap(path.nodes);

  if (path.nodes.length < 2) {
    return;
  } 
  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "F1_2022_LowPoly.glb", scene);
  const car = result.meshes[0];
  
  car.rotationQuaternion = null;
  
  car.position.copyFrom(path.nodes[0].toVector());
  
  const fc = new BABYLON.FollowCamera(
    "FollowCamera",
    car.position.add(new BABYLON.Vector3(0, 10, -20)),
    scene,
    car
  );
  fc.radius = 15;
  fc.heightOffset = 7;
  fc.rotationOffset = 180;
  fc.cameraAcceleration = 0.05;
  fc.maxCameraSpeed = 10;
  scene.activeCamera = fc;
  
  const points = path.getPoints();
  const FRAME_RATE = 60;
  const movement = new BABYLON.Animation(`movement`, "position", FRAME_RATE,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const rotation = new BABYLON.Animation(`rotation`, "rotation", FRAME_RATE,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const movementKeysFrames = [];
  const rotationKeysFrames = [];
  let t = 0; 

  for (let i = 0; i < points.length - 2; i++) {
    movementKeysFrames.push({
      frame: FRAME_RATE * t,
      value: points[i+1]
    });
    const direction = points[i+1].subtract(points[i]); 
    const rotY = Math.atan2(direction.x, direction.z) + Math.PI;
    const rotX = -Math.asin(direction.y);
    const rotZ = 0;
    rotationKeysFrames.push({
      frame: FRAME_RATE * t,
      value: new BABYLON.Vector3(rotX, rotY, rotZ)
    });
    t += path.nodes[i].t; 
  }
  movement.setKeys(movementKeysFrames);
  rotation.setKeys(rotationKeysFrames);
  car.animations.push(movement);
  car.animations.push(rotation);

  scene.beginAnimation(car, 0, t * FRAME_RATE);
}