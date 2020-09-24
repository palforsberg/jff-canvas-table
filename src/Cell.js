

const PADDING = { x: 8, y: 20 }

export class Cell {
   constructor(cellHeight, getTextColor) {
      this.height = cellHeight
      this.getTextColor = getTextColor
   }

   // Paints cell with start at position.
   // Formats text and calculates the starting point for text.
   paintCell(canvas, width, position, text, backgroundColor, alignment) {
      canvas.paintRect(position.x, position.y, width, this.height, backgroundColor)

      if (text.length == 0) return
      if (alignment == 'left') {
         canvas.drawText(position.x + PADDING.x, PADDING.y + position.y, text, 'start', this.getTextColor())
      } else {
         const size = canvas.getTextWidth(text)
         if (size > (width - PADDING.x * 2)) {
            canvas.drawText(position.x + PADDING.x, PADDING.y + position.y, text, 'start', this.getTextColor())
         } else {
            canvas.drawText(-PADDING.x + position.x + width, PADDING.y + position.y, text, 'end', this.getTextColor())
         }
      }
   }
}

export const CellStatus = {
   DEFAULT: 'DEFAULT',
   SELECTED: 'SELECTED',
   ACTIVE: 'ACTIVE'
}