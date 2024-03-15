
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
        pixelCount: 0,
        rgb: {r:0, g:0, b:0},
        neighbors: [],
    };

    console.log("Adding triangle ",triangleCount,  {...triangles[triangleCount]})

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

        const triangleSize = 100;


        function step() {
            stepCount++;
            console.log(" ========================================== Step: ", stepCount)

            const pointA = Math.floor(Math.random() * (w*h))
            const a  = intToPoint(pointA)

            let pointBx = a.x + Math.floor(Math.random() * triangleSize) - (triangleSize/2);
            if (pointBx < 0) pointBx = 0;
            if (pointBx >= w) pointBx = w - 1;

            let pointBy = a.y + Math.floor(Math.random() * triangleSize) - (triangleSize/2);
            if (pointBy < 0) pointBy = 0;
            if (pointBy >= h) pointBy = h - 1;

            let pointCx = a.x + Math.floor(Math.random() * triangleSize) - (triangleSize/2);
            if (pointCx < 0) pointCx = 0;
            if (pointCx >= w) pointCx = w - 1;

            let pointCy = a.y + Math.floor(Math.random() * triangleSize) - (triangleSize/2);
            if (pointCy < 0) pointCy = 0;
            if (pointCy >= h) pointCy = h - 1;

            let lowestX = Math.min(a.x, pointBx, pointCx);
            let lowestY = Math.min(a.y, pointBy, pointCy);
            let highestX = Math.max(a.x, pointBx, pointCx);
            let highestY = Math.max(a.y, pointBy, pointCy);

            const pointB = pointBy * w + pointBx;
            const pointC = pointCy * w + pointCx;

            const triangle = addTriangle(pointA, pointB, pointC);

            for (let iX = lowestX; iX <= highestX; iX++) {
                for (let iY = lowestY; iY <= highestY; iY++) {
                    const p = iY * w + iX;
                    if (isPointInTriangle(p, triangle)) {
                        const index = p * 4
                        triangle.rgb.r += imageData.data[index];
                        triangle.rgb.g += imageData.data[index+1];
                        triangle.rgb.b += imageData.data[index+2];
                        triangle.pixelCount++;
                    }
                }
            }

            if (triangle.pixelCount > 0) {
                triangle.rgb.r = triangle.rgb.r / triangle.pixelCount;
                triangle.rgb.g = triangle.rgb.g / triangle.pixelCount;
                triangle.rgb.b = triangle.rgb.b / triangle.pixelCount;
            }



                const pa  = intToPoint(pointA)
                const pb  = intToPoint(pointB)
                const pc  = intToPoint(pointC)

                displayedContext.fillStyle = `rgb(${triangle.rgb.r}, ${triangle.rgb.g}, ${triangle.rgb.b})`;
                // displayedContext.strokeStyle = `rgb(${stepCount % 3 === 0 ? 255 : 0}, ${stepCount % 3 === 1 ? 255 : 0}, ${stepCount % 3 === 2 ? 255 : 0})`;
                displayedContext.lineWidth = 0;

                displayedContext.beginPath();
                displayedContext.moveTo(pa.x * ratio, pa.y * ratio); // Move to the first vertex
                displayedContext.lineTo(pb.x * ratio, pb.y * ratio); // Draw line to the second vertex
                displayedContext.lineTo(pc.x * ratio, pc.y * ratio); // Draw line to the third vertex
                displayedContext.closePath();    // Close the path

                displayedContext.fill();
                displayedContext.stroke();
            console.log(" ==========================================")
        }

        hiddenCanvas.addEventListener('click', step)


        setInterval(step, 5);

    };

    image.src = '/assets/test-image.jpg'; // Replace with the path to your image
};