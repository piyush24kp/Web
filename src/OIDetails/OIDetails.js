import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button } from '@mui/material'; // Import Material-UI Button

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';

import 'ag-grid-community/styles/ag-theme-alpine.css';
import baseURLContext from '../baseURLContext';
import './OIDetails.css';
import StockModal from '../modal/StockModal';
import SentimentBar from '.././utility/SentimentBar';

// Register the required modules
ModuleRegistry.registerModules([ClientSideRowModelModule, AllCommunityModule]);


const OIDetails = ({ refreshInterval }) => {
  const baseURL = useContext(baseURLContext);
  const [bearishOIData, setBearishOIData] = useState([]);
  const [bullishOIData, setBullishOIData] = useState([]);
  const [mlBullishData, setMLBullishData] = useState([]);
  const [mlBearishData, setMLBearishData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stockOIFrequency, setStockOIFrequency] = useState(60);
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [showActiveBullish, setShowActiveBullish] = useState(true);
  const [showActiveBearish, setShowActiveBearish] = useState(true);
  const [showActiveMLBullish, setShowActiveMLBullish] = useState(true);
  const [showActiveMLBearish, setShowActiveMLBearish] = useState(true);

  const toggleActiveBullish = () => setShowActiveBullish(!showActiveBullish);
  const toggleActiveBearish = () => setShowActiveBearish(!showActiveBearish);
  const toggleActiveMLBullish = () => setShowActiveMLBullish(!showActiveMLBullish);
  const toggleActiveMLBearish = () => setShowActiveMLBearish(!showActiveMLBearish);

  const filterActiveData = (data, showActive) => {
    return showActive ? data.filter(item => item.active) : data;
  };

  const cleanData = (data) => {
    return Object.keys(data).map((key) => {
      const lastRecord = data[key].timeAndPrice[data[key].timeAndPrice.length - 1];
      return {
        stock: key,
        count: data[key].count,
        active: data[key].active,
        ltp: lastRecord.ltp,
        time: lastRecord.time,
        CE_ShortBuildup: lastRecord.CE_ShortBuildup.toFixed(2),
        CE_LongBuildup: lastRecord.CE_LongBuildup.toFixed(2),
        PE_LongBuildUp: lastRecord.PE_LongBuildUp.toFixed(2),
        PE_LongUnwinding: lastRecord.PE_LongUnwinding.toFixed(2),
        PE_ShortBuildUp: lastRecord.PE_ShortBuildUp.toFixed(2),
        CE_ShortCovering: lastRecord.CE_ShortCovering.toFixed(2),
        PE_ShortCovering: lastRecord.PE_ShortCovering.toFixed(2),
        CE_LongUnwinding: lastRecord.CE_LongUnwinding.toFixed(2)
      };
    });
  };

  const cleanData2 = (data) => {
    return Object.keys(data).map((key) => {
      const lastRecord = data[key].times[data[key].times.length - 1];
      return {
        stock: key,
        count: data[key].counter,
        active: data[key].active,
        added_time: lastRecord.added_time,
        removed_time: lastRecord.removed_time
      };
    });
  };

  const openModal = (stockName) => {
    console.log('Selected stock:', stockName); 
    setSelectedStock(stockName);
    setModalShow(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setModalShow(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [bearishResponse, bullishResponse, mlBullishResponse, mlBearishResponse] = await Promise.all([
          fetch(`${baseURL}:8080/api/v1/getBearishOIData`),
          fetch(`${baseURL}:8080/api/v1/getBullishOIData`),
          fetch(`${baseURL}:8092/bullish`),
          fetch(`${baseURL}:8092/bearish`)
        ]);

        const bearishData = await bearishResponse.json();
        const bullishData = await bullishResponse.json();
        const mlBullishData = await mlBullishResponse.json();
        const mlBearishData = await mlBearishResponse.json();

        setBearishOIData(cleanData(bearishData));
        setBullishOIData(cleanData(bullishData));
        setMLBullishData(cleanData2(mlBullishData));
        setMLBearishData(cleanData2(mlBearishData));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
    const intervalId = setInterval(fetchData, stockOIFrequency * 1000);
    return () => clearInterval(intervalId);
  }, [refreshInterval, baseURL]);

  const columnDefs = useMemo(() => [
    { headerName: 'Stock Name', field: 'stock' },
    { headerName: 'Active', field: 'active' },
    { headerName: 'Count', field: 'count' },
    { headerName: 'LTP', field: 'ltp' },
    { headerName: 'Time', field: 'time' },
    { headerName: 'CE_LB', field: 'CE_LongBuildup' },
    { headerName: 'CE_SB', field: 'CE_ShortBuildup' },
    { headerName: 'CE_SC', field: 'CE_ShortCovering' },
    { headerName: 'CE_LU', field: 'CE_LongUnwinding' },
    { headerName: 'PE_LB', field: 'PE_LongBuildUp' },
    { headerName: 'PE_SB', field: 'PE_ShortBuildUp' },
    { headerName: 'PE_SC', field: 'PE_ShortCovering' },
    { headerName: 'PE_LU', field: 'PE_LongUnwinding' }
  ], []);

  const mlColumnDefs = useMemo(() => [
    { headerName: 'Stock Name', field: 'stock' },
    { headerName: 'Active', field: 'active' },
    { headerName: 'Count', field: 'count' },
    { headerName: 'Added Time', field: 'added_time' },
    { headerName: 'Removed Time', field: 'removed_time' }
  ], []);

  if (isLoading) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <h1>Sentiment</h1>
      <SentimentBar sentiment={100} />
      <h1>Bullish Data</h1>
      <Button variant="contained" onClick={toggleActiveBullish}>
        {showActiveBullish ? 'Show All' : 'Show Active'}
      </Button>
      <div className='ag-theme-alpine'>
        <AgGridReact rowData={filterActiveData(bullishOIData, showActiveBullish)} onRowClicked={(event) => openModal(event.data.stock)} columnDefs={columnDefs} pagination={true} paginationPageSize={10} defaultColDef={{ flex: 1, resizable: true }} className="ag-theme-alpine" domLayout="autoHeight"/>
      </div>
      <h2>Trained OI Data</h2>
      <Button variant="contained" onClick={toggleActiveMLBullish}>
        {showActiveMLBullish ? 'Show All' : 'Show Active'}
      </Button>
      <div className='ag-theme-alpine'>
        <AgGridReact rowData={filterActiveData(mlBullishData, showActiveMLBullish)} onRowClicked={(event) => openModal(event.data.stock)} columnDefs={mlColumnDefs} pagination={true} paginationPageSize={10} defaultColDef={{ flex: 1, resizable: true }} className="ag-theme-alpine" domLayout="autoHeight"/>
      </div>
      <h1>Bearish Data</h1>
      <Button variant="contained" onClick={toggleActiveBearish}>
        {showActiveBearish ? 'Show All' : 'Show Active'}
      </Button>
      <div className='ag-theme-alpine'>
        <AgGridReact rowData={filterActiveData(bearishOIData, showActiveBearish)} onRowClicked={(event) => openModal(event.data.stock)} columnDefs={columnDefs} pagination={true} paginationPageSize={10} defaultColDef={{ flex: 1, resizable: true }} className="ag-theme-alpine" domLayout="autoHeight"/>
      </div>
      <h2>Trained OI Data</h2>
      <Button variant="contained" onClick={toggleActiveMLBearish}>
        {showActiveMLBearish ? 'Show All' : 'Show Active'}
      </Button>
      <div className='ag-theme-alpine'>
        <AgGridReact rowData={filterActiveData(mlBearishData, showActiveMLBearish)} onRowClicked={(event) => openModal(event.data.stock)} columnDefs={mlColumnDefs} pagination={true} defaultColDef={{ flex: 1, resizable: true }} className="ag-theme-alpine" domLayout="autoHeight"/>
      </div>
      <StockModal show={modalShow} handleClose={closeModal} stockName={selectedStock} />
      <Button variant="contained" onClick={closeModal}>Close</Button>
      <style jsx>{`
        .modal {
          position: fixed;
          top: 15%;
          left: 15%;
          width: 70%;
          height: 70%;
          background: white;
          z-index: 1000;
          overflow: auto;
          box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
        }
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, .5);
          z-index: 999;
        }
      `}</style>
    </div>
  );
};

export default OIDetails;
