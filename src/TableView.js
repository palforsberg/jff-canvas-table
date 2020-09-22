import View from './View.js'
import GridView from './GridView.js'
import ScrollView from './ScrollView.js'
import TableEventHandler from './TableEventHandler.js'
import ColumnHeader from './ColumnHeader.js'
import RowHeader from './RowHeader.js'

const CELL_HEIGHT = 30
const SCROLL_WIDTH = 12
const COLUMN_HEADER = 20
const ROW_HEADER = 30

export default class TableView extends View {
    constructor(frame, dataSupplier) {
        super(frame)
        this.scrollviewDidScroll = this.scrollviewDidScroll.bind(this)
        this.onColumnSizeChange = this.onColumnSizeChange.bind(this)
        this.onActiveChange = this.onActiveChange.bind(this)

        this.dataSupplier = dataSupplier
        this.contentWidth = TableView.getColumnWidth(dataSupplier)

        const insetFrame = { x: ROW_HEADER, y: COLUMN_HEADER, width: frame.width - ROW_HEADER, height: frame.height - COLUMN_HEADER }

        this.columnHeader = new ColumnHeader({ x: ROW_HEADER, y: 0, width: insetFrame.width, height: COLUMN_HEADER }, dataSupplier, this.onColumnSizeChange)
        this.rowHeader = new RowHeader({ x: 0, y: COLUMN_HEADER, width: ROW_HEADER, height: insetFrame.height }, dataSupplier.getNumberOfRows(), CELL_HEIGHT)
        this.columnHeader.backgroundColor = dataSupplier.getHeaderBackgroundColor()
        this.rowHeader.backgroundColor = dataSupplier.getHeaderBackgroundColor()

        this.grid = new GridView(
            insetFrame,
            dataSupplier,
            this.contentWidth,
            CELL_HEIGHT,
            true,
            this.onActiveChange)

        new TableEventHandler(this.grid, { show: () => {}, hide: () => {} })

        this.scrollview = new ScrollView(
            insetFrame,
            this.grid.getContentSize(), 
            SCROLL_WIDTH,
            this.scrollviewDidScroll,
            dataSupplier.getScrollColor)
        this.scrollview.vertical.backgroundColor = dataSupplier.getScrollBackgroundColor()
        this.scrollview.horizontal.backgroundColor = dataSupplier.getScrollBackgroundColor()

        const rightCorner = new View({ x: frame.width - SCROLL_WIDTH, y: frame.height - SCROLL_WIDTH, width: SCROLL_WIDTH, height: SCROLL_WIDTH })
        rightCorner.clickable = false
        rightCorner.backgroundColor = dataSupplier.getHeaderBackgroundColor()

        this.addSubview(this.grid)
        this.addSubview(this.columnHeader)
        this.addSubview(this.rowHeader)
        this.addSubview(this.scrollview)
        this.addSubview(rightCorner)

        this.columnSpan = this.getColumnSpans()
        this.rowSpan = this.getRowSpans()

        this.delegate = { selected: () => {} }
    }

    // Scrolled
    // x and y will be between 0 and 1
    scrollviewDidScroll(x, y) {
        if (x != undefined) {
            const [x0, x1] = this.columnSpan
            const column = Math.floor((x1 - x0) * x)
            this.grid.moveToCol(column)
            this.columnHeader.moveTo(column)
        }
        if (y != undefined) {
            const [y0, y1] = this.rowSpan
            const row = Math.floor((y1 - y0) * y)
            this.grid.moveToRow(row)
            this.rowHeader.moveTo(row)
        }
    }

    onColumnSizeChange(column, delta) {
        let col = this.dataSupplier.getColumnWidth(column)
        col = Math.max(20, col + delta)
        this.dataSupplier.setColumnWidth(column, col)
        this.contentWidth = TableView.getColumnWidth(this.dataSupplier)
        this.scrollview.resized(this.grid.getContentSize())
        this.columnSpan = this.getColumnSpans()
    }

    onActiveChange(x, y, outOfFrameDelta) {
        this.delegate.selected(x, y)
        if (outOfFrameDelta !== undefined) {
            this.grid.move(outOfFrameDelta.x, outOfFrameDelta.y)
            this.columnHeader.moveTo(this.grid.xOffset || 0)
            this.rowHeader.moveTo(this.grid.YOffset || 0)
            this.scrollview.setScroll(this.grid.xOffset / this.columnSpan[1], this.grid.yOffset / this.rowSpan[1])
        }
    }

    getColumnSpans() {
        const rightMargin = 50
        let startPoint = 0
        let minX = 0
        let maxX = 0
        for (let i = 0, len = this.dataSupplier.getNumberOfColumns(); i < len; i++) {
           const col = this.dataSupplier.getColumnData(i)
           if (col.visible) {
               if (minX = 0) {
                   minX = i
               }
              if (startPoint + this.frame.width > this.contentWidth + rightMargin && maxX == 0) {
                 maxX = i
                 break;
              }
              startPoint += col.width
           }
        }
        return [minX, maxX]
    }

    // Returns the biggest allowed rowSpan to make sure viewport does not show too many empty cells.
    // rowSpan = the first row to show
    getRowSpans() {
        return [0, this.dataSupplier.getNumberOfRows() - this.grid.getPageHeight() + 2]
    }

    static getColumnWidth(supl) {
        let length = 0
        for (let i = 0, len = supl.getNumberOfColumns(); i < len; i++) {
            length += supl.getColumnWidth(i)   
        }
        return length
     }
}