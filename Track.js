class TrackNode {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toVector() {
    return new BABYLON.Vector3(
      this.x,
      this.y,
      this.z
    );
  }

  projectOntoTrack() {
    const origin = new BABYLON.Vector3(
      this.x,
      1000,
      this.z
    );

    const ray = new BABYLON.Ray(
      origin,
      BABYLON.Vector3.Down(),
      2000
    );

    const hit = scene.pickWithRay(ray, m => {
      return trackMeshes.includes(m);
    });

    if (hit && hit.pickedPoint) {
      this.y = hit.pickedPoint.y;
    }
  }

  render() {
    const nodeMesh = BABYLON.MeshBuilder.CreateSphere(
      "node",
      { diameter: 4 },
      scene
    );
    nodeMesh.position.copyFrom(new BABYLON.Vector3(this.x, this.y, this.z));
    const mat = new BABYLON.StandardMaterial("nodeMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    nodeMesh.material = mat;
  }  
}


class Track {
  constructor() {
    this.nodes = [];
  }

  addPoint(x, y, z) {
    const node = new TrackNode(x, y, z);
    this.nodes.push(node);
    
    if (this.nodes.length === 1) {
      return node;
    }
    
    if (this.nodes.length === 2) {
      this.arrowController = this.createArrow(this.nodes[0]);
      return node;
    }
    
    if (this.nodes.length === 3) {
      this.connect(
        this.nodes[0],
        this.arrowController,
        this.nodes[1]
      );
      this.arrowController.dispose();
      delete this.arrowController;
    }
    let len = this.nodes.length;
    this.connect(
      this.nodes[len-3],
      this.nodes[len-2],
      this.nodes[len-1]
    );
    
    return node;
  }

  insert(index, points) {
    const insertNodes = points.map(p => new TrackNode(p.x, p.y, p.z));
    this.nodes.splice(index + 1, 0, ...insertNodes);
  }

  connect(p1, p2, p3) {
    const numPoints = 33;
    
    const arc = BABYLON.Curve3.ArcThru3Points(
      p1.toVector(),
      p2.toVector(),
      p3.toVector(),
      numPoints,
      false,
      false
    );
    
    let points = arc.getPoints();
    
    const insertPoints = points.slice(1, -2);
    
    if (insertPoints.length > 0) {
      const p3Index = this.nodes.indexOf(p3);
      if (p3Index !== -1) {
        const insertNodes = insertPoints.map(p =>
          new TrackNode(p.x, p.y, p.z)
        );

        this.nodes.splice(p3Index, 0, ...insertNodes);
      }
    }
    
    this.arcMesh = BABYLON.MeshBuilder.CreateLines("arcDebug", {
      points: points,
      updatable: false
    });
    this.arcMesh.color = new BABYLON.Color3(0, 0, 1);
    
    return arc;
  }

  createArrow(node) {
    const pos = node.toVector();

    const sphere = BABYLON.MeshBuilder.CreateSphere("gizmoSphere", { diameter: 1 }, scene);
    sphere.position.copyFrom(pos);

    const mat = new BABYLON.StandardMaterial("gizmoMat", scene);
    mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    sphere.material = mat;

    const gizmo = new BABYLON.PositionGizmo();
    gizmo.attachedMesh = sphere;
    gizmo.yGizmo.isEnabled = false;

    gizmo.onDragObservable.add(() => {
      if (!trackMeshes.length) {
        return;
      }

      const origin = new BABYLON.Vector3(
        sphere.position.x,
        1000,
        sphere.position.z
      );

      const ray = new BABYLON.Ray(origin, BABYLON.Vector3.Down(), 2000);
      const hit = scene.pickWithRay(ray, m => trackMeshes.includes(m));

      if (hit && hit.pickedPoint) {
        sphere.position.y = hit.pickedPoint.y;
      }

      gizmo.position = new BABYLON.Vector3(
        sphere.position.x,
        sphere.position.y,
        sphere.position.z
      );
    });

    const arrowController = {
      mesh: sphere,
      gizmo: gizmo,
      toVector() {
        return gizmo.position;
      },
      dispose() {
        if (this.gizmo) {
          this.gizmo.attachedMesh = null;
          this.gizmo.dispose();
          this.gizmo = null;
        }
        if (this.mesh) {
          this.mesh.dispose();
          this.mesh = null;
        }
      }
    }

    return arrowController;
  }

  getPoints() {
    return this.nodes.map(node => new BABYLON.Vector3(node.x, node.y, node.z));
  }

  toString() {
    return this.nodes.map(node => 
      `x:${node.x}, y:${node.y}, z:${node.z}`
    ).join("; ");
  }
}

function createVerticalLine(node, height = 100) {
  const startPoint = node.toVector();
  const endPoint = new BABYLON.Vector3(
    node.x,
    node.y + height,
    node.z
  );
  
  const line = BABYLON.MeshBuilder.CreateLines("verticalLine", {
    points: [startPoint, endPoint],
    updatable: false
  });
  
  line.color = new BABYLON.Color3(1, 1, 0); 
  
  return line;
}