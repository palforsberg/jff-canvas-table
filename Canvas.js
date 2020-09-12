import { RootView } from "./View"

export default class Canvas {
   constructor(canvas, size = 'auto') {
      this.onMousedown = this.onMousedown.bind(this)
      if (typeof canvas === 'string') {
         this.domCanvas = document.getElementById(canvas)
      } else {
         this.domCanvas = canvas
      }
      if (size == 'auto') {
         size = { width: this.domCanvas.offsetWidth, height: this.domCanvas.offsetHeight }
      }
      this.scaleFactor = 2
      this.ctx = this.domCanvas.getContext('2d')
      this.rootview = new RootView({ x: 0, y: 0, ...size }, this)
      this.setFrame(size.width, size.height)

      this.domCanvas.addEventListener('mousedown', this.onMousedown)
   }
   onMousedown(event) {
      event.point = { x: event.layerX, y: event.layerY }
      if (this.rootview.isEventInside(event)) {
         this.rootview.onMousedown(event)
      }
   }
   getFrame() {
      return {
         x: 0,
         y: 0,
         width: Math.ceil(this.domCanvas.width / this.scaleFactor),
         height: Math.ceil(this.domCanvas.height / this.scaleFactor),
      }
   }
   setFrame(width, height) {
      const tempFont = this.ctx.font
      const tempFillStyle = this.ctx.fillStyle
      const tempStrokeStyle = this.ctx.strokeStyle

      this.domCanvas.style.width = width
      this.domCanvas.style.height = height
      this.domCanvas.width = Math.ceil(width * this.scaleFactor)
      this.domCanvas.height = Math.ceil(height * this.scaleFactor)

      this.ctx.scale(this.scaleFactor, this.scaleFactor)
      this.ctx.font = tempFont
      this.ctx.fillStyle = tempFillStyle
      this.ctx.strokeStyle = tempStrokeStyle

      this.rootview.canvasSizeChanged(width, height)
   }
   paintRect(x, y, width, height, color) {
      this.ctx.fillStyle = color
      this.ctx.fillRect(x, y, width, height)
   }
   drawRect(x, y, width, height, color, lineWidth = 2) {
      this.ctx.lineWidth = lineWidth
      this.ctx.strokeStyle = color
      this.ctx.strokeRect(x, y, width, height)
   }
   beginLine(color, width = 1, lineCap = 'butt') {
      this.ctx.lineWidth = width
      this.ctx.strokeStyle = color
      this.ctx.lineCap = lineCap
      this.ctx.beginPath()
   }
   drawHorizontalLine(x1, x2, y) {
      this.ctx.moveTo(x1, y)
      this.ctx.lineTo(x2, y)
   }
   drawLine(x, y, l1, l2, angle) {
      const cos = Math.cos(this.degToRad(angle))
      const sin = Math.sin(this.degToRad(angle))
      this.ctx.moveTo(x + l1 * cos, y + l1 * sin)
      this.ctx.lineTo(x + l2 * cos, y + l2 * sin)
   }
   degToRad(deg) {
      return deg * Math.PI / 180
   }
   drawVerticalLine(x, y1, y2) {
      this.ctx.moveTo(x, y1)
      this.ctx.lineTo(x, y2)
   }
   endLine() {
      this.ctx.stroke()
   }
   hugeText() {
      this.ctx.setFont('bold 144px Helvetica')
   }
   boldText() {
      this.setFont('bold 14px Helvetica')
   }
   normalText() {
      this.setFont()
   }
   normalTextWithSize(size) {
      this.setFont(`${size}px Helvetica`)
   }
   setFont(font = '14px Helvetica') {
      this.ctx.font = font
   }
   textShadow(blur, color) {
      this.ctx.shadowColor = color
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 0
      this.ctx.shadowBlur = blur
   }

   drawText(x, y, text, align = 'start', color) {
      this.ctx.fillStyle = color
      this.ctx.textAlign = align
      this.ctx.fillText(text, x, y)
   }
   drawCanvas(canvas, x, y) {
      const frame = canvas.getFrame()
      this.ctx.drawImage(canvas.domCanvas, x, y, frame.width, frame.height, x, y, frame.width, frame.height)
   }
   clear() {
      this.ctx.clearRect(0, 0, this.domCanvas.width, this.domCanvas.height)
   }
}
