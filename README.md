# CanvasTable

## Example
Simple example with 1000 rows and 1000 columns. A canvas with ID 'canvas' must be added to the DOM as well. 

```javascript

import Canvas from './Canvas.js'
import TableView from './TableView.js'

const rows = new Array(1000).fill(null).map((e, i) => ({ a: 'Cell ' + i  }))
const columns = new Array(1000).fill(null).map((e, i) => ({ title: `Column ${i}`, mapper: a => `${a.a}${i}`, visible: true, width: 70 }))

const canvas = new Canvas('canvas', 'auto')
const tableView = new TableView(canvas.rootview.frame, rows, columns)
canvas.rootview.addSubview(tableView)

```