

const PADDING = { x: 8, y: 20 }
const textCache = {}

export class Cell {
   constructor(cellHeight, getBackgroundColor, getTextColor) {
      this.height = cellHeight
      this.getBackgroundColor = getBackgroundColor
      this.getTextColor = getTextColor
   }

   // Paints cell with start at position.
   // Formats text and calculates the starting point for text.
   paintCell(canvas, rowIndex, columnIndex, width, position, text, status = CellStatus.DEFAULT) {
      canvas.paintRect(position.x, position.y, width, this.height, this.getBackgroundColor(rowIndex, columnIndex, status))

      if (text.length == 0) return
      const size = Cell.getTextWidth(canvas.ctx, text)
      if (size > (width - PADDING.x * 2)) {
         canvas.drawText(position.x + PADDING.x, PADDING.y + position.y, text, 'start', this.getTextColor())
      } else {
         canvas.drawText(-PADDING.x + position.x + width, PADDING.y + position.y, text, 'end', this.getTextColor())
      }
   }

   static getTextWidth(ctx, text) {
      let stored = textCache[text.length]
      if (stored == undefined) {
         const size = ctx.measureText(text)
         textCache[text.length] = size.width
         return size.width
      }
      return stored
   }
}

export const CellStatus = {
   DEFAULT: 'DEFAULT',
   SELECTED: 'SELECTED',
   ACTIVE: 'ACTIVE'
}