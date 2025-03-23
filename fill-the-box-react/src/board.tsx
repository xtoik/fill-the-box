import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';
import RestartAlt from '@mui/icons-material/RestartAlt';
import Save from '@mui/icons-material/Save';
import classnames from 'classnames';
import styles from './board.module.css';

interface BoardProps {
    linesNumber: number;
    columnsNumber: number;
}

interface HighScore {
    score: number,
    elapsed: number,
    name: string
}

export function Board(props: BoardProps) {
  const [gridColumns, setGridColumns] = useState("");
  const [gridRows, setGridRows] = useState("");
  const [sequence, setSequence] = useState(new Array<number>());
  const [enabledSquares, setEnabledSquares] = useState(new Array<number>());
  const [undoSequence, setUndoSequence] = useState(new Array<number>());
  const [started, setStarted] = useState<null|number>(null);
  const [elapsed, setElapsed] = useState<null|number>(null);
  const [finished, setFinished] = useState(true);
  const [highScores, setHighScores] = useState(new Array<HighScore>());
  const [isHighScore, setIsHighScore] = useState(false);
  
  const HIGH_SCORES_STORAGE_ITEM = "highScores";
  const NUMBER_HIGH_SCORES = 5;

  const getHighScores = () => {
    const lastHighScores: Array<HighScore> = JSON.parse(localStorage.getItem(HIGH_SCORES_STORAGE_ITEM) ?? "[]");
    return lastHighScores;
  };

  const addNewHighScore = (newHighScores: HighScore[]) => {
    const newHighScore: HighScore = {
        score: sequence.length,
        elapsed: elapsed ?? 0,
        name: ""
    };
    newHighScores.push(newHighScore);
    newHighScores.sort((x, y) => {
        if (x.score > y.score) {
            return -1;
        } else if (x.score < y.score) {
            return 1;
        } else if (x.elapsed < y.elapsed) {
            return -1;
        } else {
            return 1;
        }
    });

    return newHighScore;
  };

  useEffect(() => {
    if (finished) {
        const currentHighScores = getHighScores();
        setHighScores([...currentHighScores]);
        if (started !== null) {
            const newHighScore = addNewHighScore(currentHighScores);
            setIsHighScore(currentHighScores.indexOf(newHighScore) < NUMBER_HIGH_SCORES);
        }
    } else {
        setIsHighScore(false);
    }
  }, [finished, started]);
  
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

  useEffect(() => {
    if (started !== null && !finished) {
        if (elapsed === null) {
            setElapsed(Date.now() - started);
        }

        const interval = setInterval(() => {
            if (started !== null && !finished) {
                setElapsed(Date.now() - started);
            }
        }, 1000);

        return () => clearInterval(interval);
    }
  }, [started, elapsed, finished]);

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
        
        if (started === null) {
            setStarted(Date.now());
            setFinished(false); 
        }
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
    if (newEnabledSquares.length == 0) {
        setFinished(true);
    } else if (finished) {
        setFinished(false);
    }
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
        setSequence([]);
    }

    if (undoSequence.length > 0) {
        setUndoSequence([]);
    }

    if (started !== null) {
        setStarted(null);
    }

    if (elapsed !== null) {
        setElapsed(null);
    }
  };

  const formatElapsed = (ms: number, includeMs: boolean) => {
    var d, h, m, s;
    s = Math.floor(ms / 1000);
    ms = ms % 1000;
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    var str = "";
    if (d > 0) {
        str += d + ".";
    }

    if (h > 9) {
        str += h + ":";
    } else if (h > 0) {
        str += "0" + h + ":";
    }
    
    if (m > 9) {
        str += m + ":";
    } else {
        str += "0" + m + ":";
    }

    if (s > 9) {
        str += s;
    } else {
        str += "0" + s;
    }

    if (includeMs) {
        if (ms > 99) {
            str += "." + ms;
        } else if (ms > 9) {
            str += ".0" + ms;
        } else {
            str += ".00" + ms;
        }
    }

    return str;
  };

  const storeHighScore: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form: HTMLFormElement = e.currentTarget;
    const formData = new FormData(form);
    const candidateHighScores = getHighScores();
    const newHighScore = addNewHighScore(candidateHighScores);
    newHighScore.name = formData.get("txtName")?.toString().toUpperCase() ?? "";
    const newHighScores = candidateHighScores.slice(0, NUMBER_HIGH_SCORES);
    setHighScores(newHighScores);
    localStorage.setItem(HIGH_SCORES_STORAGE_ITEM, JSON.stringify(newHighScores));
    setIsHighScore(false);
    restart();
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
            <p className={styles.elapsedTime}>{elapsed ? formatElapsed(elapsed, finished) : ""}</p>
            {highScores.length > 0 && (
                <div className={styles.highScores}>
                    <div className={styles.highScoresTitle}>
                        Hall of Fame
                    </div>
                    {highScores.map((x, i) => (
                        <React.Fragment key={`hof-${i}`}>
                            <div className={styles.highScoreName}>{x.name}</div>
                            <div className={styles.highScorePoints}>{x.score}</div>
                            <div className={styles.highScoreElapsed}>{formatElapsed(x.elapsed, true)}</div>
                        </React.Fragment>
                    ))}
                </div>
            )}            
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
            {isHighScore && (
                <>
                    <div className={styles.boardOverlay}>                
                    </div>
                    <div className={styles.boardOverlayMessage}>
                        <form className={styles.boardOverlayForm} method="post" 
                            onSubmit={storeHighScore}>
                            <center><p className={styles.boardOverlayTitle}>Enter your name:</p></center>
                            <center>
                                <input className={styles.boardOverlayInput} type="text" 
                                        name="txtName" maxLength={3} autoFocus />
                                <IconButton aria-label="save" type="submit" size={"large"}
                                            sx={gameControlSxProps}>
                                    <Save sx={gameControlSxProps} />
                                </IconButton>
                            </center>
                        </form>
                    </div>
                </>
            )}
        </div>
    </div>
  );
}
