const CELL_EVEN_BACKGROUND = '#F4F4F4'
const CELL_UNEVEN_BACKGROUND = '#FFFFFF'
const CELL_SELECTED_BACKGROUND = '#FFFFCC'
const CELL_ACTIVE_BACKGROUND = '#FFAAAA'
const TEXT = '#000000'

const PADDING = { x: 8, y: 20 }
const textCache = {}

export class Cell {
   constructor(cellHeight) {
      this.height = cellHeight
   }

   // Paints cell with start at position.
   // Formats text and calculates the starting point for text.
   paintCell(canvas, rowIndex, width, position, text, status = CellStatus.DEFAULT) {
      canvas.paintRect(position.x, position.y, width, this.height, this.getBackgroundColor(rowIndex, status))

      if (text.length == 0) return
      const size = Cell.getTextWidth(canvas.ctx, text)
      if (size > (width - PADDING.x * 2)) {
         canvas.drawText(position.x + PADDING.x, PADDING.y + position.y, text, 'start', this.getTextColor())
      } else {
         canvas.drawText(-PADDING.x + position.x + width, PADDING.y + position.y, text, 'end', this.getTextColor())
      }
   }

   // Returns different color for clickable cells
   getTextColor() {
      return TEXT
   }

   getBackgroundColor(rowIndex, status) {
      switch (status) {
         case CellStatus.DEFAULT:
            return rowIndex % 2 == 0 ? CELL_EVEN_BACKGROUND : CELL_UNEVEN_BACKGROUND
         case CellStatus.SELECTED:
            return CELL_SELECTED_BACKGROUND
         case CellStatus.ACTIVE:
            return CELL_ACTIVE_BACKGROUND
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
   DEFAULT: 'default',
   SELECTED: 'selected',
   ACTIVE: 'active'
}