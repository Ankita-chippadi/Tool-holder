import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist';
import FilterComponent from './FilterComponent';
import CursorValuesTable from './CursorValuesTable'; 


import 'tailwindcss/tailwind.css';

const LineGraph = ({ data, isOtherWindowOpen, importedFileName, selectedFiles: propSelectedFiles }) => {
  const chartRef = useRef(null);
  const [cursorValues, setCursorValues] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState({
    tension: true,
    torsion: true,
    bendingMomentY: true,
    temperature: true,
  });
  const [chartData, setChartData] = useState([]);
  const [windowSize, setWindowSize] = useState(5);
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const xValues = chartData.map((item) => item.x); // Assuming chartData is defined and contains your data
  
    // Define traces with zero data initially
    const traceTension = {
      type: 'scatter',
      mode: 'lines',
      name: 'Tension',
      x: xValues,
      y: Array(xValues.length).fill(0), // Initialize with zeros
      line: { color: '#000080' },
      yaxis: 'y',
      stroke: {
        width: 1, // Set your desired stroke width
      },
    };
    
    const traceTorsion = {
      type: 'scatter',
      mode: 'lines',
      name: 'Torsion',
      x: xValues,
      y: Array(xValues.length).fill(0), // Initialize with zeros
      line: { color: '#800080' },
      yaxis: 'y2',
      
      stroke: {
        width: 0.5, // Set your desired stroke width
      },
    };
    
    const traceBendingMomentY = {
      type: 'scatter',
      mode: 'lines',
      name: 'Bending Moment Y',
      x: xValues,
      y: Array(xValues.length).fill(0), // Initialize with zeros
      yaxis: 'y3',
      line: { color: '#ADD8E6' },
      stroke: {
        width: 0.5, // Set your desired stroke width
      },
    };
    
    const traceTemperature = {
      type: 'scatter',
      mode: 'lines',
      name: 'Temperature',
      x: xValues,
      y: Array(xValues.length).fill(0), // Initialize with zeros
      line: { color: '#ff0000' },
      yaxis: 'y4',
      range:[20,35],
      stroke: {
        width: 0.5, // Set your desired stroke width
      }, // Assign to the fourth y-axis
    };
    const layout = {
      height: 550,
      width: 1500,
      position: 'relative',
      left: '100px',
      xaxis: {
        type: 'linear',
        tickformat: '%H:%M:%S.%L',
      },
      yaxis: {
        title: 'Tension',
        titlefont: { color: '#1f77b4' },
        tickfont: { color: '#1f77b4' },
        range: [-187, 1050], // Set range for Tension
        tickAmount: 22,
      },
      yaxis2: {
        title: 'Torsion',
        titlefont: { color: '#ff7f0e' },
        tickfont: { color: '#ff7f0e' },
        anchor: 'free',
        side: 'left',
        position: 3.95,
        range: [0, 9], // Set range for Torsion
        tickAmount: 18,
      },
      yaxis3: {
        title: 'Bending Moment Y',
        titlefont: { color: '#d62728' },
        tickfont: { color: '#d62728' },
        anchor: 'x',
        position: 0.85,
        side: 'left',
        range: [0, 12.5], // Set range for Bending Moment Y
        tickAmount: 25,
      },
      yaxis4: {
        title: 'Temperature',
        titlefont: { color: '#9467bd' },
        tickfont: { color: '#9467bd' },
        anchor: 'free',
        overlaying: 'y',
        side: 'right',
        position: 0.85,
        range: [26.6, 31.4], // Set range for Temperature
        tickAmount: 15,
      },
      margin: { t: 10 },
    };
  
    const options = {
      scrollZoom: true,
    };
  
    Plotly.newPlot(chartRef.current, [traceTension, traceTorsion, traceBendingMomentY, traceTemperature], layout, options);
  
    const base = chartRef.current;
    base.on('plotly_hover', (eventData) => {
      if (eventData.points && eventData.points.length > 0) {
        const closestPoint = eventData.points[0];
        const cursorValue = {
          yAxis: closestPoint.y.toFixed(3),
          tension: closestPoint.data.tension[closestPoint.pointNumber].toFixed(3),
          torsion: closestPoint.data.torsion[closestPoint.pointNumber].toFixed(3),
          bendingMomentY: closestPoint.data.bendingMomentY[closestPoint.pointNumber].toFixed(3),
          temperature: closestPoint.data.temperature[closestPoint.pointNumber].toFixed(3),
          xAxis: closestPoint.x,
        };
  
        // Log cursor value to check if it's correctly set
        console.log('Cursor Value:', cursorValue);
  
        setCursorValues([cursorValue]);
      } else {
        // If no points, set an empty array
        setCursorValues([]);
      }
    });
  
    return () => {
      if (base) {
        base.removeAllListeners('plotly_hover');
      }
    };
  }, [chartData]); // Include chartData in the dependency array


  useEffect(() => {
    if (!chartRef.current || !data || typeof data !== 'string') {
      return;
    }

    const lines = data.split('\n');

    const newChartData = lines
      .filter((line) => !line.startsWith('#') && line.trim() !== '' && !isNaN(line.trim().split(';')[0]))
      .map((line, index) => {
        const values = line.split(';').map((value) => parseFloat(value.replace(',', '.')));

        if (values.length < 6 || values.some(isNaN)) {
          console.error(`Error parsing values at line ${index + 1}: ${line}`);
          return null;
        }

        const timeIndex = 4;
        const time = values[timeIndex];

        if (isNaN(time)) {
          console.error(`Error parsing time at line ${index + 1}: ${line}`);
          return null;
        }

        return {
          x: time,
          tension: values[0],
          torsion: values[1],
          bendingMomentY: values[3],
          temperature: values[5],
        };
      })
      .filter((row) => row !== null);
      console.log('ChartData:', newChartData);
    setChartData(newChartData);
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !chartData || chartData.length === 0) {
      return;
    }
  
    const filteredChartData = chartData.map((item) => ({
      x: item.x,
      tension: filteredSeries.tension ? item.tension : null,
      torsion: filteredSeries.torsion ? item.torsion : null,
      bendingMomentY: filteredSeries.bendingMomentY ? item.bendingMomentY : null,
      temperature: filteredSeries.temperature ? item.temperature : null,
    }));
  
    const cleanedChartData = filteredChartData.map((item) => ({
      x: item.x,
      tension: isNaN(item.tension) ? 0 : item.tension,
      torsion: isNaN(item.torsion) ? 0 : item.torsion,
      bendingMomentY: isNaN(item.bendingMomentY) ? 0 : item.bendingMomentY,
      temperature: isNaN(item.temperature) ? 0 : item.temperature,
    }));
  
    const traceTension = {
      type: 'scatter',
      mode: 'lines',
      name: 'Tension',
      x: cleanedChartData.map((item) => item.x),
      y: cleanedChartData.map((item) => item.tension),
      line: { color: '#000080' },
      yaxis: 'y',
      stroke: {
        width: 1, // Set your desired stroke width
      },
    };
  
    const traceTorsion = {
      type: 'scatter',
      mode: 'lines',
      name: 'Torsion',
      x: cleanedChartData.map((item) => item.x),
      y: cleanedChartData.map((item) => item.torsion),
      line: { color: '#800080' },
      yaxis: 'y2',
      stroke: {
        width: 0.5, // Set your desired stroke width
      },
    };
  
    const traceBendingMomentY = {
      type: 'scatter',
      mode: 'lines',
      name: 'Bending Moment Y',
      x: cleanedChartData.map((item) => item.x),
      y: cleanedChartData.map((item) => item.bendingMomentY),
      yaxis: 'y3',
      line: { color: '#ADD8E6' },
      stroke: {
        width: 0.5, // Set your desired stroke width
      },
    };
  
    const traceTemperature = {
      type: 'scatter',
      mode: 'lines',
      name: 'Temperature',
      x: cleanedChartData.map((item) => item.x),
      y: cleanedChartData.map((item) => item.temperature),
      line: { color: '#ff0000' },
      yaxis: 'y4',
      stroke: {
        width: 0.5, // Set your desired stroke width
      }, // Assign to the fourth y-axis
    };
  
    const layout = {
      height: 650,
      width: 1800,
      position: 'relative',
      top: '200px',
      showlegend: false,
      xaxis: {
        type: 'numeric',
        tickformat: '%H:%M:%S,%L',
        tickmode: 'array',
        nticks: 15,
        tickvals: cleanedChartData
          .map((item, index) => index * 200)
          .filter((val, index) => index % Math.ceil(cleanedChartData.length / 15) === 0),
        ticktext: cleanedChartData
          .filter((item, index) => index % Math.ceil(cleanedChartData.length / 15) === 0)
          .map((item) => {
            const date = new Date(item.x * 1000);
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const seconds = date.getUTCSeconds();
            const milliseconds = date.getUTCMilliseconds();
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${milliseconds}`;
          }),
      },
      yaxis: {
        title: 'Tension',
        titlefont: { color: '#1f77b4' },
        tickfont: { color: '#1f77b4' },
        side: 'left',
      
      },
      yaxis2: {
        title: 'Torsion',
        titlefont: { color: '#ff7f0e' },
        tickfont: { color: '#ff7f0e' },
        overlaying: 'y',
        side: 'left',
        position: 0.05,
        range: [-10, 20],
       
      },
      yaxis3: {
        title: 'Bending Moment Y',
        titlefont: { color: '#d62728' },
        tickfont: { color: '#d62728' },
        overlaying: 'y',
        side: 'left',
        position: 0.1, // Adjust this value as needed
        range: [-10, 30],
        
      },
      yaxis4: {
        title: 'Temperature',
        titlefont: { color: '#9467bd' },
        tickfont: { color: '#9467bd' },
        overlaying: 'y',
        side: 'right',

      },
      margin: { t: 10 },
    };
  
    const options = {
      scrollZoom: true,
    };
  
    
  
  
    Plotly.newPlot(chartRef.current, [traceTension, traceTorsion, traceBendingMomentY, traceTemperature], layout, options);
  }, [chartData, filteredSeries]);

  const handleFilterChange = (filters) => {
    setFilteredSeries(filters);
  };


  const handleCalculateRollingAverage = () => {
    const filteredChartData = chartData.map((item) => ({
      x: item.x,
      tension: filteredSeries.tension ? item.tension : null,
      torsion: filteredSeries.torsion ? item.torsion : null,
    }));
    const tensionData = filteredChartData.map(item => item.tension);
    
    const torsionData = filteredChartData.map(item => item.torsion);
  
    const tensionRollingAverage = calculateRollingAverage(tensionData, windowSize);
    const torsionRollingAverage = calculateRollingAverage(torsionData, windowSize);
  
    const updatedChartData = chartData.map((item, index) => ({
      ...item,
      tension: filteredSeries.tension ? tensionRollingAverage[index] : item.tension,
      torsion: filteredSeries.torsion ? torsionRollingAverage[index] : item.torsion,
    }));
  
    setChartData(updatedChartData);
  
    const updatedTraceTension = {
      type: 'scatter',
      mode: 'lines',
      name: 'Tension',
      x: updatedChartData.map(item => item.x),
      y: updatedChartData.map(item => item.tension),
      line: { color: '#000080' },
      yaxis: 'y',
      stroke: {
        width: 1,
      },
    };
  
    const updatedTraceTorsion = {
      type: 'scatter',
      mode: 'lines',
      name: 'Torsion',
      x: updatedChartData.map(item => item.x),
      y: updatedChartData.map(item => item.torsion),
      line: { color: '#800080' },
      yaxis: 'y2',
      stroke: {
        width: 1,
      },
    };

    
  
    Plotly.addTraces(chartRef.current, [updatedTraceTension, updatedTraceTorsion]);
  };
  // Function to calculate rolling average
  function calculateRollingAverage(data, windowSize) {
    const rollingAverage = [];

    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        rollingAverage.push(null);
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        const average = window.reduce((acc, val) => acc + val, 0) / windowSize;
        rollingAverage.push(average);
      }
    }

    return rollingAverage;
  }


   
  return (
    <div
      style={{
        display: isOtherWindowOpen ? 'none' : 'block',
        position: 'relative',
        zIndex: 2,
        opacity: 1,
        top: '50px',
        left:'85px',
      }}
      className={isOtherWindowOpen ? 'hidden' : 'block'}
    >
          
      <div ref={chartRef} />
      <CursorValuesTable cursorValues={cursorValues} />
      <div style={{position:'relative',bottom:'470px',left:'75%'}}>
      <FilterComponent  onFilterChange={handleFilterChange} />
      </div>
     
      <input
        type="number"
        value={windowSize}
        onChange={(e) => setWindowSize(parseInt(e.target.value))}
      />
      {/* Button to trigger rolling average calculation */}
      <button onClick={handleCalculateRollingAverage}>Calculate Rolling Average</button>
    </div>
  );
};

export default LineGraph;
