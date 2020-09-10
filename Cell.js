const CELL_EVEN_BACKGROUND = '#F4F4F4'
const CELL_UNEVEN_BACKGROUND = '#FFFFFF'
const CELL_SELECTED_BACKGROUND = '#FFFFCC'
const CELL_ACTIVE_BACKGROUND = '#FFAAAA'
const TEXT_LINK = 'blue'
const TEXT = '#000000'

const PADDING = { x: 8, y: 20 }
const textCache = {}

export class Cell {
   constructor(cellHeight) {
      this.height = cellHeight
   }

   // Paints cell with start at position.
   // Formats text and calculates the starting point for text.
   paintCell(canvas, rowIndex, column, position, row, status = CellStatus.DEFAULT) {
      canvas.paintRect(position.x, position.y, column.width, this.height, this.getBackgroundColor(rowIndex, status))

      const formattedText = Cell.getText(column, row)
      if (formattedText.length == 0) return
      const size = Cell.getTextWidth(canvas.ctx, formattedText)
      if (size > (column.width - PADDING.x * 2)) {
         canvas.drawText(position.x + PADDING.x, PADDING.y + position.y, formattedText, 'start', this.getTextColor(column))
      } else {
         canvas.drawText(-PADDING.x + position.x + column.width, PADDING.y + position.y, formattedText, 'end', this.getTextColor(column))
      }
   }

   // Returns different color for clickable cells
   getTextColor(column) {
      return column.onClick !== undefined ? TEXT_LINK : TEXT
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

   static getText(column, row) {
      const text = column.mapper(row)
      const formattedText = column.numberFormatter !== undefined ? column.numberFormatter(text) : text
      return formattedText || ''
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