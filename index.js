
import Canvas from './Canvas.js';
import TableView from './TableView.js';
import DataModel from './DataModel.js';

const nrFormatter = new Intl.NumberFormat('en-US')
const columns = new Array(1000).fill(null).map((e, i) => ({ title: `Column ${i}`, mapper: a => `${a.a}${i}`, visible: true, width: 70 }))
let index = 0
const cells = new Array(1000).fill(null)
    .map(c => new Array(1000).fill(null)
        .map((e, i) => {
            const value = index++
            return { value, formattedValue: nrFormatter.format(value) }
        }))

const input = document.getElementById('input')
const canvas = new Canvas('canvas', 'auto')
const tableView = new TableView(canvas.rootview.frame, DataModel.spreadsheet(columns, cells))

canvas.rootview.addSubview(tableView)
tableView.delegate.selected = (x, y) => {
    const cell = cells[x][y] || {}
    input.value = (cell || {}).value || ''
    input.oninput = (e) => {
        cell.value = e.target.value
        cell.formattedValue = nrFormatter.format(cell.value)
        cells[x][y] = cell
        canvas.rootview.repaint()
    }
}