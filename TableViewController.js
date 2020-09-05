import { View } from './View'
import { TableView } from './TableView'
import { Label } from './Label'

export default class TableViewController extends View {
   constructor(canvas, rows, rowIds, cellHeight, columns, columnIds, isMultiSelect) {
      super(canvas.getFrame())
      this.scrolledHorizontal = this.scrolledHorizontal.bind(this)
      this.scrolledVertical = this.scrolledVertical.bind(this)
      this.tableView = new TableView(this.frame, rows, rowIds, cellHeight, columns, columnIds, isMultiSelect)
      const label = new EmptyStateView(this.frame)
      label.font = '20px Helvetica'
      label.textColor = "gray"
      label.textAlign = 'center'
      label.backgroundColor = "yellow"
      this.emptyStateView = label

      if (rowIds.length === 0) {
         this.addSubview(this.emptyStateView)
      } else {
         this.addSubview(this.tableView)
      }
   }
   getContentSize() {
      return this.tableView.getContentSize()
   }
   scrolledVertical(location) {
      this.tableView.scrolledVertical(location)
   }
   scrolledHorizontal(location) {
      this.tableView.scrolledHorizontal(location)
   }
   resized(width, height) {
      this.setSize(width, height)
      this.tableView.resized(width, height)
      this.emptyStateView.resized(width, height)
   }

   resetYPosition() {
      this.tableView.resetYPosition()
   }
   resetPosition() {
      this.tableView.resetPosition()
   }
   setRows(rows, rowIds) {
      if (this.tableView.rowIds.length === 0 && rowIds.length > 0) {
         this.didReceiveRows()
      } else if (rowIds.length === 0 && this.tableView.rowIds.length > 0) {
         this.didLoseRows()
      }
      this.tableView.setRows(rows, rowIds)
   }
   setColumnIds(columnIds) {
      this.tableView.setColumnIds(columnIds)
   }
   setColumns(columns) {
      this.tableView.setColumns(columns)
   }
   setDidMove(didMove) {
      this.tableView.setDidMove(didMove)
   }
   setEmptyStateText(text) {
      this.emptyStateView.text = text
   }
   getSelectedRows() {
      return this.tableView.getSelectedRows()
   }
   getRowWithIndex(index) {
      return this.tableView.getRowWithIndex(index)
   }
   getRowIndexDisplayed(index) {
      return this.tableView.getRowIndexDisplayed(index)
   }
   getRowIndexForId(id) {
      return this.tableView.getRowIndexForId(id)
   }
   getColumnWithIndex(index) {
      return this.tableView.getColumnWithIndex(index)
   }
   getXoffset() {
      return this.tableView.xOffset
   }
   getYoffset() {
      return this.tableView.yOffset
   }
   getProgress() {
      return this.tableView.getProgress()
   }
   reset() {
      this.tableView.reset()
   }
   didReceiveRows() {
      if (!this.tableView.hasSuperview()) {
         this.addSubview(this.tableView)
         this.emptyStateView.removeFromSuperview()
      }
   }
   didLoseRows() {
      if (!this.emptyStateView.hasSuperview()) {
         this.addSubview(this.emptyStateView)
         this.tableView.removeFromSuperview()
      }
   }
}

class EmptyStateView extends Label {
   paint(canvas, timestamp) {
      super.paint(timestamp)
      canvas.beginLine()
      canvas.drawHorizontalLine(0, this.frame.width, 0.5)
      canvas.endLine()
   }
}
