import View from './View.js'
import GridView from './GridView.js'
import ScrollView from './ScrollView.js'
import TableEventHandler from './TableEventHandler.js'
import TableHeader from './TableHeader'

const CELL_HEIGHT = 30
const SCROLL_WIDTH = 12
const TABLE_HEADER_HEIGHT = 20

export default class TableView extends View {
    constructor(frame, rows, columns, tableId = "tableId") {
        super(frame)
        this.scrollviewDidScroll = this.scrollviewDidScroll.bind(this)

        const insetFrame = { x: TABLE_HEADER_HEIGHT, y: TABLE_HEADER_HEIGHT, width: frame.width - TABLE_HEADER_HEIGHT, height: frame.height - TABLE_HEADER_HEIGHT }

        this.tableHeader = new TableHeader({ x: TABLE_HEADER_HEIGHT, y: 0, width: insetFrame.width, height: TABLE_HEADER_HEIGHT }, columns)

        this.table = new GridView(
            insetFrame,
            rows,
            columns,
            CELL_HEIGHT,
            true)

        new TableEventHandler(
            this.table, tableId,
            { show: () => {}, hide: () => {} })

        const scrollview = new ScrollView(insetFrame,
            this.table.getContentSize(), 
            SCROLL_WIDTH,
            this.scrollviewDidScroll)

        scrollview.resized(scrollview.frame.width, scrollview.frame.height)
        this.table.setDidMove(scrollview.setProgress)
        this.addSubview(this.table)
        this.addSubview(this.tableHeader)
        this.addSubview(scrollview)
    }

    scrollviewDidScroll(x, y) {
        if (x != undefined) {
            this.table.scrolledHorizontal(x)
            this.tableHeader.scrolledHorizontal(x)
        }
        if (y != undefined) {
            this.table.scrolledVertical(y)
        }
    }
}