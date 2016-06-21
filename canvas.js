class Canvas {
    constructor(width, height) {
        this.canvas = document.createElement("canvas")
        this.canvas.width = width
        this.canvas.height = height
        this.context = this.canvas.getContext("2d")
        this.imageData = this.context.getImageData(0, 0, width, height)
        this.pixels = this.imageData.data
        document.body.appendChild(this.canvas)
    }

    get Element() {
        return this.canvas
    }

    get Width() {
        return this.canvas.width
    }

    get Height() {
        return this.canvas.height
    }

    get Context() {
        return this.context
    }

    get currentPixels() {
        this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        this.pixels = this.imageData.data
        return this.pixels
    }

    get Center() {
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        }
    }

    set visible(isVisible) {
        if (isVisible) {
            canvas.sytle.display = "inline"
        }
        else {
            canvas.style.display = "none"
        }
    }

    drawLine(a, b) {
        this.context.beginPath()
        this.context.moveTo(a.x, a.y)
        this.context.lineTo(b.x, b.y)
        this.context.stroke()
    }

    drawPoint(point, radius) {
        this.context.beginPath()
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2, false)
        this.context.fill()
    }

    clear(color) {
        this.context.fillStyle = color
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.fill()
    }

    resetTransform() {
        this.context.transform(1, 0, 0, 1, 0, 0)
    }

    put() {
        this.context.putImageData(this.imageData, 0, 0)
    }

    setPixel(x, y, color) {
        var index = (y * this.canvas.width + x) * 4
        this.pixels[index + 0] = color.r
        this.pixels[index + 1] = color.g
        this.pixels[index + 2] = color.b
        this.pixels[index + 3] = color.a
    }
}
