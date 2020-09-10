import View from './View.js'

export default class TableHeader extends View {
    constructor(frame, columns) {
        super(frame)
        this.backgroundColor = "#aaa"

        this.columns = columns

        this.colToShow = 0
    }

    scrolledHorizontal(progress) {
        const colLength = this.columns.length
        this.colToShow = Math.floor(colLength * Math.max(0, Math.min(1, progress)))
    }

    paint(canvas, timestamp) {
        let xOffset = 0
        for (let i = this.colToShow; i < this.columns.length; i++) {
            const col = this.columns[i]
            
            canvas.drawText(xOffset, 20, 'Col ' + i, 'start', 'black')

            xOffset += col.width
        }
    }
}
