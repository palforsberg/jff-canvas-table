import View from './View.js'
import GridView from './GridView.js'
import ScrollView from './ScrollView.js'
import TableEventHandler from './TableEventHandler.js'
import ColumnHeader from './ColumnHeader'
import RowHeader from './RowHeader.js'

const CELL_HEIGHT = 30
const SCROLL_WIDTH = 12
const COLUMN_HEADER = 20
const ROW_HEADER = 30

export default class TableView extends View {
    constructor(frame, rows, columns) {
        super(frame)
        this.scrollviewDidScroll = this.scrollviewDidScroll.bind(this)
        this.onColumnSizeChange = this.onColumnSizeChange.bind(this)
        this.onActiveChange = this.onActiveChange.bind(this)

        this.rows = rows
        this.columns = columns
        this.columns.width = TableView.getColumnWidth(columns)

        const insetFrame = { x: ROW_HEADER, y: COLUMN_HEADER, width: frame.width - ROW_HEADER, height: frame.height - COLUMN_HEADER }

        this.columnHeader = new ColumnHeader(
            { x: ROW_HEADER, y: 0, width: insetFrame.width, height: COLUMN_HEADER },
            columns,
            this.onColumnSizeChange)
        this.rowHeader = new RowHeader({ x: 0, y: COLUMN_HEADER, width: ROW_HEADER, height: insetFrame.height }, this.rows, CELL_HEIGHT)

        this.grid = new GridView(
            insetFrame,
            rows,
            columns,
            CELL_HEIGHT,
            true,
            this.onActiveChange)

        new TableEventHandler(this.grid, { show: () => {}, hide: () => {} })

        this.scrollview = new ScrollView(
            insetFrame,
            this.grid.getContentSize(), 
            SCROLL_WIDTH,
            this.scrollviewDidScroll)

        this.addSubview(this.grid)
        this.addSubview(this.columnHeader)
        this.addSubview(this.rowHeader)
        this.addSubview(this.scrollview)

        this.xOffset = this.getXOffsets()
        this.yOffset = this.getyOffsets()

        this.delegate = { selected: () => {} }
    }

    // Scrolled
    // x and y will be between 0 and 1
    scrollviewDidScroll(x, y) {
        if (x != undefined) {
            const [x0, x1] = this.xOffset
            const column = Math.floor((x1 - x0) * x)
            this.grid.moveToCol(column)
            this.columnHeader.moveTo(column)
        }
        if (y != undefined) {
            const [y0, y1] = this.yOffset
            const row = Math.floor((y1 - y0) * y)
            this.grid.moveToRow(row)
            this.rowHeader.moveTo(row)
        }
    }

    onColumnSizeChange(column, delta) {
        const col = this.columns[column]
        col.width = Math.max(20, col.width + delta)
        this.columns.width = TableView.getColumnWidth(this.columns)
        this.scrollview.resized(this.grid.getContentSize())
        this.xOffset = this.getXOffsets()
    }

    onActiveChange(x, y) {
        const row = this.rows[y]
        const column = this.columns[x]
        console.log('active ', x, y, column.mapper(row))
        this.delegate.selected(x, y)
    }

    getXOffsets() {
        const rightMargin = 50
        let startPoint = 0
        let minX = 0
        let maxX = 0
        for (let i = 0; i < this.columns.length; i++) {
           const col = this.columns[i]
           if (col.visible) {
               if (minX = 0) {
                   minX = i
               }
              if (startPoint + this.frame.width > this.columns.width + rightMargin && maxX == 0) {
                 maxX = i
                 break;
              }
              startPoint += col.width
           }
        }
        return [minX, maxX]
    }

    // Returns the biggest allowed yOffset to make sure viewport does not show too many empty rows.
    // yOffset = the first row to show
    getyOffsets() {
        return [0, this.rows.length - this.grid.getPageHeight() + 2]
    }

    static getColumnWidth(columns) {
        let length = 0
        for (let i = 0; i < columns.length; i++) {
            length += columns[i].width   
        }
        return length
     }
}