import React from 'react';
import './content.css';
import { Board } from './board';

export function Content() {
  //const [isPagerDutyPage, setIsPagerDutyPage] = useState(false);

  return (
    <div id="popup-content" className="container">
      <Board columnsNumber={10} linesNumber={10} />
    </div>    
  );
}
