# JFF Canvas Table

## Example
Simple example with 1000 rows and 1000 columns.

`index.js`
```javascript
import { Canvas, TableView, DataModel } from './src/main.js'

const columns = new Array(1000).fill(null).map((e, i) => ({ visible: true, width: 70 }))
let index = 0
const cells = new Array(1000).fill(null)
    .map(c => new Array(1000).fill(null).map((e, i) => ({ value: index++ })))

const input = document.getElementById('input')
const canvas = new Canvas('canvas', 'auto')
const tableView = new TableView(canvas.rootview.frame, DataModel.spreadsheet(columns, cells))

canvas.rootview.addSubview(tableView)
```
`index.html`
```html
<html>
    <head>
        <script src="./index.js" type="module"></script>
    </head>
    <body>
        <canvas id="canvas" tabIndex="0" style="display:block;height:400px;width:600px"></canvas>
    </body>
</html>
```

## Demo
[A demo with a few million cells](https://278204.github.io/public/jff-table.html)