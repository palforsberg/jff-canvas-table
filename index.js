
import Canvas from './Canvas.js';
import TableView from './TableView.js';

const rows = new Array(1000).fill(null).map((e, i) => ({ a: 'Cell ' + i  }))
const columns = new Array(1000).fill(null).map((e, i) => ({ title: `Column ${i}`, mapper: a => `${a.a}${i}`, visible: true, width: 70 }))

const input = document.getElementById("input")
const canvas = new Canvas('canvas', 'auto')
const tableView = new TableView(canvas.rootview.frame, rows, columns)
canvas.rootview.addSubview(tableView)

tableView.delegate.selected = (x, y) => {
    const row = rows[y]
    const column = columns[x]
    input.value = column.mapper(row)
    input.oninput = (e) => {
        row.a = e.target.value
        canvas.rootview.repaint()
    }
}