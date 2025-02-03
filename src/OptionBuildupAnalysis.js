// src/OptionBuildupAnalysis.js
import React, { useEffect, useState } from "react";
import "./OptionBuildupAnalysis.css";

function OptionBuildupAnalysis() {
  const [data, setData] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [optionData, setOptionData] = useState(null);
  const [symbols, setSymbols] = useState({});
  const [times, setTimes] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/options/getOptionChainData?local=true")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const handleSelect = (event) => {
    setSelectedKey(event.target.value);
    setSelectedData(data[event.target.value]);
  };

  // useEffect(() => {
  //   fetch("http://localhost:8080/api/v1/local/getOptionsSymbols")
  //     .then((response) => response.json())
  //     .then((data) => setSymbols(data));
  // }, []);

  const handleSymbolSelect = (event) => {
    setSelectedSymbol(event.target.value);
    setTimes(symbols[event.target.value]);
  };

  const handleTimeSelect = (event) => {
    setSelectedTime(event.target.value);
  };

  const handleSubmit = () => {
    fetch(
      `http://localhost:8080/api/v1/local/getOptionDataBySymbol?symbol=${selectedSymbol}&time=${selectedTime}`
    )
      .then((response) => response.json())
      .then((data) => setOptionData(data));
  };

  function getClassName(value) {
    switch (value) {
      case "Call Buying":
      case "Put Buying":
      case "Long Buildup":
        return "dark-green";
      case "Call Writing":
      case "Put Writing":
      case "Short Buildup":
        return "dark-red";
      case "Call Short Covering":
      case "Put Short Covering":
      case "Short Covering":
        return "light-green";
      case "Call Long Covering":
      case "Put Long Covering":
      case "Long Unwinding":
        return "orange";
      default:
        return "grey";
    }
  }

  return (
    <div className="container">
      <h1 className="title">Option Buildup Analysis</h1>
      <select className="select" onChange={handleSelect}>
        <option>Select a key</option>
        {Object.keys(data).map((key, index) => (
          <option key={index} value={key}>
            {key}
          </option>
        ))}
      </select>
      <div className="table-container">
        {selectedData && (
          <table className="styled-table">
            <thead>
              <tr className="table-row">
                <th></th>
                {selectedData.map((optionData, index) => (
                  <th>{optionData.strike_price}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td className="table-cell">Put</td>
                {selectedData.map((optionData, index) => (
                  //   <td className="table-cell">{optionData.puts_builtup}</td>
                  <td
                    className={`table-cell  color-cell ${getClassName(
                      optionData.puts_builtup
                    )}`}
                  ></td>
                ))}
              </tr>
              <tr className="table-row">
                <td className="table-cell">Call</td>
                {selectedData.map((optionData, index) => (
                  //   <td className="table-cell">{optionData.calls_builtup}</td>
                  <td
                    className={`table-cell color-cell ${getClassName(
                      optionData.calls_builtup
                    )}`}
                  ></td>
                ))}
              </tr>
              <tr className="table-row">
                <td className="table-cell">PCR</td>
                {selectedData.map((optionData, index) => (
                  //   <td className="table-cell">{optionData.calls_builtup}</td>
                  <td>
                    {(optionData.puts_oi / optionData.calls_oi).toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div>
        <select onChange={handleSymbolSelect}>
          {Object.keys(symbols).map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
        <select onChange={handleTimeSelect}>
          {times.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <div className="table-container">
        {optionData && (
          <table className="styled-table">
            <thead>
              <tr className="table-row">
                <th></th>
                {optionData.map((option, index) => (
                  <th>{option.strike_price}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td className="table-cell">Put</td>
                {optionData.map((option, index) => (
                    <td className={`table-cell  color-cell ${getClassName(option.put_buildUp)}`}></td>
                ))}
              </tr>
              <tr className="table-row">
                <td className="table-cell">Call</td>
                {optionData.map((option, index) => (
                    <td className={`table-cell color-cell ${getClassName(option.call_buildUp)}`}></td>
                ))}
              </tr>
              <tr className="table-row">
                <td className="table-cell">PCR</td>
                {optionData.map((option, index) => (
                    <td>{(option.putOpenInterest / option.callOpenInterest).toFixed(2)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OptionBuildupAnalysis;
