// StockAnalysis.js
import React, { useContext, useEffect, useState } from 'react';
import baseURLContext from './baseURLContext';
import './StockAnalysis.css';

const StockAnalysis = () => {
  const baseURL = useContext(baseURLContext);
  
  const [data, setData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes

  useEffect(() => {
    const fetchData = () => {
      fetch(`${baseURL}/api/v1/options/optionGreekDiff`)
        .then(response => response.json())
        .then(data => setData(data))
        .catch(error => console.error('Error:', error));
    };

    fetchData(); // fetch data immediately

    const intervalId = setInterval(fetchData, refreshInterval * 1000); // fetch data every refreshInterval seconds

    return () => clearInterval(intervalId); // clean up on component unmount
  }, [baseURL, refreshInterval]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="stock-analysis" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Stock Market Analysis</h1>
      <h4>Config URL : {baseURL}</h4>
      <p> Refresh interval : <input type="number" value={refreshInterval} 
      onChange={(e) => {
        const value = e.target.value;
        if (value >= 10) {
          setRefreshInterval(value);
        }
      }} placeholder="Refresh Interval in seconds (Min 10)" /></p>
      <h3>Note : Watch both sides to get direction confirmation </h3>
      <table className="styled-table">
        <thead>
          <tr>
            <th>INDEX</th>
            <th>TYPE</th>
            <th>Sentiment</th>
            <th>Vega (IV change)</th>
            <th>Theta (Time decay)</th>
            <th>Delta (Spot direction)</th>
          </tr>
        </thead>
        <tbody>
        {data.map((item, index) => {
          let deltaColor = '';
          let vegaColor = '';
          let thetaColor = '';

          if (item.optionType === 'CE') {
            vegaColor = item.vega < -5 ? 'red' : '';
            item.sentiment = item.vega < -5 ? 'Bearish' : 'Neutral';
            deltaColor = item.delta >= 0 ? 'green' : 'red';
          } else if (item.optionType === 'PE') {
            vegaColor = item.vega < -5 ? 'green' : '';
            item.sentiment = item.vega < -5 ? 'Bullish' : 'Neutral';
            deltaColor = item.delta >= 0 ? 'green' : 'red';
          }
          
          

          return (
            <tr key={index}>
              <td>{item.index}</td>
              <td>{item.optionType}</td>
              <td>{item.sentiment}</td>
              <td style={{ backgroundColor: vegaColor }}>{item.vega}</td>
              <td style={{ backgroundColor: thetaColor }}>{item.theta}</td>
              <td style={{ backgroundColor: deltaColor }}>{item.delta}</td>
            </tr>
          );
        })}
        </tbody>
            </table>

            <div>
        <h2>Option Greeks Analysis</h2>
        <p>
          <strong>Delta:</strong> Positive delta changes in call options suggest bullish sentiment, while negative changes indicate bearish sentiment. Positive delta changes in put options suggest bearish sentiment, while negative changes indicate bullish sentiment. If deltas for both call and put options are increasing, it may indicate increasing volatility or uncertainty.
        </p>
        <p>
          <strong>Gamma:</strong> Increasing gamma values suggest higher sensitivity to price movements, indicating potentially volatile market conditions. Positive gamma changes in call options suggest increasing bullish sentiment, while negative changes may indicate decreasing bullish sentiment. Positive gamma changes in put options suggest increasing bearish sentiment, while negative changes may indicate decreasing bearish sentiment.
        </p>
        <p>
          <strong>Theta:</strong> Increasing theta values suggest accelerating time decay, indicating shorter-term options are losing value more rapidly. Positive theta changes in call options suggest increasing bullish sentiment, while negative changes may indicate decreasing bullish sentiment. Positive theta changes in put options suggest increasing bearish sentiment, while negative changes may indicate decreasing bearish sentiment.
        </p>
        <p>
          <strong>Vega:</strong> Increasing vega values suggest higher sensitivity to volatility changes, indicating potentially volatile market conditions. Positive vega changes in call options suggest increasing bullish sentiment, while negative changes may indicate decreasing bullish sentiment. Positive vega changes in put options suggest increasing bearish sentiment, while negative changes may indicate decreasing bearish sentiment.
        </p>
        <p>
          <strong>Rho:</strong> Increasing rho values suggest higher sensitivity to changes in interest rates, which may not be as relevant for short-term trading but can be crucial for longer-term strategies. Positive rho changes may indicate increasing bullish sentiment for call options and increasing bearish sentiment for put options, while negative changes may indicate the opposite.
        </p>
        <p>
          By analyzing the changes in these Greeks, you can gauge market sentiment and make informed decisions about whether to buy or sell options and in which direction.
        </p>
            </div>
          </div>
        );
};

export default StockAnalysis;