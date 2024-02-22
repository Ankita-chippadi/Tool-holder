import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

const GraphicPolarPlot = ({ isVisible, onClose }) => {
  const [selectedFolderFiles, setSelectedFolderFiles] = useState([]);
  const [selectedFolderCheckboxes, setSelectedFolderCheckboxes] = useState({});
  const [folderPath, setFolderPath] = useState('');
  const plotColors = ['#FF5733', '#33FF57', '#334CFF', '#FF33EC', '#AACCFF', '#FFAABB', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
  const [graphData, setGraphData] = useState([]);
  const [showGraph, setShowGraph] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const graphContainerRef = useRef(null);
  const [graphLimits, setGraphLimits] = useState([-4.65947, 4.65947]);
  const [calculateValues, setCalculateValues] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [showAngleCalculator, setShowAngleCalculator] = useState(false);
  const [showValueCalculator, setShowValueCalculator] = useState(false);
  const [showPointCalculatorPopup, setShowPointCalculatorPopup] = useState(false);
  const [showZeroPointCalculatorPopup, setShowZeroPointCalculatorPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showZeroPoint, setShowZeroPoint] = useState(false);
  const [isConstantGraph, setIsConstantGraph] = useState(false); // Add isConstantGraph variable
  // const [distanceStress, setDistanceStress] = useState('');
  // const [currentGraphIndex, setCurrentGraphIndex] = useState(0); // Introduce state variable

    
  const [points, setPoints] = useState('');
  const [filter, setFilter] = useState('');
  const [scrollZoom, setScrollZoom] = useState(false);

  const toggleScrollZoom = () => {
    setScrollZoom(!scrollZoom);
  };

  const handleToggleValueCalculator = () => setShowValueCalculator(!showValueCalculator);
  const handleToggleCalculateValues = () => setCalculateValues(!calculateValues);
  const handleToggleAngleCalculator = () => setShowAngleCalculator(!showAngleCalculator);
 
  

  // const calculateCenterOfGravity = () => {
  //   // Calculate Center of Gravity for all graphs
  //   const inputContainer = document.getElementById('inputContainer'); // Assuming you have a container element in your HTML to append inputs
  //   inputContainer.innerHTML = ''; // Clear previous inputs
  
  //   graphData.forEach((graph, index) => {
  //     const sumBmX = graph.data.reduce((acc, point) => acc + point.bendingMomentX, 0);
  //     const sumBmY = graph.data.reduce((acc, point) => acc + point.bendingMomentY, 0);
  //     const numberOfPoints = graph.data.length;
  
  //     const centerOfGravityX = sumBmX / numberOfPoints;
  //     const centerOfGravityY = sumBmY / numberOfPoints;
  
  //     // Calculate Distance to Center of Gravity
  //     const distanceToCenter = Math.sqrt(Math.pow(centerOfGravityX, 2) + Math.pow(centerOfGravityY, 2));
  
  //     // Create label for distance
  //     const distanceLabel = document.createElement('div');
  //     distanceLabel.innerText = `Distance to Center of Gravity for Graph ${index + 1}:`;
  //     distanceLabel.className = 'text-sm font-medium'; // Adjust text size and font weight as needed
  //     inputContainer.appendChild(distanceLabel);
  
  //     // Create input for distance
  //     const distanceInput = document.createElement('input');
  //     distanceInput.type = 'text';
  //     distanceInput.value = distanceToCenter.toFixed(2); // Set value to calculated distance
  //     distanceInput.placeholder = ' ';
  //     distanceInput.readOnly = true; // Make it read-only
  //     distanceInput.className = 'border border-gray-300 p-2 rounded-md w-full';
  //     distanceInput.style.border = '1px solid #555555';
  //     inputContainer.appendChild(distanceInput);
  //   });
  // setShowPopup(true);
    
  // };
  
    
  const generateReport = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
  
      // Set up a font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
      // Add content to the PDF document
      page.drawText('Graphic Polar Plot Calculation', { x: 50, y: 750, size: 24 });
      page.drawText(`Selected Folder: ${folderPath}`, { x: 50, y: 700, size: 12 });
  
      // Add file names to the report
      let yOffset = 675;
      selectedFiles.forEach((file, index) => {
        page.drawText(`File ${index + 1}: ${file.name}`, { x: 50, y: yOffset, size: 12 });
        yOffset -= 25; // Adjust vertical spacing
      });
  
      // Loop through each selected file
      const imagePromises = selectedFiles.map(async (file, index) => {
        const fileData = graphData.find(data => data.file === file.name);
  
        if (fileData) {
          // Convert the graph data to a Plotly trace
          const trace = {
            x: fileData.data.map(d => d.bendingMomentX),
            y: fileData.data.map(d => d.bendingMomentY),
            mode: 'markers',
            type: 'scatter',
            marker: {
              symbol: 'diamond',
              color: plotColors[index % plotColors.length], // Use different colors for different files
            },
          };
  
          // Convert the graph to an image
          const tempDiv = document.createElement('div');
          document.body.appendChild(tempDiv);
          Plotly.newPlot(tempDiv, [trace]);
  
          // Convert the graph to an image
          const plotImage = await Plotly.toImage(tempDiv, { format: 'png', width: 800, height: 600 });
  
          // Remove the temporary div
          tempDiv.remove();
  
          // Embed the image into the PDF document
          const image = await pdfDoc.embedPng(plotImage);
          return { image, index };
        }
      });
  
      // Wait for all images to be converted and embedded
      const imageResults = await Promise.all(imagePromises);
  
      // Sort imageResults based on the original order
      imageResults.sort((a, b) => a.index - b.index);
  
      imageResults.forEach(({ image }, i) => {
        const row = Math.floor(i / 3); // Determine the current row
        const col = i % 3; // Determine the current column within the row
      
        const imageWidth = 150; // Adjust the width of each image
        const imageHeight = 150; // Adjust the height of each image
        const horizontalSpacing = 20; // Adjust the horizontal spacing between images
      
        const x = 50 + col * (imageWidth + horizontalSpacing);
        const y = 50 + row * imageHeight; // Adjust the y-coordinate to display images one below the other
      
        page.drawImage(image, {
          x,
          y,
          width: imageWidth,
          height: imageHeight,
        });
      });
  
      // Serialize the PDF document to bytes
      const pdfBytes = await pdfDoc.save();
  
      // Convert the bytes to a Blob
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
      // Create a URL for the Blob
      const blobUrl = URL.createObjectURL(blob);
  
      // Trigger the download
      saveAs(blob, 'PolarPlotReport.pdf');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };
  
  const handlePopupClose = () => {
    setShowPointCalculatorPopup(false);
  };
  const handleZeroPointCalculatorClick = () => {
    setShowZeroPointCalculatorPopup(!showZeroPointCalculatorPopup);
  };
  const handleZeroPointCalculatorPopupClose = () => {
    setShowZeroPointCalculatorPopup(false);
  };
// pop up messsage after 6 graphs 
const PopupMessage = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded-md flex flex-col">
    <div className="flex justify-end">
      <button className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded"onClick={onClose}>
          X
        </button>
        </div>
      <div className="text-xl mb-4">{message}</div>
      <div className="flex justify-center">
        <button
          className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded mr-2"
          onClick={onClose}
        >
          OK
        </button>
       
      </div>
    </div>
  </div>
);
  const handleFolderSelect = async () => {
    try {
      const folderInput = document.createElement('input');
      folderInput.setAttribute('type', 'file');
      folderInput.setAttribute('webkitdirectory', true);

      folderInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          const fileList = Array.from(files);
          setSelectedFolderFiles(fileList);
          setSelectedFolderCheckboxes({});

          const folderPath = fileList[0].webkitRelativePath;

          handleCheckboxChange(fileList[0]);

          setFolderPath(folderPath);
        }
      });

      folderInput.click();
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleCheckboxChange = async (file) => {
    try {
      const updatedCheckboxes = { ...selectedFolderCheckboxes };
      if (Object.keys(updatedCheckboxes).length === 0) {
        // Prevent the first checkbox from being selected initially
        updatedCheckboxes[file.name] = false;
      } else {
        updatedCheckboxes[file.name] = !updatedCheckboxes[file.name];
      }
  
      const updatedSelectedFiles = Object.keys(updatedCheckboxes)
        .filter((fileName) => updatedCheckboxes[fileName])
        .map((fileName) => selectedFolderFiles.find((file) => file.name === fileName));
  
      // Sort the selected files based on the series number
      updatedSelectedFiles.sort((a, b) => {
        const getSeriesNumber = (filename) => {
          const match = filename.match(/(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        };
        return getSeriesNumber(a.name) - getSeriesNumber(b.name);
      });
  
      if (updatedSelectedFiles.length > 6) {
        // Show a pop-up message if more than 6 files are selected
        setPopupMessage('More than 6 graphs are not possible.');
        setShowPopup(true);
        return;
      }
  
      setSelectedFolderCheckboxes(updatedCheckboxes);
      setSelectedFiles(updatedSelectedFiles);
  
      const processedData = await Promise.all(updatedSelectedFiles.map(async (file, index) => {
        const fileContent = await readFileContent(file);
        const processedContent = processFileContent(fileContent);
        return { file: file.name, data: processedContent, index };
      }));
  
      const updatedGraphData = [...graphData];
      processedData.forEach(({ data, index }) => {
        updatedGraphData[index] = {
          file: updatedSelectedFiles[index].name,
          data,
        };
      });
  
      let maxAbsoluteValue = 0;
      updatedGraphData.forEach(({ data }) => {
        data.forEach(({ bendingMomentX, bendingMomentY }) => {
          const absX = Math.abs(bendingMomentX);
          const absY = Math.abs(bendingMomentY);
          maxAbsoluteValue = Math.max(maxAbsoluteValue, absX, absY);
        });
      });
  
      const newGraphLimits = [-maxAbsoluteValue, maxAbsoluteValue];
      setGraphData(updatedGraphData);
      setShowGraph(true);
      setGraphLimits(newGraphLimits);
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };
  
  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage('');
  };
  
  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {    
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        resolve(content);                 
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };
  const processFileContent = (fileContent) => {
    const lines = fileContent.split('\n');
    const dataStartIndex = lines.findIndex(line => line.startsWith('Tension;Torsion;Bending moment X;Bending moment Y;Time;Temperature'));
  
    if (dataStartIndex !== -1) {
      const data = lines.slice(dataStartIndex + 2).map(line => {
        const [Tension, _torsion_, bendingMomentX, bendingMomentY, _time__, _temperature__] = line.split(';');
        return { bendingMomentX: parseFloat(bendingMomentX), bendingMomentY: parseFloat(bendingMomentY) };
      });
  
      const maxLength = Math.max(data.length, data.filter(({ bendingMomentX }) => !isNaN(bendingMomentX)).length, data.filter(({ bendingMomentY }) => !isNaN(bendingMomentY)).length);
      const alignedData = data.map(({ bendingMomentX, bendingMomentY }) => ({
        bendingMomentX: isNaN(bendingMomentX) ? 0 : bendingMomentX,
        bendingMomentY: isNaN(bendingMomentY) ? 0 : bendingMomentY,
      }));
  
      // Set default values for filter and points only if data is present
      if (data.length > 0) {
        setFilter('1');
        setPoints('All');
      } else {
        setFilter('');
        setPoints('');
      }
  
      while (alignedData.length < maxLength) {
        alignedData.push({ bendingMomentX: 0, bendingMomentY: 0 });
      }
  
      return alignedData;
    } else {
      return [];
    }
  };
  
  useEffect(() => {
    const initialGraphData = Array.from({ length: 6 }, (_, index) => ({
      file: ` ${index + 1}`,
      data: Array.from({ length: 100 }, (_, i) => ({
        bendingMomentX: 0,
        bendingMomentY: 0
        
      })),
    }));

    setGraphData(initialGraphData);
  }, []);

  const timeLabels = graphData.length > 0 ? graphData[0].data.map((_, i) => i) : [];

  useEffect(() => {
    if (showGraph) {
      const rows = 2;
      const cols = 3;
      const graphContainerId = 'graph-container';
      const container = graphContainerRef.current;
      container.innerHTML = '';
      const containerMaxWidth = 800; // Adjust this value as needed
      const containerWidthPercent = 100 / cols;

      for (let row = 0; row < rows; row++) {
        const rowContainer = document.createElement('div');
        rowContainer.style.display = 'flex';

        for (let col = 0; col < cols; col++) {
          const index = col + row * cols;
          if (index < graphData.length) {
            const modifiedData = graphData[index].data.map((point, pointIndex, arr) => {
              if (pointIndex === arr.length - 1) {
                return {
                  bendingMomentX: arr[0].bendingMomentX,
                  bendingMomentY: arr[0].bendingMomentY,
                };
              }
              return point;
            });

            const trace = {
              x: modifiedData.map(d => d.bendingMomentX),
              y: modifiedData.map(d => d.bendingMomentY),
              
              text: modifiedData.map(d => `(${d.bendingMomentX}, ${d.bendingMomentY})`),
              mode: 'markers',
              type: 'scatter',
              marker: {
                symbol: 'diamond',
                color: plotColors[index % plotColors.length],
              },
            };

            const midpointX = (graphLimits[0] + graphLimits[1]) / 2;
            const midpointY = (graphLimits[0] + graphLimits[1]) / 2;

            const layout = {
              xaxis: {
                title: 'Bending Moment X' ,
                zeroline: true,
                zerolinecolor: 'black',
                showline: true,
                showticklabels: true,
                ticks: 'inside',
                tickvals: [graphLimits[0], 0, graphLimits[1]],
                range: graphLimits,
                fixedrange: true,
                tickmode: 'array',
              },
              yaxis: {
                title: 'Bending Moment Y',
                zeroline: true,
                zerolinecolor: 'black',
                showline: true,
                showticklabels: true,
                tickmode: 'array',
                tickvals: [
                  graphLimits[0],
                  Math.round(graphLimits[0] * 0.2),
                  Math.round(graphLimits[0] * 0.4),
                  Math.round(graphLimits[0] * 0.6),
                  Math.round(graphLimits[0] * 0.8),
                  0,
                  Math.round(graphLimits[1] * 0.2),
                  Math.round(graphLimits[1] * 0.4),
                  Math.round(graphLimits[1] * 0.6),
                  Math.round(graphLimits[1] * 0.8),
                  graphLimits[1],
                ],
                ticks: 'inside',
                range: graphLimits,
                fixedrange: true,
              },
              shapes: [
                {
                  type: 'line',
                  x0: midpointX,
                  x1: midpointX,
                  y0: graphLimits[0],
                  y1: graphLimits[1],
                  line: {
                    color: 'black',
                    width: 2,
                    dash: 'dashdot',
                  },
                },
                {
                  type: 'line',
                  x0: graphLimits[0],
                  x1: graphLimits[1],
                  y0: midpointY,
                  y1: midpointY,
                  line: {
                    color: 'black',
                    width: 2,
                    dash: 'dashdot',
                  },
                },
              ],
              dragmode: calculateValues ? 'select' : false,
              modebar: {
                remove: [
                  'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines', 'resetViews', 'sendDataToCloud', 'toggleHover', 'resetViewMapbox', 'resetCameraDefault3d', 'resetCameraLastSave3d',
                ]  

              },
              scrollZoom: scrollZoom, 
            };
  
            const config = {
              displayModeBar: false,
              displaylogo: false,
            };
  
            const newGraphContainer = document.createElement('div');
            newGraphContainer.id = `${graphContainerId}-${index}`;
            newGraphContainer.style.width = `${containerWidthPercent}%`;
            newGraphContainer.style.maxWidth = `${containerMaxWidth}px`; // Set maximum width
            newGraphContainer.style.float = 'left';
            newGraphContainer.style.border = '5px solid #ccc';
            newGraphContainer.style.margin = '0px';
            newGraphContainer.style.backgroundColor = 'gray';
            newGraphContainer.style.marginRight = '0px'; // Add right margin
            rowContainer.appendChild(newGraphContainer);
          
            const inputContainer = document.createElement('div');
            inputContainer.style.width = '25%'; // Adjust width as needed
            inputContainer.style.float = 'right';
            inputContainer.style.padding = '3 40px';
            newGraphContainer.appendChild(inputContainer);
  
            const fileNameElement = document.createElement('div');
            fileNameElement.innerText = graphData[index].file;
            fileNameElement.style.textAlign = 'center';
            fileNameElement.style.marginBottom = '5px';
            newGraphContainer.appendChild(fileNameElement);

            // Calculate Center of Gravity
          const sumBmX = graphData[index].data.reduce((acc, point) => acc + point.bendingMomentX, 0);
          const sumBmY = graphData[index].data.reduce((acc, point) => acc + point.bendingMomentY, 0);
          const numberOfPoints = graphData[index].data.length;
          const centerOfGravityX = sumBmX / numberOfPoints;
          const centerOfGravityY = sumBmY / numberOfPoints;
          const distanceToCenter = Math.sqrt(Math.pow(centerOfGravityX, 2) + Math.pow(centerOfGravityY, 2));

            // Create container for distance label and input
const distanceContainer = document.createElement('div');
distanceContainer.style.display = 'flex';
distanceContainer.style.justifyContent = 'flex-end'; // Align items to the right
distanceContainer.style.alignItems = 'center'; // Align items vertically centered

// Create label for distance
const distanceLabel = document.createElement('div');
distanceLabel.innerText = `DCG Graph ${index + 1}:`;
distanceLabel.className = 'text-sm font-medium';
 distanceLabel.style.marginTop = '-70px'; // Add top padding
// distanceLabel.style.marginRight = '-270px'; // Add right padding
distanceContainer.appendChild(distanceLabel);

// Create input for distance
const distanceInput = document.createElement('input');
distanceInput.type = 'text';
distanceInput.value = distanceToCenter.toFixed(2); // Set value to calculated distance
distanceInput.placeholder = ' ';
distanceInput.readOnly = true; // Make it read-only
// Updated styling with reduced width
distanceInput.className = 'border border-gray-5000 p-2 rounded-md w-20 mr-2'; // Adjust the width and margin as needed
distanceLabel.style.marginRight = '-270px'; // Add right padding
distanceInput.style.border = '1px solid #555555';
distanceContainer.appendChild(distanceInput);

// Append the distance container to your graph container
newGraphContainer.appendChild(distanceContainer);

const pointsLabel = document.createElement('div');
pointsLabel.innerText = 'Points';
pointsLabel.className = 'text-sm font-medium ml-36 mt-24 '; // Move to the right
inputContainer.appendChild(pointsLabel);

const pointsInput = document.createElement('input');
pointsInput.type = 'text';
pointsInput.value = isConstantGraph ? '' : points; // Set initial value based on constant graph
pointsInput.placeholder = ' ';
pointsInput.oninput = (e) => setPoints(e.target.value);
// Updated styling with reduced width and moved to the right
pointsInput.className = 'border border-gray-300 p-2 rounded-md w-9 mb-22 ml-36';
pointsInput.style.border = '1px solid #555555';
inputContainer.appendChild(pointsInput);

            const filterLabel = document.createElement('div');
            filterLabel.innerText = 'Filter';
            filterLabel.className = 'text-sm font-medium ml-36 mt-22'; // Adjust text size and font weight as needed
            inputContainer.appendChild(filterLabel);
          
            const filterInput = document.createElement('input');
            filterInput.type = 'text';
            filterInput.value = isConstantGraph ? '1' : filter; // Set initial value based on constant graph
            filterInput.placeholder = ' ';
            filterInput.oninput = (e) => setFilter(e.target.value);
            filterInput.className = 'border border-gray-300 p-2 rounded-md w-9  ml-36';
            filterInput.style.marginBottom = '36px !important';


            filterInput.style.border = '1px solid #555555';
            inputContainer.appendChild(filterInput);
          
            const graphElement = document.createElement('div');
            graphElement.style.width = '80%';

            newGraphContainer.appendChild(graphElement);
  
            // The traceZeroPoint logic is updated inside the Plotly.newPlot function call
            if (showZeroPoint) {
              const traceZeroPoint = {
                x: [0],
                y: [0],
                mode: 'markers',
                type: 'scatter',
                marker: {
                  symbol: 'circle',
                  color: '#FF0000', // Set a different color for the zero point
                  size: 10,
                },
              };
  
              Plotly.newPlot(graphElement, [trace, traceZeroPoint], layout, config);
            } else {
              Plotly.newPlot(graphElement, [trace], layout, config);
            }
          }
        }
  
        container.appendChild(rowContainer);
      }
    }
  }, [showGraph, graphData, graphLimits, calculateValues, showZeroPoint]);


  const handlePointCalculatorClick = () => {
    setShowPointCalculatorPopup(true);
  };
  const handlePointCalculatorPopupClose = () => {
    setShowPointCalculatorPopup(false);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isVisible ? '' : 'hidden'}`}>
      <div className="bg-white p-2 rounded-md flex flex-col w-full max-w-8xl " onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex">
          <div className="flex-1" ref={graphContainerRef}>
            <div id="graph-container"></div>
          </div>
          <div className="ml-8">
            <label htmlFor="folderInput" className="block">Folder of polarplot files: </label>
            <div style={{ display: "flex", border: "1px solid #555555", }}>
              <label className="inline-block w-6 h-6" onClick={handleFolderSelect}> 📁</label>
              <div className="mt-2">
                <input id="folderInput" type="text" readOnly value={folderPath}className="border border-gray-300 p-2 rounded-md w-full"
                  style={{ border: '1px solid #555555' }}/>
              </div>
            </div>
            {/* <div id="inputContainer"></div>  */}
            <label>List of polarplot Files:</label>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid black', padding: '5px' }}>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {selectedFolderFiles.map((file, index) => (
                  <li key={index} style={{ padding: '5px 0' }}>
                    <label>
                      <input type="checkbox"checked={selectedFolderCheckboxes[file.name] || false} onChange={() => handleCheckboxChange(file)}/>
                      {file.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            {showPopup && <PopupMessage message={popupMessage} onClose={closePopup} />}
            <button  className="mt-4 bg-gray-300 text-black hover:bg-gray-400 px-4 py-2 rounded"onClick={onClose}  style={{ width: '200px', height: '30px' }}>Exit</button>
            <button
              className={`block mt-4 ${showAngleCalculator ? 'bg-green-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded'}`}
              onClick={handleToggleAngleCalculator}
              style={{ width: '200px', height: '40px' }}>
              {showAngleCalculator ? 'Hide Angle Calculator' : 'Show Angle Calculator'}
            </button>
            <button
              className={`block mt-4 ${showPointCalculatorPopup ? 'bg-green-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded'}`}
              onClick={handlePointCalculatorClick} style={{ width: '200px', height: '50px' }}>
              Point Calculator at stress
            </button>
            <button
  className={`block mt-4 ${showZeroPoint ? 'bg-green-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-1 rounded'}`}
  onClick={() => setShowZeroPoint(!showZeroPoint)}
  style={{ width: '200px', height: '30px' }}
>
  {showZeroPoint ? 'Hide Zero Point' : 'Show Zero Point'}
</button>
            <button
              className={`block mt-4 ${showZeroPointCalculatorPopup ? 'bg-green-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-1 rounded'}`}
              onClick={handleZeroPointCalculatorClick} style={{ width: '200px', height: '50px' }}>
              Point Calculator at zero point
            </button>
            <button
              className={`block mt-4 ${showValueCalculator ? 'bg-green-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded'}`}
              onClick={handleToggleValueCalculator} style={{ width: '200px', height: '40px' }}>
              {showValueCalculator ? 'Value Calculator On' : 'Value Calculator Off'}
            </button>
{/*         
            <button
            className={`block mt-4 bg-gray-300 text-black hover:bg-gray-400 px-6 py-2 rounded`}
            onClick={calculateCenterOfGravity}
            style={{ width: '200px', height: '30px' }}
          >
            Distance at Stress (All Graphs)
          </button> */}
            
            <button
          className="mt-4 bg-gray-300 text-blackbg-opacity-50 flex items-center justify-center hover:bg-blue-600 px-6 py-2 roundedwidth: '200px', height: '30px' font-bold text-lg"
          onClick={async () => {
            await generateReport();
          }}
        >
           Report
        </button>

            {showValueCalculator && (
              <div className="mt-4">
              </div>
            )}
          </div>
        </div>
        {showPointCalculatorPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-md">
                <div className="flex justify-end">
                  <button className="text-red-500 hover:text-red-700" onClick={handlePopupClose}>X</button>
                </div>
                <p>Please click on the stress point first.</p>
                <div className="flex justify-center">
                <button className="bg-blue-500 text-white mt-2" onClick={handlePointCalculatorPopupClose}>OK</button>
                </div>
              </div>
            </div>
          )}
          {showZeroPointCalculatorPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-md">
                <div className="flex justify-end">
                  <button className="text-red-500 hover:text-red-700" onClick={handleZeroPointCalculatorPopupClose}>X</button>
                </div>
                <p>Please click on the zero point first.</p>
                <div className="flex justify-center">
                <button className="bg-blue-500 text-white mt-2" onClick={handleZeroPointCalculatorPopupClose}>OK</button>
              </div>
              </div>
            </div>
          )}
        </div>
       
      </div>
);
          
};

export default GraphicPolarPlot;