async function startSimulation(path, scene, engine) {
  if (path.nodes.length < 2) {
    return;
  } 

  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "FormulaPrototype.glb", scene);
  const car = result.meshes[0];
  car.position.copyFrom(path.nodes[0].toVector());

  const fc = new BABYLON.FollowCamera(
    "FollowCamera",
    car.position.add(new BABYLON.Vector3(0, 10, -20)),
    scene,
    car
  );
  fc.radius = 60;
  fc.heightOffset = 70;
  fc.rotationOffset = 0;
  fc.cameraAcceleration = 0.05;
  fc.maxCameraSpeed = 10;

  scene.activeCamera = fc;

  const pathPoints = path.getPoints();
  let currentIndex = 0;
  const speed = 0.5;

  engine.runRenderLoop(() => {
    if (currentIndex < pathPoints.length - 1) {
      const current = pathPoints[currentIndex];
      const next = pathPoints[currentIndex + 1];
      const direction = next.subtract(current).normalize();
      car.position.addInPlace(direction.scale(speed));
      if (BABYLON.Vector3.Distance(car.position, next) < speed) {
      currentIndex++;
      car.position.copyFrom(next);
      }
      car.rotation.y = Math.atan2(direction.x, direction.z);
    }
  })
}
