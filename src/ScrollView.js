import View from './View.js'
import { ScrollVertical, ScrollHorizontal } from './Scroll.js'

export default class ScrollView extends View {
   constructor(frame, contentSize, SCROLL_WIDTH, delegate, getScrollColor) {
      super(frame)
      this.scrolledHorizontal = this.scrolledHorizontal.bind(this)
      this.scrolledVertical = this.scrolledVertical.bind(this)
      this.onWheel = this.onWheel.bind(this)

      this.SCROLL_WIDTH = SCROLL_WIDTH
      this.contentSize = contentSize
      this.delegate = delegate
      const scrollV = new ScrollVertical(this.getVerticalScrollFrame(frame.width, frame.height), this.scrolledVertical, getScrollColor)
      const scrollH = new ScrollHorizontal(this.getHorizontalScrollFrame(frame.width, frame.height), this.scrolledHorizontal, getScrollColor)
      this.vertical = scrollV
      this.horizontal = scrollH
      this.addSubview(scrollH)
      this.addSubview(scrollV)

      this.resized(this.contentSize)
   }

   viewDidAppear() {
      const canvas = this.getDOMElement()
      canvas.addEventListener('wheel', this.onWheel)
   }

   resized(contentSize) {
      const vHandleRatio = this.frame.height / this.contentSize.height
      const hHandleRatio = this.frame.width / this.contentSize.width

      this.horizontal.hidden = hHandleRatio > 1
      this.vertical.hidden = vHandleRatio > 1
      if (this.horizontal.hidden && this.horizontal.location > 0) {
         this.horizontal.setLocation(0)
         this.horizontal.handler(this.horizontal.getProgress(this.horizontal.location))
      }
      if (this.vertical.hidden && this.vertical.location > 0) {
         this.vertical.setLocation(0)
         this.vertical.handler(this.vertical.getProgress(this.vertical.location))
      }

      this.horizontal.setHandleRatio(hHandleRatio)
      this.vertical.setHandleRatio(vHandleRatio)

      const marginHeight = this.frame.height - (this.horizontal.hidden ? 0 : this.horizontal.getFrame().height)
      const marginWidth = this.frame.width - (this.vertical.hidden ? 0 : this.vertical.getFrame().width)

      this.vertical.frame = this.getVerticalScrollFrame(this.frame.width, marginHeight)
      this.horizontal.frame = this.getHorizontalScrollFrame(marginWidth, this.frame.height)
      this.contentSize = contentSize
   }

   onWheel(event) {
      const c = 0.1
      if (event.deltaY != 0) {
         const delta = (event.deltaY * c) / this.frame.height
         var progress = this.vertical.addDelta(delta)
         this.scrolledVertical(progress)
      } 
      if (event.deltaX != 0) {
         const delta = (event.deltaX * c) / this.frame.width
         var progress = this.horizontal.addDelta(delta)
         this.scrolledHorizontal(progress)
      }

      this.repaint()
      event.preventDefault()
   }

   setScroll(x, y) {
      if (x != undefined) {
         this.horizontal.setProgress(x)
      }
      if (y != undefined) {
         this.vertical.setProgress(y)
      }
   }
   scrolledHorizontal(progress) {
      this.delegate(progress, undefined)
   }
   scrolledVertical(progress) {
      this.delegate(undefined, progress)
   }

   getVerticalScrollFrame(width, height) {
      return {
         x: width - this.SCROLL_WIDTH,
         y: 0,
         width: this.SCROLL_WIDTH,
         height,
      }
   }

   getHorizontalScrollFrame(width, height) {
      return {
         x: 0,
         y: height - this.SCROLL_WIDTH,
         width,
         height: this.SCROLL_WIDTH,
      }
   }
}
