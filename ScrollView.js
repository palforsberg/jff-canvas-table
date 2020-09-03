import { View } from './View'
import { ScrollVertical, ScrollHorizontal } from './Scroll'

export default class ScrollView extends View {
   constructor(canvas, SCROLL_WIDTH) {
      super(canvas, canvas.getFrame())
      this.scrolledHorizontal = this.scrolledHorizontal.bind(this)
      this.scrolledVertical = this.scrolledVertical.bind(this)

      this.SCROLL_WIDTH = SCROLL_WIDTH
      const scrollV = new ScrollVertical(canvas, this.getVerticalScrollFrame(this.frame.width, this.frame.height), this.scrolledVertical)
      const scrollH = new ScrollHorizontal(canvas, this.getHorizontalScrollFrame(this.frame.width, this.frame.height), this.scrolledHorizontal)
      this.vertical = scrollV
      this.horizontal = scrollH
      this.addSubview(scrollH)
      this.addSubview(scrollV)
   }

   resized(width, height) {
      this.setSize(width, height)
      const childContentSize = this.childView.getContentSize()

      const vHandleRatio = height / childContentSize.height
      const hHandleRatio = width / childContentSize.width

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

      const marginHeight = height - this.horizontal.getVisibleFrame().height
      const marginWidth = width - this.vertical.getVisibleFrame().width

      this.vertical.frame = this.getVerticalScrollFrame(width, marginHeight)
      this.horizontal.frame = this.getHorizontalScrollFrame(marginWidth, height)

      this.childView.resized(marginWidth, marginHeight)
   }

   setViewToBeScrolled(view) {
      this.childView = view
      this.insertViewAtBottom(view)
   }
   setProgress(x, y) {
      this.vertical.setProgress(y)
      this.horizontal.setProgress(x)
   }
   scrolledHorizontal(progress) {
      this.childView.scrolledHorizontal(progress)
   }
   scrolledVertical(progress) {
      this.childView.scrolledVertical(progress)
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
