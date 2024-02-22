import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import CompareValuesButton from './CompareValuesButton';
import CompareValuesPopup from './CompareValuesPopup';
// import { loadFileData } from './loadFileData';
import ColumnFilter from './ColumnFilter';
import RollingAverageControl from './RollingAverageControl';
import ViewBoundsButton from './ViewBoundsButton';
import 'tailwindcss/tailwind.css';


const CursorValuesTable = ({ cursorValues }) => {
  return (
    <table className="min-w-full border-collapse border border-gray-300">
      <thead className="bg-gray-100"></thead>
      <tbody>
        {cursorValues.map((values, index) => (
          <React.Fragment key={index}>
            <tr className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-4 border">Tension: {values.tension}</td>
              <td className="py-2 px-4 border">Torsion: {values.torsion}</td>
              <td className="py-2 px-4 border">Bending Moment Y: {values.bendingMomentY}</td>
              <td className="py-2 px-4 border">Temperature: {values.temperature}</td>
            </tr>
            {values.xAxis && (
              <tr className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-4 border">X Axis: {values.xAxis}</td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};
//-------------------------------------------------------//




 



const LineGraph = ({ data, isOtherWindowOpen, rollingAverageData ,importedFileName, selectedFiles: propSelectedFiles }) => {
  const chartRef = useRef(null);
  const [cursorValues, setCursorValues] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState({
    tension: true,
    torsion: true,
    bendingMomentY: true,
    temperature: true,
  });
  const [chartData, setChartData] = useState([]);
  const [fileContent, setFileContent] = useState('');
  // State to manage the list of saved files
  const [savedFiles, setSavedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(propSelectedFiles || []); 



  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);



  const handleFilterChange = (columnName) => {
    setFilteredSeries((prevFilters) => ({
      ...prevFilters,
      [columnName]: !prevFilters[columnName],
    }));
  };
  
  const handleDataUpdate = (newData) => {
    // Update your chartData state with the newly calculated rolling averages
    setChartData(newData);
  };

  const handleColumnFilterChange = (newFilters) => {
    // Handle the filter changes, e.g., update the chart or data based on the new filters
    console.log('Column filters changed:', newFilters);
    setFilteredSeries(newFilters);
  };
  const handleCompareClick = () => {
    // Check if any files are selected for comparison
    if (selectedFiles.length === 0) {
      console.log('No files selected for comparison.');
      return;
    }

    // Fetch the selected records based on the file names
    const selectedRecords = savedFiles.filter((file) => selectedFiles.includes(file.fileName));

    // Perform your comparison logic here using the selected records
    console.log('Selected Records for Comparison:', selectedRecords);

    // Set the selected records to pass to the CompareValuesPopup component
    setSelectedRecords(selectedRecords);

    // Optionally, you can open a popup window or perform any other action here
    // For example, you can pass the selectedRecords to the CompareValuesPopup component
    setShowPopup(true);
  };

  const handleCompare = (selectedYAxis) => {
    // Perform your comparison logic here using the selected records and Y-axis
    console.log('Selected Y-axis:', selectedYAxis);
    console.log('Selected Records for Comparison:', selectedRecords);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };


  const handleSaveRecords = () => {
    console.log('Saving records...');
    // Calculate the next file number
    const nextFileNumber = savedFiles.length > 0 ? savedFiles[savedFiles.length - 1].fileNumber + 1 : 1;
  
    // Construct the new file name
    const fileName = `d5_z_ap_ae_vc_n_f_vf-${nextFileNumber}.txt`;
  
    // Format the chart data as needed for saving
    const savedRecord = formatChartDataForSave(data);
  
    // Update the savedFiles array with the new file
    setSavedFiles((prevSavedFiles) => [
      ...prevSavedFiles,
      { fileName, data: savedRecord, fileNumber: nextFileNumber },
    ]);
  };
  
  const handleDownloadRecord = (file) => {
    const formattedData = formatChartDataForDownload(file.data); // Format data for download
    const blob = new Blob([formattedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const formatChartDataForSave = (chartData) => {
    // Check if chartData is a string
    
    if (typeof chartData !== 'string') {
      console.error('chartData is not a string:', chartData);
      return '';  // or handle this case appropriately
    }
  
    // Split the data into lines
    const lines = chartData.split('\n');
  
    // Find the index of the line containing the column headers
    const dataIndex = lines.findIndex(line => line.includes('Tension;Torsion;Bending moment X;Bending moment Y;Time;Temperature'));
  
    // Extract the lines with chart data
    const chartDataLines = lines.slice(dataIndex + 2); // Skip the header and the unit row
  
    // Format the chart data as needed for saving
    const formattedData = chartDataLines.map((line) => {
      const values = line.split(';');
      return `Tension: ${values[0]}; Torsion: ${values[1]}; Bending Moment Y: ${values[3]}; Temperature: ${values[5]}; Time: ${values[4]}`;
    });
  
    console.log('Formatted Data:', formattedData); // Add this line for debugging
  
    return formattedData.join('\n');
  };
  
  
  
  // Add this function to format the data for download
  const formatChartDataForDownload = (chartData) => {
    // You may need to customize this based on your data format
    return chartData;
  };

  const handleCheckboxChange = (fileName) => {
    // Check if the file is already selected
    if (selectedFiles.includes(fileName)) {
      // If yes, show the confirmation modal
      setFileToDelete(fileName);
      setShowConfirmation(true);
    } else {
      // If not, toggle the checkbox
      setSelectedFiles((prevSelectedFiles) => {
        if (prevSelectedFiles.includes(fileName)) {
          return prevSelectedFiles.filter((file) => file !== fileName);
        } else {
          return [...prevSelectedFiles, fileName];
        }
      });
    }
  };
  

  const handleConfirmation = (confirmed) => {
    // Close the confirmation modal
    setShowConfirmation(false);

    // If user confirmed, delete the file
    if (confirmed && fileToDelete) {
      const updatedFiles = savedFiles.filter((file) => file.fileName !== fileToDelete);
      setSavedFiles(updatedFiles);

      // Clear the selectedFiles state
      setSelectedFiles((prevSelectedFiles) => prevSelectedFiles.filter((file) => file !== fileToDelete));
    }

    // Clear the fileToDelete state
    setFileToDelete(null);
  };
  const staticChartData = [
    { x: 0, tension: 0, torsion: 0, bendingMomentY: 0, temperature: 0 },
    { x: 0, tension: 0, torsion: 0, bendingMomentY: 0, temperature: 0 },
    // Add more static data points as needed
  ];

  





  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const options = {
      chart: {
        height: 500,
        type: 'line',
        events: {
          mounted: function (chartContext) {
            const base = chartContext.chart?.w?.globals?.dom?.base;

            if (base) {
              base.addEventListener('mousemove', function (event) {
                const xVal = chartContext.xaxis[0].invert(event.clientX - chartContext.chartRect.left);
                const seriesData = chartContext.getSeriesSnapshots();

                let closestPoint = null;
                let closestDistance = Number.MAX_VALUE;

                for (const series of seriesData) {
                  for (const dataPoint of series.data) {
                    const distance = Math.abs(dataPoint.x - xVal);

                    if (distance < closestDistance) {
                      closestDistance = distance;
                      closestPoint = dataPoint;
                    }
                  }
                }

                chartContext.w.globals.tooltipTitle = closestPoint.seriesName;
                chartContext.w.globals.tooltipLabels = [closestPoint.x.toFixed(3)];
                chartContext.w.globals.tooltipY = [closestPoint.y.toFixed(3)];

                setCursorValues([
                  {
                    yAxis: closestPoint.y.toFixed(3),
                    tension: closestPoint.seriesMap.Tension.toFixed(3),
                    torsion: closestPoint.seriesMap.Torsion.toFixed(3),
                    bendingMomentY: closestPoint.seriesMap['Bending Moment Y'].toFixed(3),
                    temperature: closestPoint.seriesMap.Temperature.toFixed(3),
                    xAxis: closestPoint.x.toFixed(3),
                  },
                ]);
              });
            }
          },
        },
      },
      xaxis: {
        type: 'datetime', // Use datetime type for x-axis
        labels: {
          formatter: (val) => {
            const date = new Date(val);
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const seconds = date.getUTCSeconds();
            const milliseconds = date.getUTCMilliseconds();
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${milliseconds}`;
        },
      },
    },
      yaxis: [
        {
          title: {
            text: 'Tension',
          },
          min: -187,
          max: 1050,
          tickAmount: 22,
          labels: {
            formatter: (value) => value.toFixed(1),
          },
        },
        {
          title: {
            text: 'Torsion',
          },
          min: 0,
          max: 9,
          tickAmount: 18,
          labels: {
            formatter: (value) => value.toFixed(1),
          },
        },
        {
          title: {
            text: 'Bending Moment Y',
          },
          min: 0,
          max: 12.5,
          tickAmount: 25,
          labels: {
            formatter: (value) => value.toFixed(1),
          },
        },
        {
          opposite: true,
          title: {
            text: 'Temperature',
          },
          min: 26.6,
          max: 31.4,
          tickAmount: 15,
          labels: {
            formatter: (value) => value.toFixed(1),
          },
        },
      ],
      tooltip: {
        enabled: true,
        x: {
          formatter: (val) => {
            if (val === null) {
              return ''; // or handle it in a way that makes sense for your application
            }
    
            const date = new Date(val);
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const seconds = date.getUTCSeconds();
            const milliseconds = date.getUTCMilliseconds();
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${milliseconds}`;
          },
        },
        
      },
    };
    const chartOptions = { ...options, series: getSeries(staticChartData) };
    

    // Destroy previous chart instance if it exists
    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    const newChart = new ApexCharts(chartRef.current, chartOptions);
    newChart.render();

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (newChart) {
        newChart.destroy();
      }
    };
  }, []);
  

  useEffect(() => {
    if (!chartRef.current || !data || typeof data !== 'string') {
      return;
    }
  
    const lines = data.split('\n');

    // Find the unit row
    const unitRow = lines.find((line) => line.startsWith('#unit type:'));
    const units = unitRow ? unitRow.split(';').map((unit) => unit.trim()) : [];
  
    const newChartData = lines
    .filter((line) => !line.startsWith('#') && line.trim() !== '' && !isNaN(line.trim().split(';')[0]))// Filter out comments and empty lines
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
  
    setChartData(newChartData);
    //----------------minmax y axis -----------------//
    const minYValues = chartData.reduce(
      (minValues, dataPoint) => {
        return {
          tension: Math.min(minValues.tension, dataPoint.tension),
          torsion: Math.min(minValues.torsion, dataPoint.torsion),
          bendingMomentY: Math.min(minValues.bendingMomentY, dataPoint.bendingMomentY),
          temperature: Math.min(minValues.temperature, dataPoint.temperature),
        };
      },
      {
        tension: Number.MAX_VALUE,
        torsion: Number.MAX_VALUE,
        bendingMomentY: Number.MAX_VALUE,
        temperature: Number.MAX_VALUE,
      }
    );
  
    const maxYValues = chartData.reduce(
      (maxValues, dataPoint) => {
        return {
          tension: Math.max(maxValues.tension, dataPoint.tension),
          torsion: Math.max(maxValues.torsion, dataPoint.torsion),
          bendingMomentY: Math.max(maxValues.bendingMomentY, dataPoint.bendingMomentY),
          temperature: Math.max(maxValues.temperature, dataPoint.temperature),
        };
      },
      {
        tension: Number.MIN_VALUE,
        torsion: Number.MIN_VALUE,
        bendingMomentY: Number.MIN_VALUE,
        temperature: Number.MIN_VALUE,
      }
    );
    const xMin = Math.min.apply(null, chartData.map(item => item.x));
    const xMax = Math.max.apply(null, chartData.map(item => item.x));
    const numTicks = 15; // Change this to the desired number of ticks

const xRange = xMax - xMin;
const tickInterval = xRange / (numTicks - 1);
    
    //---------------end--------------------//


      const options = {
        chart: {
          height: 500,
          type: 'line',
          events: {
            mounted: function (chartContext) {
              const base = chartContext.chart?.w?.globals?.dom?.base;
      
              if (base) {
                base.addEventListener('mousemove', function (event) {
                  const xVal = chartContext.xaxis[0].invert(event.clientX - chartContext.chartRect.left);
                  const seriesData = chartContext.getSeriesSnapshots();
               
                  let closestPoint = null;
                  let closestDistance = Number.MAX_VALUE;
      
                  for (const series of seriesData) {
                    for (const dataPoint of series.data) {
                      const distance = Math.abs(dataPoint.x - xVal);
      
                      if (distance < closestDistance) {
                        closestDistance = distance;
                        closestPoint = dataPoint;
                      }
                    }
                  }
      
                  chartContext.w.globals.tooltipTitle = closestPoint.seriesName;
                  chartContext.w.globals.tooltipLabels = [closestPoint.x.toFixed(3)];
                  chartContext.w.globals.tooltipY = [closestPoint.y.toFixed(3)];
      
                  setCursorValues([
                    {
                      yAxis: closestPoint.y.toFixed(3),
                      tension: closestPoint.seriesMap.Tension.toFixed(3),
                      torsion: closestPoint.seriesMap.Torsion.toFixed(3),
                      bendingMomentY: closestPoint.seriesMap['Bending Moment Y'].toFixed(3),
                      temperature: closestPoint.seriesMap.Temperature.toFixed(3),
                      xAxis: closestPoint.x.toFixed(3),
                    },
                  ]);
                });
              }
            },
          },
        },
        xaxis: {
          type: 'numeric',
          labels: {
            formatter: (val) => {
              const date = new Date(val * 1000); // Convert seconds to milliseconds
              const hours = date.getUTCHours();
              const minutes = date.getUTCMinutes();
              const seconds = date.getUTCSeconds();
              const milliseconds = date.getUTCMilliseconds();
              return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${milliseconds}`;
            },
          },
          tickAmount: numTicks,
          min: xMin,
          max: xMax,
          tickPlacement: 'on',
          tickInterval: tickInterval,
         },
        scrollX:{
          enabled: true,
        },
      
        
        yaxis: [
          {
            title: {
              text: `Tension (${units[0]})`,
            },
            min: minYValues.tension,
            max: maxYValues.tension,
            tickAmount: 22,
            labels: {
              formatter: (value) => value.toFixed(1),
            },
          },
          {
            title: {
              text: `Torsion (${units[1]})`,
            },
            min: minYValues.torsion,
            max: maxYValues.torsion,
            tickAmount: 18,
            labels: {
              formatter: (value) => value.toFixed(1),
            },
          },
          {
            title: {
              text: `Bending Moment Y (${units[3]})`,
            },
            min: minYValues.bendingMomentY,
            max: maxYValues.bendingMomentY,
            tickAmount: 25,
            labels: {
              formatter: (value) => value.toFixed(1),
            },
          },
          {
            opposite: true,
            title: {
              text: `Temperature (${units[5]})`,
            },
            min: minYValues.temperature,
            max: maxYValues.temperature,
            tickAmount: 15,
            labels: {
              formatter: (value) => value.toFixed(1),
            },
          },
        ],
        tooltip: {
          enabled: true,
          xaxis: {
            type: 'numeric',
            labels: {
              formatter: (val) => {
                const date = new Date(val * 1000); // Convert seconds to milliseconds
                const hours = date.getUTCHours();
                const minutes = date.getUTCMinutes();
                const seconds = date.getUTCSeconds();
                const milliseconds = date.getUTCMilliseconds();
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${milliseconds}`;
              },
            },
            axisTicks: {
              show: true,
            },
            annotations: {
              xaxis: [
                {
                  x: xMin, // Set the initial visible range
                  x2: xMax,
                  borderColor: '#999',
                  label: {
                    text: 'Zoom to see more',
                    position: 'left',
                    style: {
                      color: '#fff',
                      background: '#333',
                    },
                  },
                },
              ],
            },
          },
          scrollX:{
            enabled: true,
          },
        },
        // series: getSeries(filteredChartData),
        stroke:{
          width:1,
          },
        
        };

      console.log("chartData:", chartData);

      const filteredChartData = chartData.map((item) => ({
        x: item.x,
        tension: filteredSeries.tension ? item.tension : null,
        torsion: filteredSeries.torsion ? item.torsion : null,
        bendingMomentY: filteredSeries.bendingMomentY ? item.bendingMomentY : null,
        temperature: filteredSeries.temperature ? item.temperature : null,
      }));
      console.log("filteredChartData:", filteredChartData); // Add this line

      const cleanedChartData = filteredChartData.map((item) => ({
        x: item.x,
        tension: isNaN(item.tension) ? 0 : item.tension,
        torsion: isNaN(item.torsion) ? 0 : item.torsion,
        bendingMomentY: isNaN(item.bendingMomentY) ? 0 : item.bendingMomentY,
        temperature: isNaN(item.temperature) ? 0 : item.temperature,
      }));
      console.log("cleanedChartData:", cleanedChartData);


      const chartOptions = { ...options, series: getSeries(filteredChartData) };

      


    const newChart = new ApexCharts(chartRef.current, chartOptions);
    newChart.render();

       // Destroy previous chart instance if it exists
       if (!isOtherWindowOpen && chartRef.current) {
        // Rest of your existing code for rendering the chart
      }
      // const selectedFilesData = selectedFiles.map((filename) => {
      //   // Load data for the selected file (you need a way to load the data)
      //   const fileData = loadFileData(filename);
      //   return fileData;
      // });

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (newChart) {
        newChart.destroy();
      }
    };
    // updateChartWithSelectedFiles(selectedFilesData);
  }, [isOtherWindowOpen, data, filteredSeries]);              //if i add selectedfiles here then after savedrecords if i select the file means that file data also will be updated //


  const getSeries = (data) => [
    { name: 'Tension', data: data.map((item) => ({ x: item.x, y: item.tension })), color: '#000080' },
    { name: 'Torsion', data: data.map((item) => ({ x: item.x, y: item.torsion })), color: '#800080' },
    { name: 'Bending Moment Y', data: data.map((item) => ({ x: item.x, y: item.bendingMomentY })), color: '#ADD8E6' },
    { name: 'Temperature', data: data.map((item) => ({ x: item.x, y: item.temperature })), color: '#ff0000' },
  ];
  
  

  return (
    <div>
     <div
        style={{
          display: isOtherWindowOpen ? 'none' : 'flex',
          flexDirection: 'row',
          position: 'relative',
          zIndex: 1, // Set the zIndex to 1 for LineGraph
          opacity: 1,
          width: '100%',
          top: '10px',
        }}
        className={isOtherWindowOpen ? 'hidden' : 'block'}
      >
        {/* Graph Section */}
        <div ref={chartRef} style={{ flex: 1}} />
  
        {/* Filter Options Section */}
        <div>
          <CursorValuesTable cursorValues={cursorValues} />
          <ColumnFilter onFilterChange={handleColumnFilterChange} />
        </div>
  
     
          <button
            onClick={handleSaveRecords}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer mt-4"style={{ position: 'relative', top:'580px',left:'200px',height:'42px',width:'150px' }}
          >
            Save Records
          </button>
         

        <div className='list_file' >
          <table className="min-w-full border-collapse border border-gray-300 mt-4" style={{position:'relative',top:'110%',right:'110%'}}>
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4">File Name</th>
                <th className="py-2 px-4">Select</th>
                <th className="py-2 px-4">Download</th>
              </tr>
            </thead>
            <tbody>
              {savedFiles.map((file) => (
                <tr key={file.fileName} className="bg-white">
                  <td className="py-2 px-4">{file.fileName}</td>
                  <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(file.fileName)}
                      checked={selectedFiles.includes(file.fileName)}
                      className="form-checkbox h-5 w-5 text-blue-500"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <button onClick={() => handleDownloadRecord(file)}>Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Confirmation modal */}
        {showConfirmation && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-md">
              <p>Are you sure you want to delete {fileToDelete}?</p>
              <button className="bg-red-500 text-white px-2 py-1 m-2" onClick={() => handleConfirmation(true)}>
                Yes
              </button>
              <button className="bg-gray-300 px-2 py-1 m-2" onClick={() => handleConfirmation(false)}>
                No
              </button>
            </div>
          </div>
        )}
      </div>
 
  
<div id="btn" style={{position:'relative', top:'150px',left:'89%'}}>  
  
  <CompareValuesButton onCompareClick={handleCompareClick} />

{!isOtherWindowOpen && showPopup && (
  <div
    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
    style={{ zIndex: 2}} // Set a higher zIndex for CompareValuesPopup
  >
    <CompareValuesPopup
      onClose={handleClosePopup}
      selectedRecords={selectedRecords}
      onCompare={handleCompare}
      
    />
  </div>
)}
</div>
<div style={{ position: 'absolute', top: '400px', right: '250px' }}>
<RollingAverageControl onDataUpdate={handleDataUpdate} chartData={chartData} />
      </div>

    </div>
  );
};
 

export default LineGraph;
