import View from './View.js'

export default class RowHeader extends View {
    constructor(frame, numberOfRows, cellHeight) {
        super(frame)

        this.numberOfRows = numberOfRows
        this.cellHeight = cellHeight

        this.row = 0
    }

    moveTo(row) {
        this.row = row
    }

    paint(canvas, timestamp) {
        let offset = 0
        for (let i = this.row; i < this.numberOfRows; i++) {
            canvas.drawText(this.frame.width / 2, offset + (this.cellHeight / 2) + 4, i, 'center', 'black')
            offset += this.cellHeight
        }
    }
}