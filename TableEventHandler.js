
import * as keyCodes from './keyCodes.js'

export default class TableEventHandler {
   constructor(canvas, table, tableId, menuDelegate) {
      this.canvasOnClick = this.canvasOnClick.bind(this)
      this.canvasMouseMove = this.canvasMouseMove.bind(this)
      this.canvasMouseUp = this.canvasMouseUp.bind(this)
      this.canvasKeyDown = this.canvasKeyDown.bind(this)
      this.canvasScroll = this.canvasScroll.bind(this)
      this.getCellForEvent = this.getCellForEvent.bind(this)
      this.onFocus = this.onFocus.bind(this)
      this.onBlur = this.onBlur.bind(this)

      table.onMousedown = this.canvasOnClick
      canvas.domCanvas.oncontextmenu = (e) => false
      canvas.domCanvas.addEventListener('wheel', this.canvasScroll)
      window.addEventListener('keydown', this.canvasKeyDown)
      canvas.domCanvas.addEventListener('focus', this.onFocus)
      canvas.domCanvas.addEventListener('blur', this.onBlur)
      this.table = table
      this.table.onClick = this.canvasOnClick
      this.menuDelegate = menuDelegate
      // canvas.domCanvas.oncontextmenu = (e) => false
      this.cursor = { down: false, start: { x: 0, y: 0 }, movedOutside: false }
      this.tableId = tableId

      this.focusOnCanvas = () => canvas.domCanvas.focus()

      this.reset = () => {
        canvas.domCanvas.removeEventListener('wheel', this.canvasScroll)
        window.removeEventListener('keydown', this.canvasKeyDown)
        canvas.domCanvas.removeEventListener('focus', this.onFocus)
        canvas.domCanvas.removeEventListener('blur', this.onBlur)
      }
    }

   showContextMenu(x, y) {
      this.menuDelegate.show(x, y)
   }
   hideContextMenu() {
      this.menuDelegate.hide()
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
      if (!this.table.inFocus) {
         this.focusOnCanvas()
      }
      if (event.button == 0) { // Left click
         this.leftClickDown(event)
      } else if (event.button == 2) { // Right click
         this.rightClickDown(event)
      }
      window.addEventListener('mousemove', this.canvasMouseMove)
      window.addEventListener('mouseup', this.canvasMouseUp)
   }

   canvasMouseMove(event) {
      const currentCell = this.getCellForEvent(event)
      if (event.button == 0) { // Left click
         this.leftClickMove(event, currentCell)
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
      window.removeEventListener('mousemove', this.canvasMouseMove)
      window.removeEventListener('mouseup', this.canvasMouseUp)
   }
   leftClickDown(event) {
      const cell = this.getCellForEvent(event)
      this.cursor.down = true
      this.cursor.movedOutside = false
      this.cursor.start = cell

      this.table.tmpSelectRow(this.cursor.start.x, this.cursor.start.y, this.table.isMultiSelect && event.ctrlKey)

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
         if (column && column.onClick) {
            column.onClick(this.table.getRowWithIndex(currentCell.y))
         }
      }
      this.table.updateSelectedFromTmp(this.cursor.start.y, currentCell.y, event.ctrlKey)
   }
   rightClickDown(event) {
      const currentCell = this.getCellForEvent(event)
      if (!this.table.isSelected(currentCell.y)) {
         console.log('rc select row')
         this.table.tmpSelectedRows[this.table.rows[currentCell.y]] = undefined
         this.table.selectRow(currentCell.x, currentCell.y, this.table.isMultiSelect && event.ctrlKey)
      }
      console.log('rc select cell ', currentCell)
      this.table.active = currentCell //§ can be set outside table..
      this.hideContextMenu()
      this.showContextMenu(event.layerX, event.layerY)
      event.preventDefault()
   }
   rightClickMove(event) {

   }
   rightClickUp(event, currentCell) {

   }
   canvasKeyDown(event) {

      let handled = false

      switch (event.keyCode) {
         case keyCodes.SPACE: 
            this.toggleSelect(this.table.active, event.ctrlKey && this.table.isMultiSelect)
            handled = true
            break
         case keyCodes.PAGE_UP:
            this.table.moveActive(0, -this.table.getPageHeight())
            handled = true
            break
         case keyCodes.PAGE_DOWN:
            this.table.moveActive(0, this.table.getPageHeight())
            handled = true
            break
         case keyCodes.ENTER: {
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
         case keyCodes.ARROW_LEFT:
            this.table.moveActiveLeft()
            handled = true
            break
         case keyCodes.ARROW_UP:
            this.table.moveActiveUp()
            handled = true
            break
         case keyCodes.ARROW_RIGHT:
            this.table.moveActiveRight()
            handled = true
            break
         case keyCodes.ARROW_DOWN:
            this.table.moveActiveDown()
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
      if (event.deltaY != 0) {
         const direction = event.deltaY > 0 ? 1 : -1
         const delta = Math.ceil(smallestDelta / Math.abs(event.deltaY)) * direction
         y = delta
      } else if (event.deltaX != 0) {
         const direction = event.deltaX > 0 ? 1 : -1
         const delta = Math.ceil(smallestDelta / Math.abs(event.deltaX)) * direction
         x = delta
      }
      this.table.move(x, y)
      this.table.repaint()
      event.preventDefault()
   }

   copy(copyRows, withHeader = false) {
      const selectedRows = this.table.getSelectedRows()
      const active = this.table.active
      const column = this.table.getColumnWithIndex(active.x)
      const row = this.table.getRowWithIndex(active.y)
      let text
      if (selectedRows.length > 0 && copyRows) {
         const visibleColumns = this.table.columns.filter(col => col.visible)
         text = visibleColumns.map(e => e.mapper(selectedRows)).join('\r\n')
      } else {
         text = column.mapper(row) || ' '
      }
      console.log('copy ', `${text}`.substr(0, 50))
      const inputElement = document.getElementById(`copyValueInput-${this.tableId}`)
      inputElement.value = text
      inputElement.select()
      document.execCommand('Copy')
      this.focusOnCanvas()
   }
   getCellForEvent(event) {
      const clickx = event.layerX
      const clicky = event.layerY
      const nrRows = this.table.rows.length
      const cellx = this.getColumnIndexForPosition(clickx)
      const celly = Math.floor(clicky / this.table.cellHeight)
      return { x: cellx + this.table.xOffset, y: Math.min(nrRows - 1, celly + this.table.yOffset) }
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
}
