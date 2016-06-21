class ConcaveHull {
    constructor(node, k) {
        this.hull = this.concavehull(node, k)
    }

    get Hull() {
        return this.hull
    }

    // A k-nearest neighbours approach by Adriano Moreira and Maribel Yasmina Santos.
    // (http://repositorium.sdum.uminho.pt/bitstream/1822/6429/1/ConcaveHull_ACM_MYS.pdf)
    concavehull(node, k) {
        var dataset = this.clean(node.slice(0))
        if (dataset.length <= 3) {
            return dataset
        }

        k = Math.min(Math.max(k, 3), dataset.length)
        dataset.sort(function (a, b) { return a.y - b.y })
        var first = dataset.shift()
        var hull = [first]
        var candidate = this.getCandidate(dataset, hull[0], { x: hull[0].x - 1, y: hull[0].y }, hull, k)

        dataset.push(first)
        do {
            hull.unshift(candidate)
            candidate = this.getCandidate(dataset, hull[0], hull[1], hull, k)
            if (candidate === null) {
                return []//this.concavehull(node, k + 1)
            }
        } while ((candidate !== first) && (candidate !== null))

        return hull
    }

    getCandidate(dataset, currentPoint, previousPoint, hull, k) {
        var candidates = this.getKNearest(dataset, currentPoint, k)
        candidates.sort(function (a, b) {
            var angle_a = angle2D(currentPoint, previousPoint, a),
                angle_b = angle2D(currentPoint, previousPoint, b)
            return angle_b - angle_a
        })

        var i, j
        label:
        for (i = 0; i < candidates.length; ++i) {
            for (j = 0; j < hull.length - 1; ++j) {
                if (crosses(currentPoint, candidates[i], hull[j], hull[j + 1])) {
                    if (i === candidates.length - 1) {
                        return null
                    }
                    continue label
                }
            }
            break
        }

        dataset.splice(dataset.indexOf(candidates[i]), 1)
        return candidates[i]
    }

    // hull の先端に近いほうから k 個のノードを取得。
    getKNearest(dataset, currentPoint, k) {
        dataset.sort(function (a, b) {
            var ax = a.x - currentPoint.x,
                ay = a.y - currentPoint.y,
                bx = b.x - currentPoint.x,
                by = b.y - currentPoint.y,
                ra = ax * ax + ay * ay,
                rb = bx * bx + by * by

            return ra - rb
        })

        return dataset.slice(0, k)
    }

    // 重複するノードを消去。
    clean(node) {
        for (var i = 0; i < node.length - 1; ++i) {
            if (node[i].x === node[i + 1].x
                && node[i].y === node[i + 1].y) {
                node.splice(i, 1)
                --i
            }
        }
        return node
    }
}

function angle2D(origin, a, b) {
    var ax = a.x - origin.x,
        ay = a.y - origin.y,
        bx = b.x - origin.x,
        by = b.y - origin.y,
        c1 = Math.sqrt(ax * ax + ay * ay),
        c2 = Math.sqrt(bx * bx + by * by),
        denom = c1 * c2,
        c, rad, sign

    if (denom === 0) {
        return 0
    }

    c = (ax * bx + ay * by) / (c1 * c2),
        rad = Math.acos(Math.min(c, 1)),
        sign = Math.sign(ax * by - ay * bx)

    if (sign < 0) {
        return Math.PI + Math.PI - rad
    }
    return rad
}

// Tests if the segment a-b intersects with the segment c-d.
// Ex: crosses({x:0,y:0},{x:1,y:1},{x:1,y:0},{x:0,y:1}) === true
// Credit: Beta at http://stackoverflow.com/questions/7069420/check-if-two-line-segments-are-colliding-only-check-if-they-are-intersecting-n
// Implementation by Viclib (viclib.com). from (http://jsfiddle.net/ytr9314a/4/)
function crosses(a, b, c, d) {
    var aSide = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x) > 0;
    var bSide = (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x) > 0;
    var cSide = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
    var dSide = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x) > 0;
    return aSide !== bSide && cSide !== dSide;
}

class Mouse {
    constructor(canvas) {
        this.isUp = true

        this.canvas = canvas
        canvas.Element.addEventListener("load", this.onLoad, false)
        canvas.Element.addEventListener("mousedown", this.onMouseDown, false)
        canvas.Element.addEventListener("mousemove", this.onMouseMove, false)
        canvas.Element.addEventListener("mouseup", this.onMouseUp, false)
        canvas.Element.addEventListener("mouseout", this.onMouseOut, false)
    }

    onLoad(event) {
        this.isUp = true
    }

    onMouseDown(event) {
        this.isUp = false

        var rect = event.target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top

        createNode(x, y)
        updateCanvas()
    }

    onMouseMove(event) {
        if (this.isUp || isNaN(this.isUp)) {
            return
        }

        var rect = event.target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top

        createNode(x, y)
        updateCanvas()
    }

    onMouseUp(event) {
        this.isUp = true
    }

    onMouseOut(event) {
        this.isUp = true
    }
}

//

var cv = new Canvas(512, 512)
var mouse = new Mouse(cv)

const NUM_CREATE_NODE = 3
const RECT = 8
var node = []

const K = 64
var hull

updateCanvas()

function updateCanvas() {
    hull = new ConcaveHull(node, K)
    cv.clear("#ffffff")
    drawHull()
    drawNode()
}

function createNode(x, y) {
    var i
    for (i = 0; i < NUM_CREATE_NODE; ++i) {
        node.push({
            x: x + (0.5 - Math.random()) * RECT,
            y: y + (0.5 - Math.random()) * RECT
        })
    }
}

function drawHull() {
    var node = hull.Hull,
        length = node.length - 1,
        i

    if (node.length < 1) {
        return
    }

    // cv.Context.fillStyle = "#000000"
    // for (i = 0; i < node.length; ++i) {
    //     cv.Context.fillText(i, node[i].x, node[i].y)
    // }

    cv.Context.strokeStyle = "#dddddd"
    cv.Context.lineWidth = 7
    for (i = 0; i < length; ++i) {
        cv.Context.fillText(i, node[i].x, node[i].y)
        drawLine(node[i], node[i + 1])
    }
    drawLine(node[node.length - 1], node[0])
}

function drawNode() {
    cv.Context.fillStyle = "#6789ee"
    for (var i = 0; i < node.length; ++i) {
        drawPoint(node[i], 2)
    }
}

function drawLine(a, b) {
    cv.Context.beginPath()
    cv.Context.moveTo(a.x, a.y)
    cv.Context.lineTo(b.x, b.y)
    cv.Context.stroke()
}

function drawPoint(point, radius) {
    cv.Context.beginPath()
    cv.Context.arc(point.x, point.y, radius, 0, Math.PI * 2, false)
    cv.Context.fill()
}

// UI //

function onClickButtonClear() {
    node.length = 0
    updateCanvas()
}
