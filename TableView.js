import { Cell, IconCell, ICON_MARGIN } from './Cell'
import { View } from './View'
import { ConfettiView } from './ConfettiView'

export class TableView extends View {
   constructor(canvas, rows, rowIds, cellHeight, columns, columnIds, isMultiSelect, isRowDetailsAvailable) {
      // this.paint = this.paint.bind(this)
      super(canvas, canvas.getFrame())
      this.moveTo = this.moveTo.bind(this)
      // this.canvas = canvas
      this.rowIds = rowIds
      this.rows = rows
      this.xOffset = 0
      this.yOffset = 0
      this.cellHeight = cellHeight

      // true selected rows.
      this.selectedRows = {}
      //  Keeps track of selected row during mousemove. Is reseted at mouseup.
      this.tmpSelectedRows = {}
      this.active = { x: 0, y: 0 }
      this.shownRows = { y1: 0, y2: 0 }
      this.shownCols = { x1: 0, x2: 0 }

      // Delegate function called when table has moved
      this.didMove = () => {}
      this.columns = columns
      this.columnIds = columnIds
      // Cache for calculations
      this.cache = {}
      // DOM focus is on the table
      this.inFocus = false

      this.isMultiSelect = isMultiSelect
      this.isRowDetailsAvailable = isRowDetailsAvailable
      this.cellPainter = new Cell(this.canvas, this.cellHeight)
      this.iconCellPainter = new IconCell(this.canvas, this.cellHeight)
      this.textColor = "#000000"
      this.lineColor = "#555555"
      this.activeColor = "#222222"
   }
   setColumns(columns) {
      this.columns = columns
      this.resetCache()
   }
   setColumnIds(columnIds) {
      this.columnIds = columnIds
      this.resetCache()
   }
   resetCache() {
      this.cache.maxXOffset = undefined
      this.cache.minXOffset = undefined
      this.cache.columnLength = undefined
   }
   setRows(rows, rowIds) {
      this.rows = rows
      this.rowIds = rowIds
   }
   setDidMove(didMove) {
      this.didMove = didMove
   }
   addConfetti(event) {
      const view = new ConfettiView(this.canvas, { x: event.layerX, y: event.layerY, width: 20, height: 20 })
      this.addSubview(view)
   }
   // Returns number of rows visible at page.
   getPageHeight() {
      return Math.ceil(this.frame.height / this.cellHeight)
   }

   // Total number of rows
   getNumberOfRows() {
      return this.rowIds.length
   }

   // Total number of columns
   getNumberOfColumns() {
      return this.columnIds.length
   }

   getContentSize() {
      return { width: this.getCachedColumnLength(), height: this.getNumberOfRows() * this.cellHeight }
   }
   // Number of columns visible, i.e. not deselected in Column Picker
   getNumberOfVisibleColumns() {
      return this.columnIds.filter(i => this.columns[i].visible).length
   }

   // Column object with index x in table
   getColumnWithIndex(x) {
      return this.columns[this.columnIds[x]]
   }
   resized(width, height) {
      super.resized(width, height)
      this.resetCache()
   }
   // Total length in pixels for the visible columns
   getCachedColumnLength() {
      return this.cacheFunction('columnLength', () => this.getColumnLength())
   }
   getColumnLength() {
      return this.columnIds
         .filter(id => this.columns[id].visible)
         .reduce((acc, id, i) => {
            let tmp = acc
            const column = this.columns[id]
            tmp += column.width
            return tmp
         }, 0)
   }
   reset() {
      this.canvas.clear()
      this.rowIds = []
      this.rows = {}
      this.columns = {}
      this.columnIds = []
   }

   // Row object with index y
   getRowWithIndex(y) {
      return this.rows[this.rowIds[y]]
   }

   getRowIndexDisplayed(trueRowIndex) {
      return trueRowIndex - this.yOffset
   }
   getRowIndexForId(rowId) {
      for (let i = 0, len = this.rowIds.length; i < len; i++) {
         if (this.rowIds[i] === rowId) {
            return i
         }
      }
      return -1
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
   /**
    * Move the viewport
    * Handles limiting to not allow viewport outside of visible columns / rows
    */
   moveDown() { this.move(0, 1) }
   moveUp() { this.move(0, -1) }
   moveLeft() { this.move(-1, 0) }
   moveRight() { this.move(1, 0) }
   move(dx, dy, moveScroll = true) {
      this.moveTo(this.xOffset + dx, this.yOffset + dy, moveScroll)
   }
   resetPosition() {
      this.moveTo(0, 0, true, true)
   }
   resetYPosition() {
      this.moveTo(this.xOffset, 0, true, true)
   }
   moveTo(x, y, moveScroll = true, callDelegate = true) {
      const oldX = this.xOffset
      const ymax = Math.max(0, this.getMaxYOffset())
      const xmax = Math.max(0, this.getCachedMaxXOffset())
      this.xOffset = Math.min(Math.max(this.getCachedMinXOffset(), x), xmax)
      this.yOffset = Math.min(Math.max(0, y), ymax)
      if (callDelegate) this.didMove((this.xOffset - this.getCachedMinXOffset()) / Math.max(xmax - this.getCachedMinXOffset(), 1), this.yOffset / Math.max(ymax, 1), moveScroll, oldX !== this.xOffset)
      // if (paint) this.repaint()
   }

   getProgress() {
      const ymax = Math.max(0, this.getMaxYOffset())
      const xmax = Math.max(0, this.getCachedMaxXOffset())
      return { x: (this.xOffset - this.getCachedMinXOffset()) / Math.max(xmax - this.getCachedMinXOffset(), 1), y: this.yOffset / Math.max(ymax, 1) }
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
      this.active.x = Math.min(Math.max(0, x), xmax)
      this.active.y = Math.min(Math.max(0, y), ymax)
      const outOfFrameDelta = this.outOfFrameDelta(this.active.x, this.active.y)
      if (outOfFrameDelta !== undefined) {
         this.move(outOfFrameDelta.x, outOfFrameDelta.y, true)
      }
      this.repaint()
   }

   // Moves the viewport vertically to location. 0 <= location <= 1
   scrolledVertical(location) {
      const nrRows = this.getMaxYOffset()
      const rowToShow = Math.ceil(nrRows * location)
      this.moveTo(this.xOffset, rowToShow, false, true)
   }

   // Moves the viewport horizontally to location. 0 <= location <= 1
   scrolledHorizontal(location) {
      const colLength = this.getCachedMaxXOffset()
      const colToShow = Math.round(colLength * location)
      this.moveTo(colToShow, this.yOffset, false, true)
   }

   // Stores return value of funcToCache in cache. Returns cached value if existing
   cacheFunction(id, funcToCache) {
      if (this.cache[id] !== undefined) {
         return this.cache[id]
      }
      const newVal = funcToCache()
      this.cache[id] = newVal
      return newVal
   }

   // Return the biggest allowed xOffset to make sure viewport does not show too many empty columns.
   // xOffset = the first column shown
   getCachedMaxXOffset() {
      return this.cacheFunction('maxXOffset', () => this.getMaxXOffset())
   }
   getMaxXOffset() {
      const rightMargin = 50
      let startPoint = 0
      const columnsWidth = this.getCachedColumnLength()
      const canvasWidth = this.frame.width
      if (columnsWidth < canvasWidth) return 0
      for (let i = 0; i < this.columnIds.length; i++) {
         const col = this.getColumnWithIndex(i)
         if (col.visible) {
            if (startPoint + canvasWidth > columnsWidth + rightMargin) {
               return i
            }
            startPoint += col.width
         }
      }
      return 0
   }

   // Returns the smallest allowed xOffset.
   // Since columns can be hidden minXOffset is not always 0
   getCachedMinXOffset() {
      return this.cacheFunction('minXOffset', () => this.getMinXOffset())
   }
   getMinXOffset() {
      for (let i = 0; i < this.columnIds.length; i++) {
         const col = this.getColumnWithIndex(i)
         if (col.visible) {
            return i
         }
      }
      return 0
   }

   // Returns the biggest allowed yOffset to make sure viewport does not show too many empty rows.
   // yOffset = the first row to show
   getMaxYOffset() {
      return this.getNumberOfRows() - this.getPageHeight() + 2
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
            this.selectedRows[this.rowIds[i]] = 1
         } else {
            this.selectedRows[this.rowIds[i]] = undefined
         }
      }
      this.tmpSelectedRows = {}
      this.repaint()
   }

   // Select row temporary during for example mouse movement. Is used to be able to reset etc. selected rows after mouse movement ends.
   tmpSelectRow(x, y, append = false) {
      this.active = { x, y }
      this.tmpSelectRowRange(y, y, append)
   }

   // Select row temporary during for example mouse movement. Is used to be able to reset etc. selected rows after mouse movement ends.
   tmpSelectRowRange(y1, y2, append = false) {
      if (!append) this.selectedRows = {}
      this.tmpSelectedRows = {}
      const ymin = Math.min(y1, y2)
      const ymax = Math.max(y1, y2)
      for (let i = ymin; i <= ymax; i++) {
         this.tmpSelectedRows[this.rowIds[i]] = 1
      }
      this.repaint()
   }

   // Returns the row objects which are selected
   getSelectedRows() {
      return Object.keys(this.selectedRows)
         .filter(id => this.selectedRows[id] !== undefined)
         .map(id => this.rows[id])
   }

   // Select row. Bypasses the tmpSelectedRows routine. Used for example with keyboard-selection.
   selectRow(x, y, append = false) {
      if (!append) this.selectedRows = {}
      this.selectedRows[this.rowIds[y]] = 1
      this.repaint()
   }
   // Deselect row. Bypasses the tmpSelectedRows routine. Used for example with keyboard-selection.
   deselect(x, y, append = false) {
      this.active = { x, y }
      if (!append) this.selectedRows = {}
      else this.selectedRows[this.rowIds[y]] = undefined
      this.repaint()
   }
   // Is row selected. selectedRows XOR tmpSelectedRows contains the row index
   isSelected(y) {
      return (this.selectedRows[this.rowIds[y]] || 0) + (this.tmpSelectedRows[this.rowIds[y]] || 0) == 1
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
   // Draws offscreenCanvas onto canvas.
   paint(timestamp) {
      const cellPos = { x: 0, y: 0 }
      const textInset = { left: 0, right: 0 }
      const endRow = Math.min(this.yOffset + this.getPageHeight() + 1, this.getNumberOfRows())
      const colSepHeight = this.getPageHeight() * this.cellHeight// (endRow - this.yOffset) * this.cellHeight
      const minXoffset = this.getCachedMinXOffset()
      let activeFrame
      let lastColIndex
      this.canvas.normalText()
      this.canvas.beginLine(this.lineColor)
      let isFirstRow = true
      
      for (let i = this.yOffset; i < endRow; i++) {
         const row = this.getRowWithIndex(i)

         for (let j = this.xOffset, len = this.getNumberOfColumns(); j < len; j++) {
            const column = this.getColumnWithIndex(j)
            if (!column.visible) continue
            const iconOffset = this.isRowDetailsAvailable && j <= minXoffset ? ICON_MARGIN : 0
            const cell = column.icon !== undefined ? this.iconCellPainter : this.cellPainter
            textInset.left = iconOffset
            cell.paintCell(i, column, cellPos, row, textInset, this.isSelected(i))

            if (this.inFocus && this.isActive(j, i)) activeFrame = { x: cellPos.x + iconOffset, y: cellPos.y, width: column.width - iconOffset, height: this.cellHeight }
            if (isFirstRow) {
               this.paintColumnSeparator(this.canvas, cellPos.x, 0, colSepHeight)
            }

            cellPos.x += column.width
            if (cellPos.x > this.frame.width) {
               lastColIndex = j
               break
            }
         }
         if (this.isRowDetailsAvailable && this.xOffset <= minXoffset) {
            this.canvas.iconText()
            this.canvas.drawText(5, cellPos.y + 22, String.fromCharCode('0xe086'), 'start', this.textColor)
            this.canvas.normalText()
         }
         if (isFirstRow) this.paintColumnSeparator(this.canvas, cellPos.x, 0, colSepHeight)
         this.paintRowSeparator(this.canvas, cellPos.y)
         cellPos.y += this.cellHeight
         cellPos.x = 0
         isFirstRow = false
      }
      this.paintRowSeparator(this.canvas, cellPos.y)
      this.shownRows = { y1: this.yOffset, y2: endRow }
      this.shownCols = { x1: this.xOffset, x2: lastColIndex }
      this.canvas.endLine()
      if (activeFrame !== undefined) {
         this.canvas.drawRect(activeFrame.x + 1, activeFrame.y + 1, activeFrame.width - 2, activeFrame.height - 2, this.activeColor)
      }
   }

   // Paints the rowseparators on offscreenCanvas
   paintRowSeparatorsOffscreen() {
      this.canvas.beginLine()
      let cellY = 0
      const endRow = this.getPageHeight() + 1
      this.offscreenCanvas.beginLine()
      for (let i = 0; i < endRow; i++) {
         this.paintRowSeparator(this.offscreenCanvas, cellY)
         cellY += this.cellHeight
      }
      this.offscreenCanvas.endLine()
   }

   paintRowSeparator(c, y) {
      c.drawHorizontalLine(0, c.getFrame().width, y + 0.5)
   }
   paintColumnSeparator(c, x, y1, y2) {
      c.drawVerticalLine(x - 0.5, y1, y2)
   }
}
