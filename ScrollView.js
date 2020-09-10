import View from './View'
import { ScrollVertical, ScrollHorizontal } from './Scroll'

export default class ScrollView extends View {
   constructor(frame, contentSize, SCROLL_WIDTH, delegate) {
      super(frame)
      this.setProgress = this.setProgress.bind(this)
      this.scrolledHorizontal = this.scrolledHorizontal.bind(this)
      this.scrolledVertical = this.scrolledVertical.bind(this)
      this.onWheel = this.onWheel.bind(this)

      this.SCROLL_WIDTH = SCROLL_WIDTH
      this.contentSize = contentSize
      this.delegate = delegate
      const scrollV = new ScrollVertical(this.getVerticalScrollFrame(frame.width, frame.height), this.scrolledVertical)
      const scrollH = new ScrollHorizontal(this.getHorizontalScrollFrame(frame.width, frame.height), this.scrolledHorizontal)
      this.vertical = scrollV
      this.horizontal = scrollH
      this.addSubview(scrollH)
      this.addSubview(scrollV)

      const canvas = document.getElementById('canvas-tableId')
      canvas.addEventListener('wheel', this.onWheel)
   }

   resized(width, height) {
      const vHandleRatio = height / this.contentSize.height
      const hHandleRatio = width / this.contentSize.width

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

      const marginHeight = height - (this.horizontal.hidden ? 0 : this.horizontal.getFrame().height)
      const marginWidth = width - (this.vertical.hidden ? 0 : this.vertical.getFrame().width)

      this.vertical.frame = this.getVerticalScrollFrame(width, marginHeight)
      this.horizontal.frame = this.getHorizontalScrollFrame(marginWidth, height)
   }

   onWheel(event) {
      const c = 0.1
      if (event.deltaY != 0) {
         const delta = (event.deltaY * c) / this.frame.height
         this.scrolledVertical(delta + this.vertical.getProgress())
      } else if (event.deltaX != 0) {
         const delta = (event.deltaX * c) / this.frame.width
         this.scrolledHorizontal(delta + this.horizontal.getProgress())
      }
      this.repaint()
      event.preventDefault()
   }

   setProgress(x, y) {
      this.vertical.setProgress(y)
      this.horizontal.setProgress(x)
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
