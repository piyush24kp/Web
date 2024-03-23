// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import baseURLContext from './baseURLContext';
import StockAnalysis from './StockAnalysis';
import './App.css';

function HomePage({ setBaseURL }) {
  const [inputValue, setInputValue] = useState('http://localhost:8080');
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    if (inputValue.trim() !== '') {
      let finalURL = inputValue;
      if (!inputValue.startsWith('http://') && !inputValue.startsWith('https://')) {
        finalURL = `http://${inputValue}`;
      }
      setBaseURL(finalURL);
      localStorage.setItem('baseURL', finalURL);
      navigate('/analysis');
    } else {
      setBaseURL('http://localhost:8080');
      localStorage.setItem('baseURL', 'http://localhost:8080');
      navigate('/analysis');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Please enter the base URL for API calls:</p>
        <input type="text" value={inputValue} onChange={handleInputChange} />
        <button onClick={handleSubmit}>Submit</button>
      </header>
    </div>
  );
}

function App() {
  const [baseURL, setBaseURL] = useState(localStorage.getItem('baseURL') || '');

  return (
    <Router>
      <baseURLContext.Provider value={baseURL}>
        <Routes>
          <Route path="/" element={<HomePage setBaseURL={setBaseURL} />} />
          <Route path="/analysis" element={<StockAnalysis />} />
        </Routes>
      </baseURLContext.Provider>
    </Router>
  );
}

export default App;