import Yoga from "yoga-layout";
import { createNode, renderToCanvas } from "./core.js";
import { DrawSymbol } from "./utils.js";
import memoize from "fast-memoize";

/**
 * cell with the same row shares the same height.
 * cell with the same column shares the same width.
 */
function _getTableSize(children) {
  const rows = children.length;
  let columns = 0;
  let width = 0;
  let height = 0;

  // measure all cells
  const rowHeights = [];

  for (const cells of children) {
    let cellHeight = 0;
    for (const cell of cells) {
      cell.node.calculateLayout();
      if (cellHeight < cell.node.getComputedHeight()) {
        cellHeight = cell.node.getComputedHeight();
      }
    }

    rowHeights.push(cellHeight);
    height += cellHeight;
    if (columns < cells.length) columns = cells.length;
  }

  const columnWidths = [];
  for (let c = 0; c < columns; c++) {
    let cellWidth = 0;
    for (let r = 0; r < rows; r++) {
      if (c < children[r].length) {
        const cell = children[r][c];
        if (cellWidth < cell.node.getComputedWidth()) {
          cellWidth = cell.node.getComputedWidth();
        }
      }
    }

    columnWidths.push(cellWidth);
    width += cellWidth;
  }

  // resize node
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      if (c < children[r].length) {
        const cell = children[r][c];
        cell.node.setMinWidth(columnWidths[c]);
        cell.node.setMinHeight(rowHeights[r]);
        cell.node.calculateLayout();
      }
    }
  }

  return {
    width,
    height,
    rows,
    columns,
    columnWidths,
    rowHeights,
  };
}

const getTableSize = memoize(_getTableSize);

export function Table(...children) {
  const node = Yoga.Node.create();
  let tableSize = null;

  node.setMeasureFunc((maxWidth) => {
    tableSize = getTableSize(children);
    return tableSize;
  });

  return createNode(
    {
      children: [],
      type: Table,
      style: {
        tableBorderStyle: ["row", "column"],
      },
      strokeColor(color) {
        this.style.strokeColor = color;
        return this;
      },
      strokeWidth(width) {
        this.style.strokeWidth = width;
        return this;
      },
      borderStyle(...values) {
        this.style.tableBorderStyle = values;
        return this;
      },
      /**
       * @param {import("./types.js").SoneDrawingContext} param0
       */
      [DrawSymbol]: ({ ctx, x, y, component }) => {
        const { tableBorderStyle } = component.style;

        let offsetX = 0;
        ctx.save();
        for (let c = 0; c < tableSize.columns; c++) {
          let offsetY = 0;
          const w = tableSize.columnWidths[c];

          for (let r = 0; r < tableSize.rows; r++) {
            const h = tableSize.rowHeights[r];
            const cellX = x + offsetX;
            const cellY = y + offsetY;

            if (c < children[r].length) {
              const cell = children[r][c];
              renderToCanvas(ctx, cell, cellX, cellY);
            }

            offsetY += h;
          }

          // draw column
          if (
            c > 0 &&
            component.style.strokeWidth > 0 &&
            tableBorderStyle.indexOf("column") !== -1
          ) {
            ctx.strokeStyle = component.style.strokeColor;
            ctx.lineWidth = component.style.strokeWidth;
            if (Array.isArray(component.style.lineDash)) {
              ctx.setLineDash(component.style.lineDash);
            }
            ctx.beginPath();
            ctx.moveTo(x + offsetX, y);
            ctx.lineTo(x + offsetX, y + tableSize.height);

            ctx.stroke();
          }

          offsetX += w;
        }

        if (
          component.style.strokeWidth > 0 &&
          tableBorderStyle.indexOf("row") !== -1
        ) {
          let offsetY = 0;
          for (let r = 0; r < tableSize.rows; r++) {
            if (r > 0) {
              ctx.strokeStyle = component.style.strokeColor;
              ctx.lineWidth = component.style.strokeWidth;
              if (Array.isArray(component.style.lineDash)) {
                ctx.setLineDash(component.style.lineDash);
              }

              ctx.beginPath();
              ctx.moveTo(x, y + offsetY);
              ctx.lineTo(x + tableSize.width, y + offsetY);
              ctx.stroke();
            }

            offsetY += tableSize.rowHeights[r];
          }
        }

        ctx.restore();
      },
    },
    node,
  );
}

export function TableRow(...children) {
  return children;
}
