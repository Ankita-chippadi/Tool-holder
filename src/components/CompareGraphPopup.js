import React, { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist';

const CompareGraphPopup = ({ selectedFiles, setSelectedFiles, onClose }) => {
    const [selectedYAxis, setSelectedYAxis] = useState('tension');
    const [selectedFilesData, setSelectedFilesData] = useState({});
    const [selectedFilesToDelete, setSelectedFilesToDelete] = useState([]);

    useEffect(() => {
        handleCompare(); // Initial graph rendering when component mounts
    }, [selectedYAxis, selectedFiles]); // Re-render graph when selected y-axis or selected files change

    const parseSavedFileData = (filesData) => {
        const parsedFilesData = filesData.map(fileData => {
            const lines = fileData.trim().split('\n');
            // Check if the file is in the expected format
            if (lines.length > 1 && lines[1].startsWith('time;')) {
                return lines.slice(1).map((line) => {
                    const values = line.split(';');
                    return {
                        tension: parseFloat(values[0]),
                        torsion: parseFloat(values[1]),
                        bendingMomentX: parseFloat(values[2]),
                        bendingMomentY: parseFloat(values[3]),
                        time: parseFloat(values[4]),
                        temperature: parseFloat(values[5]),
                    };
                });
            } else {
                // Return empty array for non-data files
                return [];
            }
        });
        return parsedFilesData;
    };
    
    
    const handleCompare = async () => {
        try {
            const parsedFilesData = await Promise.all(selectedFiles.map(readAndParseFile));
            console.log('Parsed Files Data:', parsedFilesData);
            
            // Extract x and y data for the selected y-axis
            const xData = parsedFilesData[0].map((item) => item.time);
            const yData = parsedFilesData.map((fileData) => fileData.map((item) => item[selectedYAxis]));

            const traces = yData.map((yValues, index) => ({
                type: 'scatter',
                mode: 'lines',
                name: `File ${index + 1}`,
                x: xData,
                y: yValues,
            }));

            const layout = {
                title: `Comparison of ${selectedYAxis.replace('-', ' ')} over Time`,
                xaxis: {
                    title: 'Time',
                },
                yaxis: {
                    title: selectedYAxis.replace('-', ' '),
                },
            };

            Plotly.newPlot('compare-graph', traces, layout);
        } catch (error) {
            console.error('Error plotting graph:', error);
        }
    };
    const readAndParseFile = async (file) => {
      try {
          const response = await fetch(file); // Assuming the files are accessible via HTTP(S) URLs
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('text')) {
              const fileData = await response.text();
              console.log('Fetched file data:', fileData); // Log the fetched file data
              return parseSavedFileData(fileData);
          } else {
              console.error(`Error reading or parsing file ${file}: The file is not of text type.`);
              return [];
          }
      } catch (error) {
          console.error(`Error reading or parsing file ${file}:`, error);
          return []; // Return empty array if there's an error
      }
  };
   
  // Handle radio button change
  const handleYAxisChange = (e) => {
    setSelectedYAxis(e.target.value);
  };
// Handle checkbox change
const handleCheckboxChange = (fileName) => {
    setSelectedFilesToDelete((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(fileName)) {
        return prevSelectedFiles.filter((selectedFile) => selectedFile !== fileName);
      } else {
        return [...prevSelectedFiles, fileName];
      }
    });
  };
  const handleDeleteSelectedFiles = (e) => {
    e.preventDefault(); // Prevent the default button click behavior
  
    // Update selectedFilesData based on the new selectedFiles state
    const updatedSelectedFilesData = { ...selectedFilesData };
    const updatedSelectedFiles = selectedFiles.filter((file) => !selectedFilesToDelete.includes(file));
    setSelectedFiles(updatedSelectedFiles); // Update selectedFiles state

    // Remove data of the deleted files from selectedFilesData
    selectedFilesToDelete.forEach((file) => {
        delete updatedSelectedFilesData[file];
    });

    setSelectedFilesData(updatedSelectedFilesData);
};
console.log('Selected Files:', selectedFiles);
  return (
    <div className="compare-graph-popup">
    <div className="popup-header">
      <h2>Compare Graph</h2>
      <button onClick={onClose}>Close</button>  
    </div>
      <div className="radio-buttons">
        <label>
          <input type="radio" name="y-axis" value="tension" checked={selectedYAxis === 'tension'} onChange={handleYAxisChange} /> Tension
        </label>
        <label>
          <input type="radio" name="y-axis" value="torsion" checked={selectedYAxis === 'torsion'} onChange={handleYAxisChange} /> Torsion
        </label>
        <label>
          <input type="radio" name="y-axis" value="bending-moment-x" checked={selectedYAxis === 'bending-moment-x'} onChange={handleYAxisChange} /> Bending Moment X
        </label>
        <label>
          <input type="radio" name="y-axis" value="bending-moment-y" checked={selectedYAxis === 'bending-moment-y'} onChange={handleYAxisChange} /> Bending Moment Y
        </label>
        <label>
          <input type="radio" name="y-axis" value="temperature" checked={selectedYAxis === 'temperature'} onChange={handleYAxisChange} /> Temperature
        </label>
      </div>
      {/* <button onClick={handleCompare}>Compare</button> */}
        <div id="compare-graph" className="plotly-chart"></div>
        <div className="selected-files-table">
          <h3>Selected Files</h3>
          <table className="border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">File Name</th>
                <th className="px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {selectedFiles.map((file, index) => (
                <tr key={index} className="bg-white">
                  <td className="px-4 py-2">{file}</td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(file)}
                      checked={selectedFilesToDelete.includes(file)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleDeleteSelectedFiles} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2">Delete Selected Files</button>
        </div>
      </div>
    );
};

export default CompareGraphPopup;
