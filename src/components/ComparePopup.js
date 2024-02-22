import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

const ComparePopup = ({ selectedFilesDataArray, onClose, selectedFiles }) => {
    const [selectedVariable, setSelectedVariable] = useState('Tension');
    const [windowSize, setWindowSize] = useState(10); // Initial window size for rolling average
    const plotRef = useRef(null); // Reference to the plot container element

    useEffect(() => {
        // Extract time and selected variable data for plotting
        const timeData = [];
        const selectedVariableData = [];

        // Split the selectedFilesDataArray string into an array of rows
        const dataArray = selectedFilesDataArray.split('\n').map(row => row.split(';'));

        // Calculate the index of the selected variable
        const selectedVariableIndex = ['Tension', 'Torsion', 'Bending moment X', 'Bending moment Y', 'Temperature'].indexOf(selectedVariable);

        // Loop through each row of data
        dataArray.forEach((fileData, fileIndex) => {
            if (fileIndex !== 0) { // Skip the first row with column headers
                fileData.forEach((data, index) => {
                    if (index === 4) { // Check if it's the time column
                        timeData.push(parseFloat(data)); // Time is at index 4
                    } else if (index === selectedVariableIndex) { // Check if it's the selected variable column
                        selectedVariableData.push(parseFloat(data)); // Use the selected variable index
                    }
                });
            }
        });

        // Calculate rolling average
        const rollingAverage = calculateRollingAverage(selectedVariableData, windowSize);

        if (plotRef.current) {
            // Prepare data for the Plotly graph
            const plotData = {
                x: timeData,
                y: rollingAverage,
                type: 'scatter',
                mode: 'lines',
                marker: { color: 'blue' },
            };

            // Define layout for the Plotly graph
            const layout = {
                width: 1500,
                height: 700,
                title: 'Comparison Plot',
                xaxis: {
                    title: 'Time',
                    type: 'numeric',
                    tickformat: '%H:%M:%S,%L',
                    tickmode: 'array',
                    nticks: 20,
                },
                yaxis: {
                    title: `${selectedVariable} Rolling Average (Window Size: ${windowSize})`,
                    nticks: 20,
                },
            };

            // Render the Plotly line graph
            Plotly.newPlot(plotRef.current, [plotData], layout);
        }
    }, [selectedVariable, selectedFilesDataArray, windowSize]);

    const handleVariableChange = (variable) => {
        setSelectedVariable(variable);
    };

    const handleWindowSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setWindowSize(newSize);
    };

    // Function to calculate rolling average
    const calculateRollingAverage = (data, windowSize) => {
        const rollingAverage = [];
        for (let i = 0; i < data.length; i++) {
            const startIndex = Math.max(0, i - windowSize + 1);
            const valuesInWindow = data.slice(startIndex, i + 1);
            const average = valuesInWindow.reduce((acc, curr) => acc + curr, 0) / valuesInWindow.length;
            rollingAverage.push(average);
        }
        return rollingAverage;
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="bg-white border border-gray-300 p-4 rounded-lg shadow-lg w-80 h-80" style={{ width: '100%', height: '100%' }}>
                <h2 className="text-lg font-bold mb-4">Comparison Results</h2>
                {/* Render radio buttons for variable selection */}
                <div className="flex space-x-4 mb-4">
                    {['Tension', 'Torsion', 'Bending moment X', 'Bending moment Y', 'Temperature'].map(variable => (
                        <label key={variable} className="inline-flex items-center">
                            <input
                                type="radio"
                                value={variable}
                                checked={selectedVariable === variable}
                                onChange={() => handleVariableChange(variable)}
                                className="form-radio h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2">{variable}</span>
                        </label>
                    ))}
                </div>
                <div ref={plotRef} />
                {/* Input for window size */}
                <div className="mb-4" style={{position:'relative', width:'100px',height:'100px',left:'90%',bottom:'35%'}}>
                    <label className="block text-sm font-medium text-gray-700" style={{fontSize:'18px',textAlign:'center'}}> Average points:</label>
                    <input
                        type="number"
                        value={windowSize}
                        onChange={handleWindowSizeChange}
                        className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                {/* Container for the Plotly graph */}
                
                <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4">Close</button>
            </div>
            {/* Display selected files in table format */}
            <div className="absolute top-0 right-0 mt-4 mr-4" >
                <table className="border-collapse border border-gray-300" style={{position:'relative',top:'140px',right:'40px'}}>
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">File Name</th>
                            <th className="border border-gray-300 px-4 py-2">Selected</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedFiles.map((fileName, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 px-4 py-2">{fileName}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        readOnly
                                        className="form-checkbox h-5 w-5 text-blue-500"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparePopup;
