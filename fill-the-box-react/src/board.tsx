import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';
import RestartAlt from '@mui/icons-material/RestartAlt';
import classnames from 'classnames';
import styles from './board.module.css';

interface BoardProps {
    linesNumber: number;
    columnsNumber: number;
}

export function Board(props: BoardProps) {
  const [gridColumns, setGridColumns] = useState("");
  const [gridRows, setGridRows] = useState("");
  const [sequence, setSequence] = useState(new Array<number>());
  const [enabledSquares, setEnabledSquares] = useState(new Array<number>());
  const [undoSequence, setUndoSequence] = useState(new Array<number>());
  
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

  useEffect(() => {
    if (sequence.length == 0) {
        setEnabledSquares([]);
    } else {
        const lastSquare = sequence[sequence.length - 1];
        const lineColumnLastSquare = getLineColumn(lastSquare);
        calculateEnabledSquares(lineColumnLastSquare.line, lineColumnLastSquare.column);
    }
  }, [sequence]);

  const getSquare = (line: number, column: number) => {
    return line * props.columnsNumber + column;
  };

  const getLineColumn = (square: number) => {
    const line = Math.floor(square / props.columnsNumber);
    const column = square % props.columnsNumber;

    return {
        line: line,
        column: column
    };
  }

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
        setUndoSequence([]);
    }
  };

  const calculateEnabledSquares = (line: number, column: number) => {
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
  };

  const undo = () => {
    if (sequence.length > 0) {
        const newSequence = [...sequence];
        const undoneSquare = newSequence.pop() ?? -1;
        setUndoSequence([...undoSequence, undoneSquare])
        setSequence(newSequence);
    }
  }

  const redo = () => {
    if (undoSequence.length > 0) {
        const newUndoSequence = [...undoSequence];
        const redoneSquare = newUndoSequence.pop() ?? -1;
        setUndoSequence(newUndoSequence);
        setSequence([...sequence, redoneSquare]);
    }
  }

  const restart = () => {
    if (sequence.length > 0) {
        setUndoSequence([])
        setSequence([]);
    }
  };

  const lastSquare = sequence.length == 0 ? null : sequence[sequence.length - 1];
  const gameControlSxProps = { width: "min(10vh, 10vw)", height: "min(10vh, 10vw)"};

  return (
    <div className={styles.gameContainer}>
        <div className={styles.infoPanel}>
            <h1 className={styles.title}>Fill the Box</h1>
            <div className={styles.gameControls}>
                <div className={styles.gameControl}>
                    <IconButton aria-label="undo" disabled={sequence.length == 0}
                                onClick={() => undo()} size={"large"}
                                sx={gameControlSxProps}>
                        <Undo sx={gameControlSxProps} />
                    </IconButton>
                </div>
                <div className={styles.gameControl}>
                    <IconButton aria-label="redo" disabled={undoSequence.length == 0}
                                onClick={() => redo()} size={"large"}
                                sx={gameControlSxProps}>
                        <Redo sx={gameControlSxProps} />
                    </IconButton>
                </div>
                <div className={styles.gameControl}>
                    <IconButton aria-label="restart" disabled={sequence.length == 0}
                                onClick={() => restart()} size={"large"}
                                sx={gameControlSxProps}>
                        <RestartAlt sx={gameControlSxProps} />
                    </IconButton>
                </div>
            </div>
        </div>
        <div className={styles.board} style={{gridTemplateColumns: gridColumns, gridTemplateRows: gridRows}}>
            {[...Array(props.linesNumber)].map((x, i) => (
                <React.Fragment key={`line-${i}`}>
                    {[...Array(props.columnsNumber)].map((y, j) => {
                        const square = getSquare(i, j);
                        const sequenceNumber = sequence.indexOf(square);
                        const classNames = classnames(styles.square, 
                            {[styles.enabledSquare]: isEnabled(square), [styles.lastSquare]: square === lastSquare});
                        return (
                        <div key={`cell-${i}-${j}`} 
                            className={classNames}
                            onClick={() => onClick(square, i, j)}>
                            <p className={styles.squareText}>{sequenceNumber == -1 ? "" : sequenceNumber + 1}</p>
                        </div>
                        );}
                    )}
                </React.Fragment>
            ))}
        </div>
    </div>
  );
}
