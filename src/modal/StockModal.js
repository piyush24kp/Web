import React, { useContext, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Button } from '@mui/material'; // Import Material-UI Button
import './StockModal.css';
import baseURLContext from '../baseURLContext';

const StockModal = ({ show, handleClose, stockName }) => {
  const [data, setData] = useState(null);
  const baseURL = useContext(baseURLContext);

  useEffect(() => {
    if (show) {
      fetch(`${baseURL}:8080/api/v1/getOIBuildUp?token=${stockName}`)
        .then(response => response.json())
        .then(data => {
          const stockData = data[stockName];
          if (Array.isArray(stockData)) {
            const parsedData = stockData.map(item => {
              const ceValues = item.CE.split(',').map(parseFloat);
              const peValues = item.PE.split(',').map(parseFloat);
              const time = new Date(`1970-01-01T${item.time}Z`);
              time.setHours(time.getHours() - 5, time.getMinutes() - 30); // Adjust to 09:15 AM
              const formattedTime = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
              return {
                time: formattedTime,
                CE_SB: ceValues[0],
                CE_LB: ceValues[1],
                CE_SC: ceValues[2],
                CE_LU: ceValues[3],
                PE_SB: peValues[0],
                PE_LB: peValues[1],
                PE_SC: peValues[2],
                PE_LU: peValues[3],
              };
            });
            setData(parsedData);
          } else {
            console.error('Unexpected data format:', data);
          }
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [show, stockName]);

  const parseChartData = (data, keys) => {
    const colors = [
      'rgba(255, 99, 132, 1)', // Red
      'rgba(54, 162, 235, 1)', // Blue
      'rgba(255, 206, 86, 1)', // Yellow
      'rgba(75, 192, 192, 1)', // Green
      'rgba(153, 102, 255, 1)', // Purple
      'rgba(255, 159, 64, 1)', // Orange
      'rgba(199, 199, 199, 1)', // Grey
      'rgba(83, 102, 255, 1)'  // Indigo
    ];
    return {
      labels: data.map(item => item.time),
      datasets: keys.map((key, index) => ({
        label: key,
        data: data.map(item => item[key]),
        fill: false,
        borderColor: colors[index % colors.length],
      })),
    };
  };

  return (
    <div style={{height: '100%', padding: '50px 50px 50px 50px', overflow: 'auto'}}>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title className="modal-title-center">{stockName}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '30px' }}>
          {data ? (
            <>
              <Line data={parseChartData(data, ['CE_SB', 'CE_LB', 'CE_SC', 'CE_LU'])} />
              <Line data={parseChartData(data, ['PE_SB', 'PE_LB', 'PE_SC', 'PE_LU'])} />
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="contained" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StockModal;