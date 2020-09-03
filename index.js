const global = {
    styles: {
        backgroundMain: 'white',
        separator: 'black',
    }
}
import ScrollView from './ScrollView.js';
import TableViewController from './TableViewController.js';
import SuperView from './View.js';
import TableEventHandler from './TableEventHandler.js';

const CELL_HEIGHT = 40
const SCROLL_WIDTH = 10

const entities = new Array(1000).fill({ a: 'val1', b: 'val2' })
const columns = {
    'A': { title: 'A', mapper: e => e.a, visible: true, width: 100 },
    'B': { title: 'B', mapper: e => e.b, visible: true, width: 100 },
}

const entityIds = Object.keys(entities)

const tableId = "tableId"
const columnDisplayOrder = Object.keys(columns)
const superview = new SuperView(`canvas-${tableId}`)
const table = new TableViewController(
    superview.canvas,
    entities,
    entityIds,
    CELL_HEIGHT,
    columns,
    columnDisplayOrder,
    true, // props.useRowSelection,
    false,
)
table.setEmptyStateText('No data available')
const tableEventHandler = new TableEventHandler(
    table.tableView,
    tableId,
    { show: () => {}, hide: () => {} },
    { show: () => {}, hide: () => {} }
)
const scrollview = new ScrollView(superview.canvas, SCROLL_WIDTH)
scrollview.setViewToBeScrolled(table)
table.tableView.setDidMove(() => {})
superview.addSubview(scrollview)
