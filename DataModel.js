export default class DataModel {

    getNumberOfColumns() {
        console.error('must implement in subclass')
    }

    getNumberOfRows() {
        console.error('must implement in subclass')
    }

    getColumnWidth(col) {
        console.error('must implement in subclass')
    }
    setColumnWidth(col, width) {
        console.error('must implement in subclass')
    }
    getColumnData(col) {
        console.error('must implement in subclass')
    }

    getText(x, y) {
        console.error('must implement in subclass')
    }

    static spreadsheet(columns, cells) {
        return new SpreadsheetSupplier(columns, cells)
    }
}

class SpreadsheetSupplier extends DataModel {
    constructor(columns, cells) {
        super()
        this.columns = columns
        this.cells = cells
    }

    getNumberOfColumns() {
        return this.columns.length
    }

    getNumberOfRows() {
        return 2000
    }

    getColumnWidth(col) {
        return this.columns[col].width
    }
    setColumnWidth(col, width) {
        this.columns[col].width = width
    }

    getColumnData(col) {
        return this.columns[col]
    }
    getText(x, y) {
        const cell = this.cells[x][y]
        if (cell == undefined) {
            return ''
        }
        return cell.formattedValue || cell.value
    }
}

