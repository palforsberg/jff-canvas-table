export class View {
   constructor(frame) {
      if (frame == undefined) {
         console.error('frame must be set on view')
      }
      this.paint = this.paint.bind(this)
      this.onClick = this.onClick.bind(this)
      this.frame = frame
      this.subviews = []
      this.clickable = true
      this.hidden = false
      this.backgroundColor = undefined
      this.superview = undefined
      this.strokeColor = undefined
      this.animation = undefined
   }
   getFrame() {
      return this.frame
   }
   setSuperview(superview) {
      this.superview = superview
   }
   viewDidAppear() {

   }
   viewDidDisappear() {

   }
   addSubview(view) {
      if (view.hasSuperview()) {
         console.error('Cant add subview already within another view ', view)
         return
      }
      view.setSuperview(this)
      this.subviews.push(view)
      view.viewDidAppear()
   }
   insertViewAtBottom(view) {
      view.setSuperview(this)
      this.subviews.unshift(view)
      view.viewDidAppear()
   }
   removeFromSuperview() {
      this.superview.removeView(this)
      this.superview = undefined
   }
   hasSuperview() {
      return this.superview !== undefined
   }
   removeView(view) {
      for (let i = 0, len = this.subviews.length; i < len; i++) {
         if (view === this.subviews[i]) {
            this.removeSubviewAtIndex(i)
            view.viewDidDisappear()
            return
         }
      }
   }
   removeSubviewAtIndex(index) {
      this.subviews.splice(index, 1)
   }
   /**
    * Starts a animation on view
    * @param  {Integer} duration animation duration in milliseconds
    * @param  {function} animation function which handles the animation of the View. Will be called with progress going from 0 to 1
    * @param  {function} onComplete is called when animation is completed
    * @param  {Boolean} loop should animation loop
    */
   animate(duration, animation, onComplete, loop = false) {
      this.animation = { func: animation, duration, onComplete, start: undefined }
   }
   isEventInside(event) {
      return this.isPointInside(event.layerX, event.layerY)
   }
   isPointInside(x, y) {
      return this.frame.x <= x && x <= this.frame.x + this.frame.width &&
            this.frame.y <= y && y <= this.frame.y + this.frame.height
   }
   onClick(event) {
      const y = event.layerY
      const x = event.layerX
      // console.log('onClick ', x, y)
      for (let i = 0, len = this.subviews.length; i < len; i++) {
         const view = this.subviews[i]
         if (view.clickable && !view.hidden && view.isPointInside(x, y)) {
            view.onClick(event)
         }
      }
   }
   onMousedown(event) {
      for (let i = 0, len = this.subviews.length; i < len; i++) {
         // go from topmost view to bottommost
         const view = this.subviews[this.subviews.length - i - 1]
         if (view.clickable && !view.hidden && view.isEventInside(event) && !event.defaultPrevented) {
            view.onMousedown(event)
         }
      }
   }
   repaint() {
      if (this.superview === undefined) {
         console.error('cant repaint without superview')
         return
      }
      this.superview.repaint()
   }
   paint(canvas, timestamp) {
   }
   paintBase(canvas, timestamp) {
      if (this.hidden) return
      if (this.animation !== undefined) this.handleAnimation(timestamp)
      const needsTranslation = this.frame.x !== 0 || this.frame.y !== 0
      if (needsTranslation) {
         canvas.ctx.save()
         canvas.ctx.translate(this.frame.x, this.frame.y)
      }
      if (this.backgroundColor != undefined) canvas.paintRect(0, 0, this.frame.width, this.frame.height, this.backgroundColor)
      if (this.strokeColor !== undefined) canvas.drawRect(0, 0, this.frame.width, this.frame.height, this.strokeColor)
      
      this.paint(canvas, timestamp)
      
      // TODO: clip view?
      for (let i = 0, len = this.subviews.length; i < len; i++) {
         const view = this.subviews[i]
         view.paintBase(canvas, timestamp)
      }
      if (needsTranslation) {
         canvas.ctx.restore()
      }
   }

   handleAnimation(timestamp) {
      if (!this.animation.start) this.animation.start = timestamp
      const progress = (Math.round(timestamp - this.animation.start)) / this.animation.duration
      const limitedProgress = Math.min(Math.max(progress, 0), 1)
      this.animation.func(limitedProgress)
      if (progress > 1) {
         if (this.animation.loop) {
            this.animation.start = timestamp
         } else {
            this.animation.onComplete()
            this.animation = undefined
         }
      }
   }
}

// Must be the first View in a canvas.
export default class RootView extends View {
   constructor(frame, canvas) {
      super(frame)
      this.canvas = canvas
      this.actuallyRepaint = this.actuallyRepaint.bind(this)
   }
   reset() {
   }
   repaint() {
      window.requestAnimationFrame(this.actuallyRepaint)
   }
   actuallyRepaint(timestamp) {
      this.canvas.clear()
      this.paintBase(this.canvas, timestamp)
   }
   canvasSizeChanged(width, height) {
      this.frame.width = width
      this.frame.height = height
   }
}
