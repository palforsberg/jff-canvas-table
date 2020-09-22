import { AnimationView } from './AnimationView.js'

export class ConfettiView extends AnimationView {
   constructor(frame) {
      super(frame)
      this.duration = 500
      this.nrLoops = 0
   }
   setProgress(canvas, progress) {
      const color = `rgba(0,0,0, ${1 - progress ** 3})`
      canvas.beginLine(color, 2, 'round')
      const k = this.frame.width
      const l1 = k * progress ** 4
      const l2 = k * progress ** 2
      canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 0)
      canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 45)
      canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 90)
      canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 135)
      canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 180)
      canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 225)
      canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 270)
      canvas.drawLine(this.frame.x, this.frame.y, l1, l2, 315)
      canvas.endLine()
   }
}
