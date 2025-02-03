import React, { useContext, useEffect, useState, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  TimeScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement,
} from "chart.js";
import "chartjs-adapter-moment";
import baseURLContext from "./baseURLContext";

const verticalLinePlugin = {
  id: "verticalLinePlugin",
  afterDraw: (chart, args, options) => {
    // Check if tooltip and _active are defined
    if (
      chart.tooltip &&
      chart.tooltip._active &&
      chart.tooltip._active.length
    ) {
      const activePoint = chart.tooltip._active[0].element;
      const ctx = chart.ctx;
      const x = activePoint.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = options.lineWidth || 1;
      ctx.strokeStyle = options.lineColor || "#ff0000";
      ctx.stroke();
      ctx.restore();
    }
  },
};

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  verticalLinePlugin,
  CategoryScale
);

const IndexAnalysis = () => {
  const baseURL = useContext(baseURLContext);
  const [data, setData] = useState(null);
  const [option, setOption] = useState("Index");
  const [chartType, setChartType] = useState("line");
  const chartRef = useRef(null);
  const [timeInterval, setTimeInterval] = useState("All");
  const [marketTrend, setMarketTrend] = useState("None");

  useEffect(() => {
    fetchData();
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [option]);

  const fetchData = async () => {
    let endpoint =
      option === "Index"
        ? "/api/v1/getIndexInfo?chartData=true"
        : "/api/v1/getSectorInfo?chartData=true";

    // Append marketTrend parameter
    if (marketTrend === "Bullish") {
      endpoint += "&bullish=true";
    } else if (marketTrend === "Bearish") {
      endpoint += "&bullish=false";
    }
    // No need to append anything for "None"

    // Append timeInterval parameter if not "All"
    if (timeInterval !== "All") {
      endpoint += `&last=${timeInterval}`;
    }

    try {
      const response = await fetch(`${baseURL}${endpoint}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData();
  };

  function generateRandomColor() {
    // Generate three random numbers between 0 and 255
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    // Convert numbers to a hexadecimal string and concatenate
    const color = `#${red.toString(16).padStart(2, "0")}${green
      .toString(16)
      .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

    return color;
  }

  function createChartOptions() {
    const title = option === "Index" ? "Index Analysis" : "Sector Analysis";
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
        },
        zoom: {
          pan: {
            enabled: true,
            mode: "xy",
            speed: 100,
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            mode: "xy",
            speed: 100,
          },
        },
        verticalLinePlugin: {
          lineWidth: 1,
          lineColor: "#FF0000",
        },
        tooltip: {
          mode: "index",
          intersect: true,
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            parser: "HH:mm:ss:SSS",
            unit: "minute",
          },
        },
        y: {
          type: "linear",
          min: -10,
          max: 10,
        },
      },
    };
  }

  const chartData = () => {
    if (!data || !data.length) return { labels: [], datasets: [] };

    // Assuming 'data' is an array of objects, each representing a point in time with multiple sectors
    // First, extract unique sectors from the first item as an example (adjust logic as needed)
    const sectors = Object.keys(data[0]).filter((key) => key !== "time");

    const datasets = sectors.map((sector) => {
      return {
        label: sector,
        data: data
          .filter((item) => Object.keys(item).length > 1) // Step 1: Filter items with more than 1 key
          .sort((a, b) => new Date(a.time) - new Date(b.time)) // Step 2: Sort by 'time'
          .map((item) => item[sector]), // Original mapping logic, // Ensure this correctly maps to your data structure
        fill: false,
        borderColor: generateRandomColor(),
      };
    });

    // Assuming 'time' is a property in each data object representing the x-axis label
    const labels = data
      .filter((item) => Object.keys(item).length > 1) // Step 1: Filter items with more than 1 key
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .map((item) => item.time);

    return { labels, datasets };
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const barData = () => {
    if (!data || !data.length) return { labels: [], datasets: [] };

    const timeLabels = data
      .filter((item) => Object.keys(item).length > 1) // Step 1: Filter items with more than 1 key
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .map((item) => {
        const timeParts = item.time.split(":");
        const hours = timeParts[0].padStart(2, "0");
        const minutes = timeParts[1].padStart(2, "0");
        return `${hours}:${minutes}`;
      });

    const labels = Object.keys(data[0]).filter((key) => key !== "time");

    // Create datasets for each label
    const datasets = labels.map((label) => ({
      label,
      backgroundColor: getRandomColor(),
      borderColor: getRandomColor(),
      borderWidth: 1,
      hoverBackgroundColor: getRandomColor(),
      hoverBorderColor: getRandomColor(),
      data: data.map((item) => item[label]),
    }));
    // const datasets = [
    //   {
    //     label: 'Dataset 1',
    //     backgroundColor: 'rgba(75,192,192,0.4)',
    //     borderColor: 'rgba(75,192,192,1)',
    //     borderWidth: 1,
    //     hoverBackgroundColor: 'rgba(75,192,192,0.6)',
    //     hoverBorderColor: 'rgba(75,192,192,1)',
    //     data: [65, 59, 80, 81, 56, 55, 40],
    //   },
    //   {
    //     label: 'Dataset 2',
    //     backgroundColor: 'rgba(153,102,255,0.4)',
    //     borderColor: 'rgba(153,102,255,1)',
    //     borderWidth: 1,
    //     hoverBackgroundColor: 'rgba(153,102,255,0.6)',
    //     hoverBorderColor: 'rgba(153,102,255,1)',
    //     data: [45, 69, 60, 91, 46, 75, 50],
    //   }

    // ];
    return { labels: timeLabels, datasets };
  };

  const dummyOptions = {
    maintainAspectRatio: true,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="app-container">
      <div className="form-section">
        <h1>Index/Sector Analysis</h1>
        <form onSubmit={handleSubmit}>
          <select value={option} onChange={(e) => setOption(e.target.value)}>
            <option value="Index">Index</option>
            <option value="Sector">Sector</option>
          </select>

          <select
            value={marketTrend}
            onChange={(e) => setMarketTrend(e.target.value)}
          >
            <option value="None">None</option>
            <option value="Bullish">Bullish</option>
            <option value="Bearish">Bearish</option>
          </select>

          <select
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
          >
            <option value="All">All</option>
            <option value="1">15 minutes</option>
            <option value="2">30 minutes</option>
            <option value="3">45 minutes</option>
            <option value="4">60 minutes</option>
            <option value="5">120 minutes</option>
          </select>

          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>

          <button type="submit">Submit</button>
        </form>
      </div>

      {data && (
        <div>
          {chartType === "line" ? (
            <Line data={chartData()} options={createChartOptions} />
          ) : (
            <Bar data={barData()} options={dummyOptions} />
          )}
        </div>
      )}
    </div>
  );
};

export default IndexAnalysis;
