window.addEventListener('load', () => {
    let canvas = document.querySelector("canvas");
    canvas.width = 500;
    canvas.height = 500;
    let ctx = canvas.getContext("2d");
    let height = canvas.height;
    let width = canvas.width;

    let points = [];

    canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (points.length === 3) {
            points = [];

        }
        points.push(world(mouseX, mouseY));

        if (points[0]) {
            point(screen(points[0]), "red");
        }
        if (points[1]) {
            point(screen(points[1]), "green");   
        }
        if (points[2]) {
            point(screen(points[2]), "blue");   
        }

        if (points.length == 3) {
            ark(points[0], points[1], points[2]);
        }
    });

    function world(x, y) {
        return {
            x: x - width / 2,
            y: height / 2 - y
        };
    }


    function screen(p) {
        return {
            "x": width/2 + p.x,
            "y": height/2 - p.y 
        }
    }

    function point(p, color) {
        if (color === undefined) {
            color = "black";
        }
        ctx.fillStyle = color;
        let d = 10;
        ctx.fillRect(p.x - d/2, p.y - d/2, d, d);
    }

    function ark(p1, p2, p3) {
        let mr = (p2.y - p1.y) / (p2.x - p1.x);
        let mt = (p3.y - p2.y) / (p3.x - p2.x);

        let x = 0;
        x += mr * mt * (p3.y - p1.y);
        x += mr * (p2.x + p3.x);
        x += -1 * mt * (p1.x + p2.x);
        x = x / (2 * (mr - mt));

        let y = 1;
        y = y * (-1)/mr;
        y = y * (x - (p1.x + p2.x)/2);
        y += (p1.y + p2.y)/2;

        let r = 0;
        r = Math.sqrt(
        (x - p1.x) ** 2 +
        (y - p1.y) ** 2
        );

        let c = screen({x, y});

        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, 2 * Math.PI);
        ctx.stroke();

        return {
            "c": c, 
            "r": r
        }    
    }
});