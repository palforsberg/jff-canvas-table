
import * as keyCodes from './keyCodes.js'

export default class TableEventHandler {
   constructor(table, tableId, menuDelegate, rowDetailsDelegate) {
      this.canvasOnClick = this.canvasOnClick.bind(this)
      this.canvasMouseMove = this.canvasMouseMove.bind(this)
      this.canvasMouseUp = this.canvasMouseUp.bind(this)
      this.canvasKeyDown = this.canvasKeyDown.bind(this)
      this.canvasKeyUp = this.canvasKeyUp.bind(this)
      this.canvasScroll = this.canvasScroll.bind(this)
      this.getCellForEvent = this.getCellForEvent.bind(this)
      this.onFocus = this.onFocus.bind(this)
      this.onBlur = this.onBlur.bind(this)
      this.isClickable = this.isClickable.bind(this)

      // table.canvas.domCanvas.addEventListener('mousedown', this.canvasOnClick)
      document.getElementById(`canvasTable-${tableId}`).oncontextmenu = (e) => false
      table.canvas.domCanvas.addEventListener('mousemove', this.canvasMouseMove)
      window.addEventListener('mouseup', this.canvasMouseUp)
      table.canvas.domCanvas.addEventListener('wheel', this.canvasScroll)
      table.canvas.domCanvas.addEventListener('keydown', this.canvasKeyDown)
      table.canvas.domCanvas.addEventListener('keyup', this.canvasKeyUp)
      table.canvas.domCanvas.addEventListener('focus', this.onFocus)
      table.canvas.domCanvas.addEventListener('blur', this.onBlur)
      this.table = table
      this.table.onClick = this.canvasOnClick
      this.menuDelegate = menuDelegate
      this.rowDetailsDelegate = rowDetailsDelegate
      // this.table.canvas.domCanvas.oncontextmenu = (e) => false
      this.cursor = { down: false, start: { x: 0, y: 0 }, movedOutside: false }
      this.keys = { alt: false }
      this.tableId = tableId
   }
   reset() {
      // this.table.canvas.domCanvas.removeEventListener('mousedown', this.canvasOnClick)
      this.table.canvas.domCanvas.removeEventListener('mousemove', this.canvasMouseMove)
      window.removeEventListener('mouseup', this.canvasMouseUp)
      this.table.canvas.domCanvas.removeEventListener('wheel', this.canvasScroll)
      this.table.canvas.domCanvas.removeEventListener('keydown', this.canvasKeyDown)
      this.table.canvas.domCanvas.removeEventListener('keyup', this.canvasKeyUp)
      this.table.canvas.domCanvas.removeEventListener('focus', this.onFocus)
      this.table.canvas.domCanvas.removeEventListener('blur', this.onBlur)
   }

   showContextMenu(x, y) {
      this.menuDelegate.show(x, y)
   }
   hideContextMenu() {
      this.menuDelegate.hide()
   }
   showRowDetails(y) {
      this.rowDetailsDelegate.show(y)
   }
   hideRowDetails() {
      this.rowDetailsDelegate.hide()
   }

   onFocus() {
      this.table.focused()
   }
   onBlur() {
      this.table.blurred()
   }
   toggleSelect(cell, append) {
      if (!this.table.isSelected(cell.y)) {
         this.table.selectRow(cell.x, cell.y, append)
      } else {
         this.table.deselect(cell.x, cell.y, append)
      }
   }

   canvasOnClick(event) {
      // console.log('mouse down ', event)
      if (!this.table.inFocus) {
         this.table.canvas.domCanvas.focus()
      }
      if (event.button == 0) { // Left click
         this.leftClickDown(event)
      } else if (event.button == 2) { // Right click
         this.rightClickDown(event)
      }
   }

   canvasMouseMove(event) {
      const currentCell = this.getCellForEvent(event)
      if (!this.cursor.down) { // Hover
         this.hover(event, currentCell)
      } else if (event.button == 0) { // Left click
         this.leftClickMove(event, currentCell)
         // this.table.addConfetti(event)
      }
   }


   canvasMouseUp(event) {
      const currentCell = this.getCellForEvent(event)
      if (event.button == 0 && this.cursor.down) { // Left click
         this.leftClickUp(event, currentCell)
         this.cursor.down = false
      } else if (event.button == 2) { // Right click
         this.rightClickUp(event, currentCell)
      }
      if (event.target === this.table.canvas.domCanvas && !this.isRowDetailsAvailable(event)) {
         this.hideRowDetails()
      }
   }

   hover(event, currentCell) {
      if (this.isClickable(event, currentCell) && this.table.isEventInside(event)) {
         this.table.canvas.domCanvas.style.cursor = 'pointer'
      } else {
         this.table.canvas.domCanvas.style.cursor = 'default'
      }
   }
   leftClickDown(event) {
      const cell = this.getCellForEvent(event)
      this.cursor.down = true
      this.cursor.movedOutside = false
      this.cursor.start = cell
      if (!this.isRowDetailsAvailable(event)) {
         this.table.tmpSelectRow(this.cursor.start.x, this.cursor.start.y, this.table.isMultiSelect && event.ctrlKey)
      }

      this.hideContextMenu()
      event.preventDefault()
   }
   leftClickMove(event, currentCell) {
      if (currentCell.x !== this.cursor.start.x || currentCell.y !== this.cursor.start.y) {
         this.cursor.movedOutside = true
      }
      if (this.table.isMultiSelect) {
         this.table.tmpSelectRowRange(this.cursor.start.y, currentCell.y, event.ctrlKey)
      } else {
         this.table.tmpSelectRow(currentCell.x, currentCell.y, false)
      }
   }
   leftClickUp(event, currentCell) {
      if (!this.cursor.movedOutside) { // no cursor movement within one cell. Handle cell.onClick
         const column = this.table.getColumnWithIndex(currentCell.x)
         if (this.isRowDetailsAvailable(event)) {
            this.showRowDetails(currentCell.y)
            // return
         } else if (this.isClickable(event, currentCell)) {
            column.onClick(this.table.getRowWithIndex(currentCell.y))
         }
      }
      this.table.updateSelectedFromTmp(this.cursor.start.y, currentCell.y, event.ctrlKey)
   }
   rightClickDown(event) {
      const currentCell = this.getCellForEvent(event)
      if (!this.table.isSelected(currentCell.y)) {
         console.log('rc select row')
         this.table.tmpSelectedRows[this.table.rowIds[currentCell.y]] = undefined
         this.table.selectRow(currentCell.x, currentCell.y, this.table.isMultiSelect && event.ctrlKey)
      }
      console.log('rc select cell ', currentCell)
      this.table.active = currentCell // can be set outside table..
      this.hideContextMenu()
      this.showContextMenu(event.layerX, event.layerY)
      event.preventDefault()
   }
   rightClickMove(event) {

   }
   rightClickUp(event, currentCell) {

   }
   canvasKeyUp(event) {
      if (event.keyCode === keyCodes.ALT) {
         this.keys.alt = false
      }
   }
   canvasKeyDown(event) {
      if (this.keys.alt) {
         return
      }

      let handled = false

      switch (event.keyCode) {
         case keyCodes.SPACE: // Space
            this.toggleSelect(this.table.active, event.ctrlKey && this.table.isMultiSelect)
            handled = true
            break
         case keyCodes.PAGE_UP: // Page Up
            this.table.moveActive(0, -this.table.getPageHeight())
            handled = true
            break
         case keyCodes.PAGE_DOWN: // Page Down
            this.table.moveActive(0, this.table.getPageHeight())
            handled = true
            break
         case keyCodes.ENTER: { // Enter
            const active = this.table.active
            if (active.x >= 0 && active.y >= 0) {
               const column = this.table.getColumnWithIndex(active.x)
               const row = this.table.getRowWithIndex(active.y)
               if (column.onClick !== undefined && column.mapper(row) !== undefined) {
                  column.onClick(this.table.getRowWithIndex(active.y))
               }
            }
            handled = true
            break
         }
         case keyCodes.ARROW_LEFT: // Left Arrow
            this.table.moveActiveLeft()
            handled = true
            break
         case keyCodes.ARROW_UP: // Up Arrow
            this.table.moveActiveUp()
            handled = true
            break
         case keyCodes.ARROW_RIGHT: // Right Arrow
            this.table.moveActiveRight()
            handled = true
            break
         case keyCodes.ARROW_DOWN: // Down Arrow
            this.table.moveActiveDown()
            handled = true
            break
         case keyCodes.I: // I
            this.showRowDetails(this.table.active.y)
            handled = true
            break
         case keyCodes.ALT:
            this.keys.alt = true
            handled = true
            break
         default:
      }
      if (event.ctrlKey) {
         if (event.keyCode === keyCodes.C) {
            this.copy(event.shiftKey)
            handled = true
         } else if (event.key === 'a') {
            if (this.table.isMultiSelect) {
               console.log('select all')
               this.table.tmpSelectRowRange(0, this.table.getNumberOfRows() - 1, false)
               this.table.updateSelectedFromTmp(0, this.table.getNumberOfRows() - 1, false)
            }
            handled = true
         }
      }
      if (handled) {
         event.preventDefault()
      }
   }
   canvasScroll(event) {
      const smallestDelta = 50
      let y = 0
      let x = 0
      if (event.shiftKey) {
         const direction = event.deltaY > 0 ? 1 : -1
         const delta = Math.ceil(smallestDelta / Math.abs(event.deltaY)) * direction
         x = delta
      } else if (event.deltaY != 0) {
         const direction = event.deltaY > 0 ? 1 : -1
         const delta = Math.ceil(smallestDelta / Math.abs(event.deltaY)) * direction
         y = delta
      } else if (event.deltaX != 0) {
         const direction = event.deltaX > 0 ? 1 : -1
         const delta = Math.ceil(smallestDelta / Math.abs(event.deltaX)) * direction
         x = delta
      }
      this.table.move(x, y)
      event.preventDefault()
   }

   copy(copyRows, withHeader = false) {
      const selectedRows = this.table.getSelectedRows()
      const active = this.table.active
      const column = this.table.getColumnWithIndex(active.x)
      const row = this.table.getRowWithIndex(active.y)
      let text
      if (selectedRows.length > 0 && copyRows) {
         const visibleColumns = this.table.columnIds.map(id => this.table.columns[id]).filter(col => col.visible)
         text = visibleColumns.map(e => e.mapper(selectedRows)).join('\r\n')
      } else {
         text = column.mapper(row) || ' '
      }
      console.log('copy ', `${text}`.substr(0, 50))
      const inputElement = document.getElementById(`copyValueInput-${this.tableId}`)
      inputElement.value = text
      inputElement.select()
      document.execCommand('Copy')
      this.table.canvas.domCanvas.focus()
   }
   getCellForEvent(event) {
      const clickx = event.layerX
      const clicky = event.layerY
      const nrRows = this.table.rowIds.length
      const cellx = this.getColumnIndexForPosition(clickx)
      const celly = Math.floor(clicky / this.table.cellHeight)
      return { x: cellx + this.table.xOffset, y: Math.min(nrRows - 1, celly + this.table.yOffset) }
   }
   isInsideTable(event) {
      return true
   }

   getColumnIndexForPosition(x) {
      let start = 0
      for (let i = this.table.xOffset, len = this.table.getNumberOfColumns(); i < len; i++) {
         const col = this.table.getColumnWithIndex(i)
         if (!col.visible) continue
         const end = start + col.width
         if (start <= x && x <= end) {
            return i - this.table.xOffset
         }
         start = end
      }
      return -1
   }
   isClickable(event, cell) {
      if (this.table.rowIds.length == 0) {
         return false
      }
      const row = this.table.getRowWithIndex(cell.y)
      const column = this.table.getColumnWithIndex(cell.x)
      if (column !== undefined && column.onClick !== undefined && column.mapper(row) !== undefined) {
         return true
      } else if (this.isRowDetailsAvailable(event)) {
         return true
      }
      return false
   }

   isRowDetailsAvailable(event) {
      return this.table.isRowDetailsAvailable && event.layerX < 20 && this.table.xOffset <= this.table.getCachedMinXOffset()
   }
}
