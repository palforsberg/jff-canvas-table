
import { Canvas } from './Canvas.js';
import TableView from './TableView.js';


const rows = new Array(1000).fill(null).map((e, i) => ({ a: 'Cell ' + i  }))
const columns = new Array(1000).fill(null).map((e, i) => ({ title: `Column ${i}`, mapper: a => `${a.a}${i}`, visible: true, width: 70 }))

const tableId = "tableId"
const canvas = new Canvas(`canvas-${tableId}`, 'auto')

const tableView = new TableView(canvas.rootview.frame, rows, columns, tableId)

canvas.rootview.addSubview(tableView)
canvas.rootview.repaint()
