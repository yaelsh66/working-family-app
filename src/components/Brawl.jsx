import { useState, useEffect } from "react";
import './Brawl.css';
import { Button, InputGroup, FormControl, Row, Col } from 'react-bootstrap';

function Brawl() {
  const brawlTable = {
    Category1: [
      { name: 'one', otherNames: ['One', 'uno'] },
      { name: 'two', otherNames: ['Two', 'dose'] }
    ],
    Category2: [
      { name: 'three', otherNames: ['Three', 'thres'] },
      { name: 'four', otherNames: ['Four', 'quatro'] }
    ]
  };

  const [userInput, setUserInput] = useState('');
  const [currentTable, setCurrentTable] = useState({
    Category1: [],
    Category2: []
  });
  const [availableCategories, setAvailableCategories] = useState(brawlTable);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleAddItem = () => {
    const userItem = userInput.toLowerCase();
    const tableToAdd = { ...currentTable };
    const tableToDelete = { ...availableCategories };
    let done = false;

    for (let category in tableToDelete) {
      for (let i = 0; i < tableToDelete[category].length; i++) {
        const item = tableToDelete[category][i];
        if (item.otherNames.some(name => name.toLowerCase().includes(userItem))) {
          tableToDelete[category].splice(i, 1);
          tableToAdd[category] = [...tableToAdd[category], item.name];
          done = true;
          break;
        }
      }
      if (done) break;
    }

    setCurrentTable(tableToAdd);
    setAvailableCategories(tableToDelete);
    setUserInput('');
  };

  const handleReset = () => {
    setTime(0);
    setUserInput('');
    setAvailableCategories(brawlTable);
    setCurrentTable({ Category1: [], Category2: [] });
  };

  const handleStart = () => {
    handleReset();
    setIsRunning(true);
  };

  const handleGiveUp = () => {
    setIsRunning(false);
    const finalTable = {};
    for (let category in brawlTable) {
      finalTable[category] = brawlTable[category].map(a => a.name);
    }
    setCurrentTable(finalTable);
  };

  return (
    <div className="brawl-wrapper container text-center my-5">
      <h1 className="mb-4">בראוול סטארס - נחשו את כל הבראולרים</h1>

      <div className="mb-3 d-flex flex-wrap justify-content-center gap-2">
        <Button variant="primary" onClick={handleStart}>התחל</Button>
        <Button variant="warning" onClick={() => setIsRunning(false)}>עצור</Button>
        <Button variant="secondary" onClick={handleReset}>איפוס</Button>
        <Button variant="danger" onClick={handleGiveUp}>ויתרתי</Button>
      </div>

      <h4 className="mb-4">⏱ זמן: {time} שניות</h4>

      <InputGroup className="mb-4 w-100 w-md-50 mx-auto">
        <FormControl
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          placeholder="הכנס בראוולר"
        />
        <Button variant="success" onClick={handleAddItem}>הוסף</Button>
      </InputGroup>

      <div className="category-container">
        {Object.keys(currentTable).map((category) => {
          const totalItems = brawlTable[category].length;
          const filledItems = currentTable[category];
          const emptySlots = totalItems - filledItems.length;

          return (
            <div className={`category-column ${category.toLowerCase()}`} key={category}>
              <h5 className="mb-3">{category} ({filledItems.length}/{totalItems})</h5>
              <ul className="category-list">
                {filledItems.map((item, index) => (
                  <li className="category-item" key={`filled-${index}`}>
                    {item}
                  </li>
                ))}
                {[...Array(emptySlots)].map((_, i) => (
                  <li className="category-item empty" key={`empty-${i}`} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Brawl;
