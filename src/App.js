// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import baseURLContext from './baseURLContext';
import IndexAnalysis from './IndexAnalysis';
import StockAnalysis from './StockAnalysis';
import OIDetails from './OIDetails/OIDetails';
import OptionBuildupAnalysis from './OptionBuildupAnalysis';
import OptionGreekAnalysis from './OptionGreekAnalysis';
import './App.css';

function HomePage({ setBaseURL }) {
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  console.log(secretKey);
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
      navigate('/OIDetails');
    } else {
      setBaseURL('http://localhost:8080');
      localStorage.setItem('baseURL', 'http://localhost:8080');
      navigate('/OIDetails');
    }
  };

  const handleSubmitForIndex = () => {
    if (inputValue.trim() !== '') {
      let finalURL = inputValue;
      if (!inputValue.startsWith('http://') && !inputValue.startsWith('https://')) {
        finalURL = `http://${inputValue}`;
      }
      setBaseURL(finalURL);
      localStorage.setItem('baseURL', finalURL);
      navigate('/index-analysis');
    } else {
      setBaseURL('http://localhost:8080');
      localStorage.setItem('baseURL', 'http://localhost:8080');
      navigate('/index-analysis');
    }
  };

  const handleSubmitForOptionAnalysis = () => {
    if (inputValue.trim() !== '') {
      let finalURL = inputValue;
      if (!inputValue.startsWith('http://') && !inputValue.startsWith('https://')) {
        finalURL = `http://${inputValue}`;
      }
      setBaseURL(finalURL);
      localStorage.setItem('baseURL', finalURL);
      navigate('/option-greek-analysis');
    } else {
      setBaseURL('http://localhost:8080');
      localStorage.setItem('baseURL', 'http://localhost:8080');
      navigate('/option-greek-analysis');
    }
  };
  

  return (
    <div className="App">
      <header className="App-header">
        <div className="input-container">
          <p>Please enter the base URL for API calls:</p>
          <input type="text" value={inputValue} onChange={handleInputChange} className="input-field" />
          <button onClick={handleSubmit} className="submit-button">Submit</button>
          {/* <button onClick={handleSubmitForOptionAnalysis} className="submit-button">Submit to Greek Analysis</button> */}
          {/* <button onClick={() => navigate('/option-buildup-analysis')} className="redirect-button">Go to Option Buildup Analysis</button> New button */}
          {/* <button onClick={(handleSubmitForIndex)} className="redirect-button">Go to Index Analysis</button>  */}
        </div>
        
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
          <Route path="/option-buildup-analysis" element={<OptionBuildupAnalysis />} /> 
          <Route path="/option-greek-analysis" element={<OptionGreekAnalysis />} />
          <Route path="/index-analysis" element={<IndexAnalysis />} />
          <Route path="/OIDetails" element={<OIDetails />} />
        </Routes>
      </baseURLContext.Provider>
    </Router> 
  );
}

export default App;