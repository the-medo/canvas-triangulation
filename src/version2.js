
const points = {}
let w, h;
let stepCount = 0;
const triangles = {};
const trianglesToCheck = [];

const intToPoint = (n) => {
    const point = {
        x: n % w,
            y: Math.floor(n / w),
    }

    // if (point.x === w - 1) point.x = w;
    // if (point.y === h - 1) point.y = h;
    return point;
}

function crossProduct(a,b,c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function isPointInTriangle(P, T) {
    const A = T.vertices[0]
    const B = T.vertices[1]
    const C = T.vertices[2]
    const Pp = intToPoint(P);
    const Pa = intToPoint(A);
    const Pb = intToPoint(B);
    const Pc = intToPoint(C);

    // Cross products
    let cross1 = crossProduct(Pa, Pb, Pp);
    let cross2 = crossProduct(Pb, Pc, Pp);
    let cross3 = crossProduct(Pc, Pa, Pp);

    // Check if point is on the same side of each line
    return (cross1 >= 0 && cross2 >= 0 && cross3 >= 0) || (cross1 <= 0 && cross2 <= 0 && cross3 <= 0);
}

let triangleCount = 0;


function addTriangle(a,b,c) {
    triangleCount++;
    triangles[triangleCount] = {
        id: triangleCount,
        active: true,
        vertices: [a, b, c],
        pixels: [],
        rgb: {r:0, g:0, b:0},
        neighbors: [],
    };

    return triangles[triangleCount];
}

window.onload = function() {
    var hiddenCanvas = document.getElementById('hiddenCanvas');
    var hiddenContext = hiddenCanvas.getContext('2d');
    hiddenCanvas.width = hiddenCanvas.clientWidth;
    hiddenCanvas.height = hiddenCanvas.clientHeight;

    var displayedCanvas = document.getElementById('displayedCanvas');
    var displayedContext = displayedCanvas.getContext('2d');
    displayedCanvas.width = displayedCanvas.clientWidth;
    displayedCanvas.height = displayedCanvas.clientHeight;

    var image = new Image();

    const ratio = (displayedCanvas.width / hiddenCanvas.width) + 7/hiddenCanvas.width ;

    image.onload = function() {
        hiddenContext.drawImage(image, 0, 100, hiddenCanvas.width, hiddenCanvas.height, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
        w = hiddenCanvas.width;
        h = hiddenCanvas.height;

        let imageData = hiddenContext.getImageData(0,0,w,h)



        function step() {
            stepCount++;
            console.log(" ========================================== Step: ", stepCount)
            const newPoint = Math.floor(Math.random() * (w*h))
            const triangleIdOfNewPoint = points[newPoint]
            if (!triangleIdOfNewPoint) return;

            const triangle = triangles[triangleIdOfNewPoint];
            if (!triangle) return;

            const newPointIsVerticeOfTriangle = triangle.vertices.find(p => p === newPoint) !== undefined
            if (newPointIsVerticeOfTriangle) return;


            //get random neighbor
            const neighbor = triangles[triangle.neighbors[Math.floor(Math.random() * triangle.neighbors.length)]];
            if (!neighbor) return;

            //get touching and non-touching points
            const point4 = neighbor.vertices.find(v => !triangle.vertices.includes(v));
            const point1 = triangle.vertices.find(v => !neighbor.vertices.includes(v));
            const touchingPoints = neighbor.vertices.filter(v => triangle.vertices.includes(v));
            console.log(touchingPoints.length);
            if (point4 === undefined || point1 === undefined || touchingPoints.length !== 2) return;


            //get new neighbors = neighbors of current triangle and neighbors of chosen neighboring triangle
            const newNeighbors = [];
            triangle.neighbors.forEach(t => {
                if (t !== neighbor.id) newNeighbors.push(t)
            });
            neighbor.neighbors.forEach(t => {
                if (t !== triangle.id) newNeighbors.push(t)
            });


            //deactivate active+neighbor triangles
            triangle.active = false;
            neighbor.active = false;

            //create new triangles
            trianglesToCheck.length = 0;
            trianglesToCheck.push(addTriangle(touchingPoints[0], newPoint, point1));
            trianglesToCheck.push(addTriangle(touchingPoints[1], newPoint, point1));
            trianglesToCheck.push(addTriangle(touchingPoints[0], newPoint, point4));
            trianglesToCheck.push(addTriangle(touchingPoints[1], newPoint, point4));

            triangles[triangleCount-3].neighbors = [triangleCount-2, triangleCount-1]
            triangles[triangleCount-2].neighbors = [triangleCount-3, triangleCount]
            triangles[triangleCount-1].neighbors = [triangleCount-3, triangleCount]
            triangles[triangleCount].neighbors = [triangleCount-2, triangleCount-1]

            newNeighbors.forEach(nn => {
                const t = triangles[nn];
                const createdT = trianglesToCheck.find(x => t.vertices.filter(v => x.vertices.includes(v)).length === 2);

                createdT.neighbors.push(t.id);
                t.neighbors = [createdT.id, ...t.neighbors.filter(x => triangles[x].active)];
            });

            console.log("trianglesToCheck: ", trianglesToCheck)
            console.log("triangles: ", triangles)
            console.log("newNeighbors: ", newNeighbors)

            triangle.pixels.concat(neighbor.pixels).forEach(i => {
                const tr = trianglesToCheck.find(t => isPointInTriangle(i, t))
                if (tr) {
                    points[i] = tr.id;
                    tr.pixels.push(i)
                    const index = i * 4
                    tr.rgb.r += imageData.data[index];
                    tr.rgb.g += imageData.data[index+1];
                    tr.rgb.b += imageData.data[index+2];
                }
            });


            trianglesToCheck.forEach(t => {
                if (t.pixels.length > 0) {
                    t.rgb.r = t.rgb.r / t.pixels.length;
                    t.rgb.g = t.rgb.g / t.pixels.length;
                    t.rgb.b = t.rgb.b / t.pixels.length;
                }


                const a  = intToPoint(t.vertices[0])
                const b  = intToPoint(t.vertices[1])
                const c  = intToPoint(t.vertices[2])

                displayedContext.fillStyle = `rgb(${t.rgb.r}, ${t.rgb.g}, ${t.rgb.b})`;
                displayedContext.strokeStyle = displayedContext.fillStyle;
                displayedContext.lineWidth = 1;

                displayedContext.beginPath();
                displayedContext.moveTo(a.x * ratio, a.y * ratio); // Move to the first vertex
                displayedContext.lineTo(b.x * ratio, b.y * ratio); // Draw line to the second vertex
                displayedContext.lineTo(c.x * ratio, c.y * ratio); // Draw line to the third vertex
                displayedContext.closePath();    // Close the path

                displayedContext.fill();
                displayedContext.stroke();
            })
            console.log(" ==========================================")
        }

        trianglesToCheck.push(addTriangle(0, w-1, w*(h-1)));
        trianglesToCheck.push(addTriangle(w-1, w*(h-1), w*h-1));
        triangles[1].neighbors = [2];
        triangles[2].neighbors = [1];


        for (let i = 0; i < w * h; i++ ) {
            const tr = trianglesToCheck.find(t => isPointInTriangle(i, t))
            if (tr) {
                points[i] = tr.id;
                tr.pixels.push(i)
                const index = i * 4
                tr.rgb.r += imageData.data[index];
                tr.rgb.g += imageData.data[index+1];
                tr.rgb.b += imageData.data[index+2];
            }
        }

        // displayedContext.drawImage(image, 0, 100, displayedCanvas.width, displayedCanvas.height, 0, 0, displayedCanvas.width, displayedCanvas.height);

        trianglesToCheck.forEach(t => {
            if (t.pixels.length > 0) {
                t.rgb.r = t.rgb.r / t.pixels.length;
                t.rgb.g = t.rgb.g / t.pixels.length;
                t.rgb.b = t.rgb.b / t.pixels.length;
            }


            const a  = intToPoint(t.vertices[0])
            const b  = intToPoint(t.vertices[1])
            const c  = intToPoint(t.vertices[2])

            displayedContext.fillStyle = `rgb(${t.rgb.r}, ${t.rgb.g}, ${t.rgb.b})`;
            displayedContext.strokeStyle = displayedContext.fillStyle;
            displayedContext.lineWidth = 1;

            displayedContext.beginPath();
            displayedContext.moveTo(a.x * ratio, a.y * ratio); // Move to the first vertex
            displayedContext.lineTo(b.x * ratio, b.y * ratio); // Draw line to the second vertex
            displayedContext.lineTo(c.x * ratio, c.y * ratio); // Draw line to the third vertex
            displayedContext.closePath();    // Close the path

            displayedContext.fill();
            displayedContext.stroke();
        })

        // setInterval(step, 25);
        step()
        step()
        step()
        step()
        step()
        step()

    };

    image.src = '/assets/test-image.jpg'; // Replace with the path to your image
};