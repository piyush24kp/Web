// StockAnalysis.js
import React, { useContext, useEffect, useState } from 'react';
import baseURLContext from './baseURLContext';
import './StockAnalysis.css';

const StockAnalysis = () => {
  const baseURL = useContext(baseURLContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${baseURL}/api/v1/options/option-data-diff2`)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error:', error));
  }, [baseURL]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Stock Market Analysis</h1>
      <p>Config URL : {baseURL}</p>
      <table className="styled-table">
        <thead>
          <tr>
            <th>INDEX</th>
            <th>TYPE</th>
            <th>Delta</th>
            <th>Vega</th>
            <th>Theta</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.index}</td>
              <td>{item.optionType}</td>
              <td>{item.delta}</td>
              <td>{item.vega}</td>
              <td>{item.theta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockAnalysis;