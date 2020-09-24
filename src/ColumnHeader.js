import View from './View.js'

export default class ColumnHeader extends View {
    constructor(frame, dataSupplier, onColumnSizeChange) {
        super(frame)
        this.onMousemove = this.onMousemove.bind(this)
        this.onMouseup = this.onMouseup.bind(this)

        this.dataSupplier = dataSupplier
        this.onColumnSizeChange = onColumnSizeChange

        this.xOffset = 0

        this.cursor = { down: false, start: undefined, column: undefined }
    }

    moveTo(column) {
        this.xOffset = column
    }

    onMousedown(event) {
        const column = this.getColumnAtPoint(event.point.x)
        this.cursor.column = column
        this.cursor.down = true
        this.cursor.start = { ... event.point }
        document.addEventListener('mousemove', this.onMousemove)
        document.addEventListener('mouseup', this.onMouseup)
        this.repaint()
    }
    onMousemove(event) {
        const point = this.getPointInView(event.layerX, event.layerY)
        const xDelta = point.x - this.cursor.start.x
        this.cursor.start = point
        this.onColumnSizeChange(this.cursor.column, xDelta)
        event.target.style.cursor = 'col-resize'
        this.repaint()
    }
    onMouseup(event) {
        this.cursor.down = false
        this.cursor.column = undefined
        event.target.style.cursor = 'default'
        document.removeEventListener('mousemove', this.onMousemove)
        document.removeEventListener('mouseup', this.onMouseup)
        this.repaint()
    }

    paint(canvas, timestamp) {
        let xOffset = 0
        for (let i = this.xOffset, len = this.dataSupplier.getNumberOfColumns(); i < len; i++) {
            const width = this.dataSupplier.getColumnWidth(i)
            const text = this.dataSupplier.getColumnHeader(i)
            const alignment = this.dataSupplier.getColumnAlignment(i, true)

            canvas.paintRect(xOffset, 0, width, this.frame.height, 'white')
            if (alignment == 'left') {
                canvas.drawText(xOffset + 5, 15, text, 'start', 'black')
            } else {
                const size = canvas.getTextWidth(text)
                if (size > width - 10) {
                    canvas.drawText(xOffset + 5, 15, text, 'start', 'black')
                } else {
                    if (alignment == 'center') {
                        canvas.drawText(xOffset + (width/2), 15, text, 'center', 'black')
                    } else {
                        canvas.drawText(xOffset + width - 5, 15, text, 'end', 'black')
                    }
                }
            }
            
            xOffset += width
            if (xOffset > this.frame.width) {
                break
            }
        }
    }
    
    getColumnAtPoint(x) {
        let offset = 0
        for (let i = this.xOffset, len = this.dataSupplier.getNumberOfColumns(); i < len; i++) {
            const width = this.dataSupplier.getColumnWidth(i)
            if (offset < x && x < offset + width) {
                return i
            }
            offset += width
        }
        return undefined
    }
}
