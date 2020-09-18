import { Cell, CellStatus } from './Cell'
import View from './View'
import { ConfettiView } from './ConfettiView'

export default class GridView extends View {
   constructor(frame, dataSupplier, contentWidth, cellHeight, isMultiSelect, onActiveChange) {

      super(frame)
      this.moveTo = this.moveTo.bind(this)
      this.dataSupplier = dataSupplier
      this.contentWidth = contentWidth
      this.xOffset = 0
      this.yOffset = 0
      this.cellHeight = cellHeight

      // true selected rows.
      this.selectedRows = {}
      //  Keeps track of selected row during mousemove. Is reseted at mouseup.
      this.tmpSelectedRows = {}
      this.active = { x: 0, y: 0 }
      this.onActiveChange = onActiveChange
      this.shownRows = { y1: 0, y2: 0 }
      this.shownCols = { x1: 0, x2: 0 }

      // Delegate function called when table has moved
      this.didMove = () => {}
      // Cache for calculations
      this.cache = {}
      // DOM focus is on the table
      this.inFocus = false

      this.isMultiSelect = isMultiSelect
      this.cellPainter = new Cell(this.cellHeight, dataSupplier.getCellBackgroundColor, dataSupplier.getCellTextColor)
      this.lineColor = dataSupplier.getSeparatorColor()
   }
   resetCache() {
      this.cache.maxXOffset = undefined
      this.cache.minXOffset = undefined
      this.cache.columnLength = undefined
   }
   setDidMove(didMove) {
      this.didMove = didMove
   }
   addConfetti(event) {
      const view = new ConfettiView({ x: event.layerX, y: event.layerY, width: 20, height: 20 })
      this.addSubview(view)
   }
   // Returns number of rows visible at page.
   getPageHeight() {
      return Math.ceil(this.frame.height / this.cellHeight)
   }

   // Total number of rows
   getNumberOfRows() {
      return this.dataSupplier.getNumberOfRows()
   }

   // Total number of columns
   getNumberOfColumns() {
      return this.dataSupplier.getNumberOfColumns()
   }

   getContentSize() {
      return { width: this.contentWidth, height: this.getNumberOfRows() * this.cellHeight }
   }
   // Number of columns visible, i.e. not deselected in Column Picker
   getNumberOfVisibleColumns() {
      const nrVisible = 0
      for (let i = 0; i < this.dataSupplier.getNumberOfColumns(); i++) {
         const col = this.dataSupplier.getColumnData()
         if (col.visible) {
            nrVisible++
         }
      }
      return nrVisible
   }

   // Column object with index x in table
   getColumnWithIndex(x) {
      return this.dataSupplier.getColumnData(x)
   }

   // Row object with index y
   getCell(x, y) {
      return this.dataSupplier.getText(x, y)
   }

   focused() {
      this.inFocus = true
      if (this.superview !== undefined) {
         this.repaint()
      }
   }
   blurred() {
      this.inFocus = false
      if (this.superview !== undefined) {
         this.repaint()
      }
   }

   setActive(x, y) {
      this.active = { x, y }
      this.onActiveChange(x, y, this.outOfFrameDelta(x, y))
   }
   /**
    * Move the viewport
    * Handles limiting to not allow viewport outside of visible columns / rows
    */
   moveDown() { this.move(0, 1) }
   moveUp() { this.move(0, -1) }
   moveLeft() { this.move(-1, 0) }
   moveRight() { this.move(1, 0) }
   move(dx, dy) {
      this.moveTo(this.xOffset + dx, this.yOffset + dy)
   }
   moveToRow(row) {
      this.moveTo(this.xOffset, row)
   }
   moveToCol(col) {
      this.moveTo(col, this.yOffset)
   }
   moveTo(x, y) {
      this.xOffset = x
      this.yOffset = y
   }

   /**
    * Moves the 'active' handle around the table.
    * Handles moving the viewport to make sure the active handle is always visible.
    */
   moveActiveDown() { this.moveActive(0, 1) }
   moveActiveUp() { this.moveActive(0, -1) }
   moveActiveLeft() { this.moveActive(-1, 0) }
   moveActiveRight() { this.moveActive(1, 0) }
   moveActive(dx, dy) {
      let nextColIndex = this.active.x + dx
      if (dx != 0) {
         nextColIndex = this.getNextVisibleColumnIndex(this.active.x, dx > 0 ? 1 : -1)
      }
      this.moveActiveTo(nextColIndex, this.active.y + dy)
   }
   moveActiveTo(x, y) {
      const ymax = Math.max(0, this.getNumberOfRows() - 1)
      const xmax = Math.max(0, this.getNumberOfColumns() - 1)
      this.setActive(Math.min(Math.max(0, x), xmax), Math.min(Math.max(0, y), ymax))
      this.repaint()
   }

   // Get next visible column from start in direction.
   // direction = -1 = left, direction = 1 = right
   getNextVisibleColumnIndex(start, direction = 1) {
      let i = 0
      let nextColumn
      do {
         i += direction
         nextColumn = this.getColumnWithIndex(start + i)
      } while (nextColumn !== undefined && !nextColumn.visible)
      if (nextColumn === undefined || !nextColumn.visible) {
         return start
      }
      return start + i
   }

   // Updated selectedRows to match selectedRows XOR tmpSelectedRows
   updateSelectedFromTmp(y1, y2, append = false) {
      if (!append) this.selectedRows = {}
      const ymin = Math.min(y1, y2)
      const ymax = Math.max(y1, y2)
      for (let i = ymin; i <= ymax; i++) {
         if (this.isSelected(i)) {
            this.selectedRows[i] = 1
         } else {
            this.selectedRows[i] = undefined
         }
      }
      this.tmpSelectedRows = {}
      this.repaint()
   }

   // Select row temporary during for example mouse movement. Is used to be able to reset etc. selected rows after mouse movement ends.
   tmpSelectRow(x, y, append = false) {
      this.setActive(x, y)
      this.tmpSelectRowRange(y, y, append)
   }

   // Select row temporary during for example mouse movement. Is used to be able to reset etc. selected rows after mouse movement ends.
   tmpSelectRowRange(y1, y2, append = false) {
      if (!append) this.selectedRows = {}
      this.tmpSelectedRows = {}
      const ymin = Math.min(y1, y2)
      const ymax = Math.max(y1, y2)
      for (let i = ymin; i <= ymax; i++) {
         this.tmpSelectedRows[i] = 1
      }
      this.repaint()
   }

   // Select row. Bypasses the tmpSelectedRows routine. Used for example with keyboard-selection.
   selectRow(x, y, append = false) {
      if (!append) this.selectedRows = {}
      this.selectedRows[y] = 1
      this.repaint()
   }
   // Deselect row. Bypasses the tmpSelectedRows routine. Used for example with keyboard-selection.
   deselect(x, y, append = false) {
      this.setActive(x, y)
      if (!append) this.selectedRows = {}
      else this.selectedRows[y] = undefined
      this.repaint()
   }
   // Is row selected. selectedRows XOR tmpSelectedRows contains the row index
   isSelected(y) {
      return (this.selectedRows[y] || 0) + (this.tmpSelectedRows[y] || 0) == 1
   }

   // Returns the delta to move to make sure x and y is within the viewport
   outOfFrameDelta(x, y) {
      if (y < this.yOffset && this.yOffset > 0) {
         return { x: 0, y: y - this.yOffset }
      }
      const ymax = this.getPageHeight() + this.yOffset
      if (y > ymax - 3) {
         return { x: 0, y: y - ymax + 3 }
      }
      if (x < this.shownCols.x1 + 1) {
         return { x: x - this.shownCols.x1, y: 0 }
      }
      if (x > this.shownCols.x2 - 1) {
         return { x: x - this.shownCols.x2 + 1, y: 0 }
      }
      return undefined
   }

   // Is row the active one
   isActive(x, y) {
      return this.active.x == x && this.active.y == y
   }

   // Paint table. Start from yOffset and paint rows the column starting at xOffset.
   // Paints the columnseparators during the firstrow painting.
   paint(canvas, timestamp) {
      let cellPos = { x: 0, y: 0 }
      const endRow = Math.min(this.yOffset + this.getPageHeight() + 1, this.getNumberOfRows())
      let lastColIndex
      canvas.normalText()
      canvas.beginLine(this.lineColor)
      let isFirstRow = true

      for (let i = this.yOffset; i < endRow; i++) {
         
         for (let j = this.xOffset, len = this.getNumberOfColumns(); j < len; j++) {
            const text = this.dataSupplier.getText(j, i)
            const column = this.dataSupplier.getColumnData(j)
            if (!column.visible) continue
            this.cellPainter.paintCell(canvas, i, j, column.width, cellPos, text, this.getCellStatus(i, j))

            if (isFirstRow) {
               this.paintColumnSeparator(canvas, cellPos.x, 0, this.frame.height)
            }

            cellPos.x += column.width
            if (cellPos.x > this.frame.width) {
               lastColIndex = j
               break
            }
         }
         if (isFirstRow) this.paintColumnSeparator(canvas, cellPos.x, 0, this.frame.height)
         this.paintRowSeparator(canvas, cellPos.y)

         if (i == endRow - 1 && cellPos.x < this.frame.width) { // last row, paint area to the right
            canvas.paintRect(cellPos.x, 0, this.frame.width - cellPos.x, this.frame.height, 'white')
         }

         cellPos = { x: 0, y: cellPos.y + this.cellHeight }
         isFirstRow = false
      }
      this.paintRowSeparator(canvas, cellPos.y)
      this.shownRows = { y1: this.yOffset, y2: endRow }
      this.shownCols = { x1: this.xOffset, x2: lastColIndex }
      canvas.endLine()
   }

   getCellStatus(i, j) {
      if (this.isActive(j, i)) {
         return CellStatus.ACTIVE
      } else if (this.isSelected(i)) {
         return CellStatus.SELECTED
      }
      return CellStatus.DEFAULT
   }

   paintRowSeparator(c, y) {
      c.drawHorizontalLine(0, c.getFrame().width, y + 0.5)
   }
   paintColumnSeparator(c, x, y1, y2) {
      c.drawVerticalLine(x + 0.5, y1, y2)
   }
}
