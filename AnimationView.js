import View from './View.js'

export class AnimationView extends View {
   constructor(frame) {
      super(frame)
      this.duration = 1000
      this.nrLoops = 1
      this.startTimestamp = undefined
      this.didAnimate = () => { this.removeFromSuperview() }
   }

   paint(canvas, timestamp) {
      if (!this.startTimestamp) this.startTimestamp = timestamp
      const progress = (timestamp - this.startTimestamp) / this.duration
      const limitedProgress = Math.min(Math.max(progress, 0), 1)
      this.setProgress(canvas, limitedProgress)
      if (progress > 1) {
         this.startTimestamp = undefined
         if (this.nrLoops-- > 0) {
            setTimeout(() => window.requestAnimationFrame(this.paint), this.endRestDuration)
         } else {
            this.didAnimate()
         }
      }
   }
}
