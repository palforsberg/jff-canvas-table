const CELL_EVEN_BACKGROUND = '#F9F9F9'
const CELL_UNEVEN_BACKGROUND = '#FFFFFF'
const CELL_SELECTED_BACKGROUD = '#FFFFCC'
const TEXT_LINK = 'blue'
const TEXT = '#000000'

export const ICON_MARGIN = 20
const PADDING = { x: 8, y: 20 }
export class Cell {
   constructor(canvas, cellHeight) {
      this.canvas = canvas
      this.height = cellHeight
   }

   // Paints cell with start at position.
   // Formats text and calculates the starting point for text.
   paintCell(canvas, rowIndex, column, position, row, textInset, selected = false) {
      canvas.paintRect(position.x, position.y, column.width, this.height, this.getBackgroundColor(rowIndex, selected))
      const formattedText = Cell.getText(column, row)

      if (formattedText.length == 0) return

      const start = this.getTextStartAndAlignment(formattedText, column, row, textInset, PADDING)
      canvas.drawText(position.x + start.x, position.y + start.y, formattedText, start.align, this.getTextColor(column))
   }

   // Returns the startposition and alignment for column and row.
   // If column.numeric, approximate textlength. If textLength > columnWidth alignment = 'start' (left) else alignment = 'end' (right)
   // Start of text should always be visible so if the text does not fit, display only first part and let the next cell clip the rest of the text.
   getTextStartAndAlignment(text, column, row, textInset, padding) {
      if (column.numeric) {
         const textWidth = this.getApproximateTextWidth(text)
         if (padding.x + textWidth + textInset.left + textInset.right > column.width) {
            return { x: padding.x + textInset.left, y: padding.y, align: 'start' }
         }
         return { x: column.width - padding.x - textInset.right, y: padding.y, align: 'end' }
      }
      return { x: padding.x + textInset.left, y: padding.y }
   }
   // Returns different color for clickable cells
   getTextColor(column) {
      return column.onClick !== undefined ? TEXT_LINK : TEXT
   }
   // Background color, different for even and uneven and selected rows.
   getBackgroundColor(rowIndex, selected) {
      if (selected) {
         return CELL_SELECTED_BACKGROUD
      } else if (rowIndex % 2 == 0) { // 0 indexed, first row has rowIndex = 0 => % 2 == 0
         return CELL_UNEVEN_BACKGROUND
      }
      return CELL_EVEN_BACKGROUND
   }
   // Approximates the textwidth using the length for 0-9, ., and -
   // Is font and size specific configured to font 14px Helvetica.
   getApproximateTextWidth(text) {
      // canvas.ctx.measureText(text).width is exact but slower.
      const numberWidth = 7.7861328125
      const dotWidth = 3.8896484375
      const dashWidth = 4.662109375
      if (typeof text !== 'string') {
         return `${text}`.length * numberWidth
      }
      const noNumbers = text.match(/[0-9]/g).length
      const noDashes = text.charAt(0) === '-' ? 1 : 0
      const commasAndDots = text.length - noNumbers - noDashes
      return noNumbers * numberWidth + commasAndDots * dotWidth + noDashes * dashWidth
   }

   getEvenBackground() {
      return CELL_EVEN_BACKGROUND
   }

   static getText(column, row) {
      const text = column.mapper(row)
      const formattedText = column.numberFormatter !== undefined ? column.numberFormatter(text) : text
      return formattedText !== undefined ? formattedText : ''
   }

   static getCellClass(column) {
      return column.icon !== undefined ? IconCell : Cell
   }
}

export class IconCell extends Cell {
   paintCell(canvas, rowIndex, column, position, row, textInset, selected = false) {
      canvas.paintRect(position.x, position.y, column.width, this.height, this.getBackgroundColor(rowIndex, selected))
      const formattedText = IconCell.getText(column, row)

      if (formattedText.length == 0) return

      const start = this.getTextStartAndAlignment(formattedText, column, row, textInset, PADDING)

      const icon = column.icon(row)
      if (icon !== undefined) {
         canvas.iconText()
         canvas.drawText(start.x + position.x, start.y + position.y + 2, String.fromCharCode(icon.char), start.align, icon.color || Cell.getTextColor(column))
         canvas.normalText()
      }

      canvas.drawText(start.x + position.x + ICON_MARGIN, start.y + position.y, formattedText, start.align, this.getTextColor(column))
   }
}
