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

    //arrowController will exist just for the first 2 nodes
    if (this.head.next === node) {
      this.arrowController = this.createArrow(this.head);
    } else if (this.arrowController) {
      this.connect(
        this.head,
        this.arrowController,
        this.head.next
      ).getPoints()
      this.arrowController.dispose();
      delete this.arrowController;
      this.tail = this.tail.next;
      return;
    }
    this.tail = this.tail.next;
    return node;
  }

  insert(previousNode, sublist) {
    let c = sublist.head;
    while (c) {
      c.render();
      c = c.next;
    }
    sublist.tail.next = previousNode.next;
    previousNode.next = sublist.head;
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
    let arc = BABYLON.Curve3.ArcThru3Points(
      p1.toVector(),
      p2.toVector(),
      p3.toVector(),
      67, false, false
    );
    const len = Math.floor(arc.length());
    arc = BABYLON.Curve3.ArcThru3Points(
      p1.toVector(),
      p2.toVector(),
      p3.toVector(),
      len, false, false
    );
    let subtrack = new Track();
    subtrack.addPoints(arc.getPoints());
    this.insert(p1, subtrack);
    this.arcMesh = BABYLON.MeshBuilder.CreateLines("arcDebug", {
      points: subtrack.getPoints(),
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
