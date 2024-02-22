// SaveDownloadSection.js
import React, { useState } from 'react';

const SaveDownloadRecords = ({ savedFiles, selectedFiles, onCheckboxChange }) => {
const [fileToDelete, setFileToDelete] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
  const formatChartDataForDownload = (chartData) => {
    // Your existing code for formatting data for download
    // ...
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
  return (
    <div>
      <button
        onClick={handleSaveRecords}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer mt-4"
        style={{ position: 'relative', top: '530px', left: '215px', height: '42px', width: '150px' }}
      >
        Save Records
      </button>
      <div className='list_file' >
        <table className="min-w-full border-collapse border border-gray-300 mt-4" style={{ position: 'relative', top: '100%', right: '110%' }}>
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
                    onChange={() => onCheckboxChange(file.fileName)}
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
      {!showConfirmation && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md">
            <p>Are you sure you want to delete {fileToDelete}?</p>
            <button className="bg-red-500 text-white px-2 py-1 m-2" onClick={() => setShowConfirmation(true)}>
              Yes
            </button>
            <button className="bg-gray-300 px-2 py-1 m-2" onClick={() => setShowConfirmation(false)}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveDownloadRecords;
