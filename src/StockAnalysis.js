// StockAnalysis.js
import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import baseURLContext from "./baseURLContext";
import "./StockAnalysis.css";

const StockAnalysis = () => {
  const baseURL = useContext(baseURLContext);

  const [data, setData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes
  const [inputValue, setInputValue] = useState();
  const [oiInputtValue, setOIInputValue] = useState();
  const [showInfo, setShowInfo] = useState(false);
  const [stockOIFrequency, setstockOIFrequency] = useState(300); // Default frequency is 5000ms (5 seconds)
  const [stockOI, setStockOI] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${baseURL}/api/v1/options/optionGreekDiff?smartAPI=true`) // use optionGreekDiff for live values
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error:", error));
    };

    fetchData();
    
    const oiStockData = () => {
      fetch(`${baseURL}/api/v1/options/OIBullishStocks`) // use getStockOptionGreekData for live values
        .then((response) => response.json())
        .then((data) => setStockOI(data))
        .catch((error) => console.error("Error:", error));
    };

    oiStockData();

    const intervalId2 = setInterval(oiStockData, stockOIFrequency * 1000);
    const intervalId = setInterval(fetchData, refreshInterval * 1000); // fetch data every refreshInterval seconds
     // fetch data every refreshInterval seconds

    return () => clearInterval(intervalId,intervalId2); // clean up on component unmount
  }, [baseURL, refreshInterval, stockOIFrequency]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleOIInputChange = (e) => {
    setOIInputValue(e.target.value);
  };

  const handleSubmit = () => {
    if (inputValue >= 10) {
      setRefreshInterval(inputValue);
    }
  };

  const handleOISubmit = () => {
    if (oiInputtValue >= 60) {
      setstockOIFrequency(oiInputtValue);
    }
  };
  const handleInfoClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div
      className="stock-analysis"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1>Stock Market Analysis</h1>
      <h4>Config URL : {baseURL}</h4>
      <p>
        {" "}
        Refresh interval :{" "}
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Refresh Interval in seconds (10 Sec)"
        />
      </p>
      <button onClick={handleSubmit}>Submit</button>

      <h3>Note : Watch both sides to get direction confirmation </h3>
      <div>
        <button onClick={handleInfoClick}>
          {showInfo ? "Hide" : "Show Information"}
        </button>
        <Modal
          isOpen={showInfo}
          onRequestClose={handleInfoClick}
          contentLabel="Option Greeks Information"
        >
          <button onClick={handleInfoClick} style={{ float: "right" }}>
            X
          </button>
          <h2>Option Greeks Analysis</h2>
          <>
            <h2>Option Greeks Analysis</h2>
            <p>
              <strong>Delta:</strong> Positive delta changes in call options
              suggest Bullish sentiment, while negative changes indicate Bearish
              sentiment. Positive delta changes in put options suggest Bearish
              sentiment, while negative changes indicate Bullish sentiment. If
              deltas for both call and put options are increasing, it may
              indicate increasing volatility or uncertainty.
            </p>
            <p>
              <strong>Gamma:</strong> Increasing gamma values suggest higher
              sensitivity to price movements, indicating potentially volatile
              market conditions. Positive gamma changes in call options suggest
              increasing Bullish sentiment, while negative changes may indicate
              decreasing Bullish sentiment. Positive gamma changes in put
              options suggest increasing Bearish sentiment, while negative
              changes may indicate decreasing Bearish sentiment.
            </p>
            <p>
              <strong>Theta:</strong> Increasing theta values suggest
              accelerating time decay, indicating shorter-term options are
              losing value more rapidly. Positive theta changes in call options
              suggest increasing Bullish sentiment, while negative changes may
              indicate decreasing Bullish sentiment. Positive theta changes in
              put options suggest increasing Bearish sentiment, while negative
              changes may indicate decreasing Bearish sentiment.
            </p>
            <p>
              <strong>Vega:</strong> Increasing vega values suggest higher
              sensitivity to volatility changes, indicating potentially volatile
              market conditions. Positive vega changes in call options suggest
              increasing Bullish sentiment, while negative changes may indicate
              decreasing Bullish sentiment. Positive vega changes in put options
              suggest increasing Bearish sentiment, while negative changes may
              indicate decreasing Bearish sentiment.
            </p>
            <p>
              <strong>Rho:</strong> Increasing rho values suggest higher
              sensitivity to changes in interest rates, which may not be as
              relevant for short-term trading but can be crucial for longer-term
              strategies. Positive rho changes may indicate increasing Bullish
              sentiment for call options and increasing Bearish sentiment for
              put options, while negative changes may indicate the opposite.
            </p>
            <p>
              By analyzing the changes in these Greeks, you can gauge market
              sentiment and make informed decisions about whether to buy or sell
              options and in which direction.
            </p>
          </>
        </Modal>
      </div>

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
            let deltaColor = "";
            let vegaColor = "";
            let thetaColor = "";

            if (item.optionType === "PE") {
              vegaColor = item.vega > 5 ? "#8ec984" : item.vega < -5 ? "#ff6f6f" : "";
              item.sentiment =  item.vega > 5 ? "Bullish" : item.vega < -5 ? "Bearish" : "Neutral";
              deltaColor = item.delta > 0 ? '#8ec984' : '#ff6f6f';
            } else if (item.optionType === "CE") {
              vegaColor = item.vega > 5 ? "#ff6f6f" : item.vega < -5 ? "#8ec984" : "";
              item.sentiment = item.vega > 5 ? "Bearish" : item.vega < -5 ? "Bullish" : "Neutral";
              deltaColor = item.delta > 0 ? '#ff6f6f' : '#8ec984';
            }

            return (
              <tr key={index}>
                <td>{item.index}</td>
                <td>{item.optionType}</td>
                <td>{item.sentiment}</td>
                <td style={{ backgroundColor: vegaColor }}>{item.vega} {item.vega > 0 ? 'DECAY': ''}</td>
                <td style={{ backgroundColor: thetaColor }}>{item.theta}</td>
                <td style={{ backgroundColor: deltaColor }}>{item.delta}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div>
        <h2>Stock OI Updates</h2>
        <label>
          Set Frequency (ms):
          <input
            type="number"
            onChange={handleOIInputChange}
          />
          <button onClick={handleOISubmit}>Submit</button>
        </label>
        <table className="styled-table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>Call Buying</th>
            <th>Put Writing</th>
            <th>Total Call Buying</th>
            <th>Total Put Writing</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stockOI).map(([stock, values]) => (
            <tr key={stock}>
              <td>{stock}</td>
              <td>{values["Call Short Covering"]}</td>
              <td>{values["Put Long Covering"]}</td>
              <td></td>
              <td></td>
              <td></td>
              {/* <td>{values["Call Buying"]}</td>
              <td>{values["Put Writing"]}</td>
              <td>{values["Total Call Buying"]}</td>
              <td>{values["Total Put Writing"]}</td>
              <td>{values["Total"]}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default StockAnalysis;
