
import { Canvas, TableView, DataModel } from './src/main.js'

const nrFormatter = new Intl.NumberFormat('en-US')
const columns = new Array(1000).fill(null).map((e, i) => ({ visible: true, width: 70, align: 'right' }))
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
    input.value = cell.value || ''
    input.oninput = (e) => {
        cell.value = e.target.value
        cell.formattedValue = nrFormatter.format(cell.value)
        cells[x][y] = cell
        canvas.rootview.repaint()
    }
}