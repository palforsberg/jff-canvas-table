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
import { Canvas } from './Canvas.js';

const CELL_HEIGHT = 30
const SCROLL_WIDTH = 10

const entities = new Array(1000).fill(null).map((e, i) => ({ a: 'Cell ' + i  }))
const colArr = new Array(100).fill(null).map((e, i) => ({ title: `Column ${i}`, mapper: a => `${a.a}${i}`, visible: true, width: 100 }))
const columns = { ...colArr }

const entityIds = Object.keys(entities)
const columnDisplayOrder = Object.keys(columns)

const tableId = "tableId"
const canvas = new Canvas('canvas-tableId', { width: 1000, height: 700 })
const superview = canvas.rootview

const table = new TableViewController(
    superview.canvas,
    entities,
    entityIds,
    CELL_HEIGHT,
    columns,
    columnDisplayOrder,
    true,
)
table.setEmptyStateText('No data available')
const tableEventHandler = new TableEventHandler(
    canvas,
    table.tableView,
    tableId,
    { show: () => {}, hide: () => {} },
    { show: () => {}, hide: () => {} }
)
const scrollview = new ScrollView(superview.getFrame(), SCROLL_WIDTH)
scrollview.setViewToBeScrolled(table)
table.tableView.setDidMove(() => {})
superview.addSubview(scrollview)
