# CanvasTable

## Example
Simple example with 1000 rows and 1000 columns. A canvas with ID 'canvas' must be added to the DOM. 

```javascript
import Canvas from './Canvas.js';
import TableView from './TableView.js';
import DataModel from './DataModel.js';

const columns = new Array(1000).fill(null).map((e, i) => ({ true, width: 70 }))
let index = 0
const cells = new Array(1000).fill(null)
    .map(c => new Array(1000).fill(null).map((e, i) => ({ value: index++ })))

const input = document.getElementById('input')
const canvas = new Canvas('canvas', 'auto')
const tableView = new TableView(canvas.rootview.frame, DataModel.spreadsheet(columns, cells))

canvas.rootview.addSubview(tableView)
```

## Demo
[A demo with a few million cells](https://278204.github.io/jff-table.html)