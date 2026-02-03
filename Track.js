class TrackNode {
  constructor(x, y, z, next) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.next = next == undefined ? null : next;
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
    this.head = null;
    this.tail = null;
  }

  addPoint(x, y, z) {
  const node = new TrackNode(x, y, z, null);

  if (!this.head) {
    this.head = node;
    this.tail = node;
    return node;
  }
  this.tail.next = node;

  if (this.head.next === node) {
    this.arrowController = this.createArrow(this.head);
  } else if (this.arrowController) {
    this.connect(
      this.head,
      this.arrowController,
      this.head.next
    );
    this.arrowController.dispose();
    delete this.arrowController;
  }
  let c = this.head;
  while (c.next) {
      c = c.next;
  }
  this.tail = c;
  c = this.head;
  while (c.next) {
    if (c.next.next === this.tail) {
      createVerticalLine(c);
      //createVerticalLine(c.next);
      //createVerticalLine(this.tail);
      this.connect(
        c,
        c.next,
        this.tail
      );
      // After connecting, find the new tail
      let temp = this.head;
      while (temp.next) {
        temp = temp.next;
      }
      this.tail = temp;
      return;
    }
    c = c.next;
  }
}


  insert(previousNode, points) {
    let other = new TrackNode(points[0].x, points[0].y, points[0].z);
    //other.render();
    let head = other;
    for (let i = 1; i < points.length; i++) {
      other.next = new TrackNode(points[i].x, points[i].y, points[i].z);
      other = other.next;
      other.render();
    }
    other.next = previousNode.next;
    previousNode.next = head;
  }

  addPoints(points) {
    let n = null;
    for (let i = 0; i < points.length; i++) {
      if (i === 2) {
        this.arrowController.gizmo.position = new BABYLON.Vector3(
          points[i].x, points[i].y, points[i].z
        );
      } else if (i === 3) {
        this.arrowController.dispose();
        delete this.arrowController;  
      } else {
        n = new TrackNode(points[i].x, points[i].y, points[i].z);
        n.projectOntoTrack();
        this.addPoint(n.x, n.y, n.z);
      }
    };
  }

  connect(p1, p2, p3) {
  let combinations = [
    [p1, p2, p3],
    [p1, p3, p2],
    [p2, p1, p3],
    [p2, p3, p1],
    [p3, p1, p2],
    [p3, p2, p1]
  ];
  
  let bestLen = Infinity;
  let bestCombo = null;
  
  combinations.forEach(comb => {
    try {
      let a = BABYLON.Curve3.ArcThru3Points(
        comb[0].toVector(),
        comb[1].toVector(),
        comb[2].toVector(),
        67, false, false
      );
      
      const points = a.getPoints();
      
      if (points && points.length > 0 && a.length() < bestLen) {
        bestLen = a.length();
        bestCombo = comb;
      }
    } catch (e) {
      console.warn("Failed to create arc for combination", comb, e);
    }
  });
  
  if (!bestCombo) {
    console.warn("No valid arc found, using original order");
    bestCombo = [p1, p2, p3];
  }
  
  const numPoints = Math.max(32, Math.floor(bestLen / 10));
  
  const finalArc = BABYLON.Curve3.ArcThru3Points(
    bestCombo[0].toVector(),
    bestCombo[1].toVector(),
    bestCombo[2].toVector(),
    numPoints,
    false,
    false
  );
  
  let points = finalArc.getPoints();
  
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  const distFirstToP1 = BABYLON.Vector3.Distance(firstPoint, p1.toVector());
  const distLastToP3 = BABYLON.Vector3.Distance(lastPoint, p3.toVector());
  
  if (distFirstToP1 > 1 || distLastToP3 > 1) {
    points = points.reverse();
  }
  
  if (points && points.length > 0) {
    const insertPoints = points.slice(1, -1);
    
    if (insertPoints.length > 0) {
      this.insert(p1, insertPoints);
    }
    
    this.arcMesh = BABYLON.MeshBuilder.CreateLines("arcDebug", {
      points: points,
      updatable: false
    });
    this.arcMesh.color = new BABYLON.Color3(0, 0, 1);
  }
  
  return finalArc;
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
    let c = this.head;
    let points = [];
    while (c) {
      points.push(new BABYLON.Vector3(c.x, c.y, c.z));
      c = c.next;
    }
    return points;
  }

  toString() {
    let current = this.head;
    let s = "";
    while (current) {
      s = s + "x:" + current.x + ", y:" + current.y + ", z:" + current.z + "; ";
      current = current.next;
    }
    return s;
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