import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist';
import FilterComponent from './FilterComponent';
import CursorValuesTable from './CursorValuesTable'; 
import SaveRecordsButton from './SaveRecordsButton'; 

// import { formatChartDataForSave } from './saveDataUtils';
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
  const [windowSize, setWindowSize] = useState(10);
  const [calculationType, setCalculationType] = useState('average');
  const [averagingEnabled, setAveragingEnabled] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const [originalChartData, setOriginalChartData] = useState(null); 

  const [showViewBounds, setShowViewBounds] = useState(false);
  const [xBounds, setXBounds] = useState([null, null]);
  const [leftLinePosition, setLeftLinePosition] = useState(0.1); // Percentage position of the left line
  const [rightLinePosition, setRightLinePosition] = useState(0.9); 
  const [yBounds, setYBounds] = useState([null, null]); // Initial y bounds

   // Initialize plot only once

   const toggleViewBounds = () => {
    setShowViewBounds(!showViewBounds);
  };
  // Initial x bounds
  const handleLeftLineDrag = (event) => {
    const rect = chartRef.current.getBoundingClientRect();
    const yPos = event.clientY - rect.top;
    const yValue = yPos / rect.height;

    setLeftLinePosition(yValue);
    setXBounds([leftLinePosition, xBounds[1]]);
    setYBounds([leftLinePosition, yBounds[1]]);
    updateDataWithinBounds();
  };

  const handleRightLineDrag = (event) => {
    const rect = chartRef.current.getBoundingClientRect();
    const yPos = event.clientY - rect.top;
    const yValue = yPos / rect.height;

    setRightLinePosition(yValue);
    setXBounds([xBounds[0], rightLinePosition]);
    setYBounds([yBounds[0], rightLinePosition]);
    updateDataWithinBounds();
  };

  useEffect(() => {
    setOriginalChartData([...chartData]); // Update originalChartData whenever chartData changes
  }, [chartData]);
  
  // Inside updateDataWithinBounds function
  const updateDataWithinBounds = () => {
    const filteredData = originalChartData.filter((point) => {
      return point.x >= xBounds[0] && point.x <= xBounds[1] && point.y >= yBounds[0] && point.y <= yBounds[1];
    });
    setChartData(filteredData);
  };

  useEffect(() => {
    const initPlot = () => {
      const trace = {
        x: chartData.map(data => data.x),
        y: chartData.map(data => data.y),
        type: 'scatter',
      };
  
      const layout = {
        width: 800,
        height: 600,
        shapes: [
          // Left line shape
          {
            type: 'line',
            xref: 'paper',
            x0: leftLinePosition,
            y0: yBounds[0],
            x1: leftLinePosition,
            y1: yBounds[1],
            line: { color: 'red', width: 2 },
            draggable: true,
            ondrag: handleLeftLineDrag,
          },
          // Right line shape
          {
            type: 'line',
            xref: 'paper',
            x0: rightLinePosition,
            y0: yBounds[0],
            x1: rightLinePosition,
            y1: yBounds[1],
            line: { color: 'blue', width: 2 },
            draggable: true,
            ondrag: handleRightLineDrag,
          },
        ],
      };
  
      Plotly.newPlot(chartRef.current, [trace], layout);
    };
  
    initPlot();
  }, [chartData, leftLinePosition, rightLinePosition, yBounds]);
  
  const handleSaveRecordsFromButton = () => {
    // Function to call handleSaveRecords from SaveRecordsButton component
    console.log('Saving records from LineGraph...');
    
    // Example: Save the entire dataset
    const newSavedFiles = [...savedFiles, ...data]; // Assuming `data` is an array of data points
    setSavedFiles(newSavedFiles);
  };
  
const initialTimePoints = [
  38, 40, 42, 44, 46, 48, 50, 52, 54, 56
];
const yConstantValue = 10;
const formattedTimePoints = initialTimePoints.map(time => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.000`;
});
console.log('Formatted Time Points:', formattedTimePoints);

useEffect(() => {
  if (!chartRef.current) {
      return;
  }
  // Define traces with zero data initially
  const traceTension = {
    type: 'scatter',
    mode: 'lines',
    name: 'Tension',
    x: formattedTimePoints,
    y: Array(formattedTimePoints.length).fill(yConstantValue),// Initialize with zeros or constant data
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
      x: formattedTimePoints,
      y: Array(formattedTimePoints.length).fill(yConstantValue),// Initialize with zeros
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
      x: formattedTimePoints,
      y: Array(formattedTimePoints.length).fill(yConstantValue),// Initialize with zeros
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
      x: formattedTimePoints,
      y: Array(formattedTimePoints.length).fill(yConstantValue),// Initialize with zeros
      line: { color: '#ff0000' },
      yaxis: 'y4',
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
    tickmode: 'array',
    tickvals: formattedTimePoints, // Use formattedTimePoints as tick values
    ticktext: formattedTimePoints,
    },
    yaxis: {
        title: 'Tension',
        titlefont: { color: '#1f77b4' },
        tickfont: { color: '#1f77b4' },
        side: 'left',
        range: [-187, 1050], // Set the range for tension
        tickAmount: 22, // Adjust as needed
        showgrid: false, 
    },
    yaxis2: {
        title: 'Torsion',
        titlefont: { color: '#800080' },
        tickfont: { color: '#800080' },
        overlaying: 'y',
        side: 'left',
        position: 0.05,
        range: [0, 9], // Set the range for torsion
        tickAmount: 18, // Adjust as needed
        showgrid: false, 
    },
    yaxis3: {
        title: 'Bending Moment Y',
        titlefont: { color: '#006400' },
        tickfont: { color: '#006400' },
        overlaying: 'y',
        side: 'left',
        position: 0.1,
        range: [0, 12.5], // Set the range for bending moment Y
        tickAmount: 25, // Adjust as needed
        showgrid: false, 
    },
    yaxis4: {
        title: 'Temperature',
        titlefont: { color: '#ff0000' },
        tickfont: { color: '#ff0000' },
        overlaying: 'y',
        side: 'right',
        range: [26.6, 31.4], // Set the range for temperature
        tickAmount: 15, // Adjust as needed
        showgrid: false, 
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
}, [formattedTimePoints]); //Include chartData in the dependency array


  useEffect(() => {
    if (!chartRef.current || !data || typeof data !== 'string') {
      return;
    }
  // Split the data into chunks
  const lines = data.split('\n');
  const chunkSize = 2000; // Set your desired chunk size
  const chunks = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize));
  }

  chunks.forEach((chunk, index) => {
    setTimeout(() => {
      const newChartData = chunk
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
      setChartData((prevChartData) => [...prevChartData, ...newChartData]);
    }, index * 100); // Adjust the delay as needed
  });
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
      line: { color: '#006400' },
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
    // const temperatureTickValues = Array.from({ length: 20}, (_, index) => 26.4 + index * 0.2);
    // const temperatureTickLabels = temperatureTickValues.map(value => value.toFixed(1)); 
    const layout = {
      height: 650,
      width: 1800,
      position: 'relative',
      top: '200px',
  
      xaxis: {
        type: 'numeric',
        tickformat: '%H:%M:%S,%L',
        tickmode: 'array',
        nticks:15,
        tickvals: cleanedChartData
          .filter((item, index) => index % Math.ceil(cleanedChartData.length / 15) === 0)
          .map(item => item.x), // Use the actual x values from your data
        ticktext: cleanedChartData
          .filter((item, index) => index % Math.ceil(cleanedChartData.length / 15) === 0)
          .map(item => {
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
        showgrid: false, 
      
      },
      yaxis2: {
        title: 'Torsion',
        titlefont: { color: '#800080' },
        tickfont: { color: '#800080' },
        overlaying: 'y',
        side: 'left',
        position: 0.05,
        showgrid: false, 
    
       
      },
      yaxis3: {
        title: 'Bending Moment Y',
        titlefont: { color: '#006400' },
        tickfont: { color: '#006400' },
        overlaying: 'y',
        side: 'left',
        position: 0.1, // Adjust this value as needed
        // range: [-10, 30],
        showgrid: false, 
        
      },
      yaxis4: {
        title: 'Temperature',
        titlefont: { color: '#ff0000' },
        tickfont: { color: '#ff0000' },
        overlaying: 'y',
        side: 'right',
        showgrid: false, 
        // temperatureTickValues:[23,35],
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
      bendingMomentY: filteredSeries.bendingMomentY ? item.bendingMomentY : null,
      temperature: filteredSeries.temperature ? item.temperature : null,
    }));
    const tensionData = filteredChartData.map(item => item.tension);
    const torsionData = filteredChartData.map(item => item.torsion);
    const bendingMomentYData = filteredChartData.map(item => item.bendingMomentY);
    const temperatureData = filteredChartData.map(item => item.temperature);
  
    let rollingTensionData, rollingTorsionData, rollingBendingMomentYData, rollingTemperatureData;

    if (calculationType === 'average') {
      rollingTensionData = calculateRollingAverage(tensionData, windowSize);
      rollingTorsionData = calculateRollingAverage(torsionData, windowSize);
      rollingBendingMomentYData = calculateRollingAverage(bendingMomentYData, windowSize);
      rollingTemperatureData = calculateRollingAverage(temperatureData, windowSize);
    } else if (calculationType === 'median') {
      rollingTensionData = calculateRollingMedian(tensionData, windowSize);
      rollingTorsionData = calculateRollingMedian(torsionData, windowSize);
      rollingBendingMomentYData = calculateRollingMedian(bendingMomentYData, windowSize);
      rollingTemperatureData = calculateRollingMedian(temperatureData, windowSize);
    }
  
    const updatedChartData = chartData.map((item, index) => ({
      ...item,
      tension: filteredSeries.tension ? rollingTensionData[index] : item.tension,
      torsion: filteredSeries.torsion ? rollingTorsionData[index] : item.torsion,
      bendingMomentY: filteredSeries.bendingMomentY ? rollingBendingMomentYData[index] : item.bendingMomentY,
      temperature: filteredSeries.temperature ? rollingTemperatureData[index] : item.temperature,
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
  
    const updatedTraceBendingMomentY = {
      type: 'scatter',
      mode: 'lines',
      name: 'Bending Moment Y',
      x: updatedChartData.map(item => item.x),
      y: updatedChartData.map(item => item.bendingMomentY),
      line: { color: '#006400' },
      yaxis: 'y3',
      stroke: {
        width: 1,
      },
    };
  
    const updatedTraceTemperature = {
      type: 'scatter',
      mode: 'lines',
      name: 'Temperature',
      x: updatedChartData.map(item => item.x),
      y: updatedChartData.map(item => item.temperature),
      line: { color: '#ff0000' },
      yaxis: 'y4',
      stroke: {
        width: 1,
      },
    };
  
    Plotly.addTraces(chartRef.current, [updatedTraceTension, updatedTraceTorsion, updatedTraceBendingMomentY, updatedTraceTemperature]);
 
  };

  // eslint-disable-next-line


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
  function calculateRollingMedian(data, windowSize) {
    const rollingMedian = [];
  
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        // rollingMedian.push(null);
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        const sortedWindow = window.slice().sort((a, b) => a - b); // Sort window data
        const mid = Math.floor(windowSize / 2); // Find middle index
  
        if (windowSize % 2 === 0) {
          // If even number of elements in window, take average of middle two elements
          const median = (sortedWindow[mid - 1] + sortedWindow[mid]) / 2;
          rollingMedian.push(median);
        } else {
          // If odd number of elements in window, take middle element
          rollingMedian.push(sortedWindow[mid]);
        }
      }
    }
  
    return rollingMedian;
  }
  const toggleAveraging = () => {
    setAveragingEnabled(!averagingEnabled); // Toggle averaging state
  
    // If averaging is enabled, initiate rolling average calculation
    if (!averagingEnabled) {
      // Save the original chart data if it's not already saved
      if (!originalChartData) {
        setOriginalChartData(chartData);
      }
      handleCalculateRollingAverage();
    } else {
      // If averaging is disabled, revert to the original chart data
      setChartData(originalChartData);
      // Clear original chart data
      setOriginalChartData(null);
    }
  };
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
     
     <button
  onClick={toggleAveraging}
  className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center`}
  style={{ background: averagingEnabled ? 'green' : 'gray' }}
>
  {averagingEnabled ? 'Averaging Off' : 'Averaging On'}
</button>
      
       <select value={calculationType} onChange={(e) => setCalculationType(e.target.value)}>
        <option value="average">Average</option>
        <option value="median">Median</option>
      </select>
      <SaveRecordsButton savedFiles={savedFiles} setSavedFiles={setSavedFiles} data={data} onHandleSaveRecords={handleSaveRecordsFromButton} />
      <button onClick={toggleViewBounds} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Toggle View Bounds
    </button>
  
   

    {showViewBounds && (
      <>
        <div style={{ position: 'absolute', left: '20%', top: '0%', borderLeft: '2px solid red', height: '62%' }}></div>
        <div style={{ position: 'absolute', left: '40%', top: '0%', borderLeft: '2px solid red', height: '62%' }}></div>
      </>
    )}
    </div>
  );
};

export default LineGraph;
