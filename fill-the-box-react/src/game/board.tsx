import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import './board.css';

interface BoardProps {
    linesNumber: number;
    columnsNumber: number;
}

export function Board(props: BoardProps) {
  const [gridColumns, setGridColumns] = useState("");
  const [gridRows, setGridRows] = useState("");
  const [sequence, setSequence] = useState(new Array<number>());
  const [enabledSquares, setEnabledSquares] = useState(new Array<number>());
  
  useEffect(() => {
    let columns = "";
    for (let i = 0; i < props.columnsNumber; i++) {
        columns += "1fr ";
    }

    setGridColumns(columns);
  }, [props.columnsNumber]);
  
  useEffect(() => {
    let lines = "";
    for (let i = 0; i < props.linesNumber; i++) {
        lines += "1fr ";
    }

    setGridRows(lines);
  }, [props.linesNumber]);

  const getSquare = (line: number, column: number) => {
    return line * props.columnsNumber + column;
  };

  const addEnabledSquare = (line: number, column: number, newEnabledSquares: number[] ) => {
    const squareChecked = getSquare(line, column);
    if (sequence.indexOf(squareChecked) == -1) {
        newEnabledSquares.push(squareChecked);
    }
  };

  const isEnabled = (square: number) => {
    return enabledSquares.indexOf(square) >= 0 || sequence.length == 0;
  }

  const onClick = (square: number, line: number, column: number) => {
    if (isEnabled(square)) {
        let newSequence = [...sequence, square];
        setSequence(newSequence);
        const newEnabledSquares: number[] = [];
        let checkedLine: number;
        if (line >= 2) {
            checkedLine = line - 2;
            if (column >= 2) {
                addEnabledSquare(checkedLine, column - 2, newEnabledSquares);
            }

            if (column < props.columnsNumber - 2) {
                addEnabledSquare(checkedLine, column + 2, newEnabledSquares);
            }
        }

        if (line >= 3) {
            addEnabledSquare(line - 3, column, newEnabledSquares);
        }

        if (column >= 3) {
            addEnabledSquare(line, column - 3, newEnabledSquares);
        }

        if (column < props.columnsNumber - 3) {
            addEnabledSquare(line, column + 3, newEnabledSquares);
        }

        if (line < props.linesNumber - 3) {
            addEnabledSquare(line + 3, column, newEnabledSquares);
        }

        if (line < props.linesNumber - 2) {
            checkedLine = line + 2;
            if (column >= 2) {
                addEnabledSquare(checkedLine, column - 2, newEnabledSquares);
            }

            if (column < props.columnsNumber - 2) {
                addEnabledSquare(checkedLine, column + 2, newEnabledSquares);
            }
        }

        setEnabledSquares(newEnabledSquares);
    }
  }

  const lastSquare = sequence.length == 0 ? null : sequence[sequence.length - 1];

  return (
    <div className={"board"} style={{gridTemplateColumns: gridColumns, gridTemplateRows: gridRows}}>
        {[...Array(props.linesNumber)].map((x, i) => 
            <>
                {[...Array(props.columnsNumber)].map((y, j) => {
                    const square = getSquare(i, j);
                    const sequenceNumber = sequence.indexOf(square);
                    return (
                    <div key={`cell-${i}-${j}`} 
                         className={classnames("square", {"enabledSquare": isEnabled(square), "lastSquare": square === lastSquare})}
                         onClick={() => onClick(square, i, j)}>
                        <p>{sequenceNumber == -1 ? "" : sequenceNumber + 1}</p>
                    </div>
                    )}
                )}
            </>
        )}
    </div>
  );
}
