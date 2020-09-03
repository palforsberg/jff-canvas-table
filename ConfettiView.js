import { AnimationView } from './AnimationView'

export class ConfettiView extends AnimationView {
   constructor(canvas, frame) {
      super(canvas, frame)
      this.duration = 500
      this.nrLoops = 0
   }
   setProgress(progress) {
      const color = `rgba(0,0,0, ${1 - progress ** 3})`
      this.canvas.beginLine(color, 2, 'round')
      const k = this.frame.width
      const l1 = k * progress ** 4
      const l2 = k * progress ** 2
      this.canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 0)
      this.canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 45)
      this.canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 90)
      this.canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 135)
      this.canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 180)
      this.canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 225)
      this.canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 270)
      this.canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 315)
      this.canvas.endLine()
   }
}
