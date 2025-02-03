import React, { useContext, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

import { Chart as ChartJS,LinearScale, PointElement,TimeScale,LineElement,Title, Tooltip,Legend } from 'chart.js';
import 'chartjs-adapter-moment';
import baseURLContext from "./baseURLContext";


const verticalLinePlugin = {
  id: 'verticalLinePlugin',
  afterDraw: (chart, args, options) => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const activePoint = chart.tooltip._active[0].element;
      const ctx = chart.ctx;
      const x = activePoint.x;
      const topY = chart.scales['y'].top;
      const bottomY = chart.scales['y'].bottom;

      // draw line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.lineColor;
      ctx.stroke();
      ctx.restore();
    }
  }
};

ChartJS.register(TimeScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend, zoomPlugin, verticalLinePlugin);

const OptionGreekAnalysis = () => {
  const baseURL = useContext(baseURLContext);
  const [data, setData] = useState(null);
  const [option, setOption] = useState('Nifty 50');

  const fetchData = () => {
    fetch(`${baseURL}/api/v1/index/getChartData?symbol=${option}`) // use api/v1/local/getChartData2?symbol for dummy data
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error:", error));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData();
  };

  const chartData = (labelCE, labelPE, dataKeyCE, dataKeyPE, colorCE, colorPE) => ({
    
    labels: data?.map((item) => item.time), // assuming each data item has a 'date' property
    datasets: [
      {
        label: labelCE,
        data: data?.map((item) => item[dataKeyCE]), // dynamically access the data key for CE
        fill: false,
        backgroundColor: colorCE,
        borderColor: colorCE,

      },
      {
        label: labelPE,
        data: data?.map((item) => item[dataKeyPE]), // dynamically access the data key for PE
        fill: false,
        backgroundColor: colorPE,
        borderColor: colorPE,
      },
    ],
  });
  function createChartOptions(title, data) {
    const values = data.flatMap(dataset => dataset.data);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      responsive: true,
  
      plugins: {
        title: {
          display: true,
          text: title
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'xy',
            speed: 100
          },
          zoom: {
            wheel: {
              enabled: true // SET SCROOL ZOOM TO TRUE
            },
            mode: "xy",
            speed: 100
          }
          
        },
        verticalLinePlugin: {
          lineWidth: 1,
          lineColor: '#FF0000'
        },
        tooltip : {
          mode: 'index',
          intersect: true
        }
        
      },
      scales: {
        x: {
          type: 'time',
          time: {
            parser: 'HH:mm:ss:SSS',
            unit: 'minute'
          }
        },
        y: {
          type: 'linear',
          min: min,
          max: max
        }
      }
    };
  }

  return (
    <div>
      <h1>Option Greek Analysis</h1>
      <form onSubmit={handleSubmit}>
        <select value={option} onChange={(e) => setOption(e.target.value)}>
          <option value="Nifty 50">Nifty 50</option>
          <option value="Nifty Bank">Nifty Bank</option>
        </select>
        <button type="submit">Submit</button>
      </form>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {data && <div><Line data={chartData('Delta CE', 'Delta PE', 'CE delta', 'PE delta', 'rgb(75, 192, 192)', 'rgb(192, 75, 75)')} options={createChartOptions('Delta', data)} /></div>}
        {data && <div><Line data={chartData('Vega CE', 'Vega PE', 'CE vega', 'PE vega', 'rgb(255, 99, 132)', 'rgb(132, 99, 255)')} options={createChartOptions('Vega', data)} /></div>}
        {data && <div><Line data={chartData('Theta CE', 'Theta PE', 'CE theta', 'PE theta', 'rgb(54, 162, 235)', 'rgb(235, 162, 54)')} options={createChartOptions('Theta', data)} /></div>}
        {data && <div><Line data={chartData('Gamma CE', 'Gamma PE', 'CE gamma', 'PE gamma', 'rgb(255, 206, 86)', 'rgb(86, 206, 255)')} options={createChartOptions('Gamma', data)} /></div>}
      </div>
    </div>
  );
};

export default OptionGreekAnalysis;