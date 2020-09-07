const CELL_EVEN_BACKGROUND = '#F4F4F4'
const CELL_UNEVEN_BACKGROUND = '#FFFFFF'
const CELL_SELECTED_BACKGROUND = '#FFFFCC'
const CELL_ACTIVE_BACKGROUND = '#FFAAAA'
const TEXT_LINK = 'blue'
const TEXT = '#000000'

const PADDING = { x: 8, y: 20 }
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

      canvas.drawText(PADDING.x + position.x, PADDING.y + position.y, formattedText, 'start', this.getTextColor(column))
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
}

export const CellStatus = {
   DEFAULT: 'default',
   SELECTED: 'selected',
   ACTIVE: 'active'
}