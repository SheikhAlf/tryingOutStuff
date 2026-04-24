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
  
  const pathPoints = path.getPoints();
  const nodes = path.nodes;
  let currentIndex = 0;
  
  engine.runRenderLoop(() => {
    scene.render();
    
    if (currentIndex < pathPoints.length - 2) {
      const current = pathPoints[currentIndex];
      const next = pathPoints[currentIndex + 1];
      const speed = nodes[currentIndex].d / (nodes[currentIndex].t * engine.getFps());
      const direction = next.subtract(car.position).scale(speed);
      
      car.position.addInPlace(direction);
      
      const angle = Math.atan2(direction.x, direction.z) + Math.PI;
      car.rotation.y = angle;
      
      if (BABYLON.Vector3.Distance(car.position, next) < speed) {
        currentIndex++;
        car.position.copyFrom(next);
      }
    }
  });
}