import ScrollView from './ScrollView.js';
import TableView from './TableView.js';
import TableEventHandler from './TableEventHandler.js';
import { Canvas } from './Canvas.js';

const CELL_HEIGHT = 30
const SCROLL_WIDTH = 12

const rows = new Array(1000).fill(null).map((e, i) => ({ a: 'Cell ' + i  }))
const col = new Array(1000).fill(null).map((e, i) => ({ title: `Column ${i}`, mapper: a => `${a.a}${i}`, visible: true, width: 70 }))

const tableId = "tableId"
const canvas = new Canvas(`canvas-${tableId}`, 'auto')
const table = new TableView(
    canvas.rootview.getFrame(),
    rows,
    col,
    CELL_HEIGHT,
    true)
new TableEventHandler(
    canvas, table, tableId,
    { show: () => {}, hide: () => {} })
const scrollview = new ScrollView(canvas.rootview.getFrame(), SCROLL_WIDTH)
scrollview.setViewToBeScrolled(table)
scrollview.resized(scrollview.frame.width, scrollview.frame.height)
table.setDidMove(scrollview.setProgress)
canvas.rootview.addSubview(scrollview)
canvas.rootview.repaint()
