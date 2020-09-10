import View from './View'

export class Label extends View {
   constructor(canvas, frame) {
      super(canvas, frame)
      this.text = undefined
      this.aling = 'start'
      this.textColor = 'black'
      this.font = '14px Helvetica'
   }
   viewDidAppear() {
      // console.log('Label did appear')
   }
   viewDidDisappear() {
      // console.log('Label did disappear')
   }
   paint(timestamp) {
      const text = this.text || ''
      this.canvas.setFont(this.font)
      this.canvas.drawText(this.frame.width / 2, this.frame.height / 2, text, this.textAlign, this.textColor)
   }
}
