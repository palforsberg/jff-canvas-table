import View from './View.js'

export default class RowHeader extends View {
    constructor(frame, rows, cellHeight) {
        super(frame)
        this.backgroundColor = "white"

        this.rows = rows
        this.cellHeight = cellHeight

        this.row = 0
    }

    moveTo(row) {
        this.row = row
    }

    paint(canvas, timestamp) {
        let offset = 0
        for (let i = this.row; i < this.rows.length; i++) {
            canvas.drawText(this.frame.width / 2, offset + (this.cellHeight / 2) + 4, i, 'center', 'black')
            offset += this.cellHeight
        }
    }
}