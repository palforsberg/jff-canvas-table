import View from './View.js'

const alphabet = [...Array(26)].map((q,i)=>String.fromCharCode(i+65))
export default class ColumnHeader extends View {
    constructor(frame, columns) {
        super(frame)
        this.backgroundColor = "white"

        this.columns = columns

        this.xOffset = 0
    }

    moveTo(column) {
        this.xOffset = column
    }

    paint(canvas, timestamp) {
        let xOffset = 0
        for (let i = this.xOffset; i < this.columns.length; i++) {
            const col = this.columns[i]
            
            canvas.drawText(xOffset + (col.width / 2), 15, this.getText(i), 'center', 'black')
            
            xOffset += col.width
            if (xOffset > this.frame.width) {
                break
            }
        }
    }

    getText(i) {
        const al = alphabet.length
        const q = Math.floor(i / al)
        const remainder = i % al
        const ar = alphabet[remainder]
        if (q <= 0) {
            return ar;
        }
        return this.getText(q - 1) + ar
    }
}
