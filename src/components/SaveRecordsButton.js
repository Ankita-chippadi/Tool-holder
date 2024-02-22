import React, { useEffect, useState } from 'react';
import { formatChartDataForSave } from './saveDataUtils'; // Import the formatChartDataForSave function
import DeleteFilePopup from './DeleteFilePopup';
import ComparePopup from './ComparePopup';

const SaveRecordsButton = ({ savedFiles, setSavedFiles, data }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
 
    const [selectedFilesData, setSelectedFilesData] = useState({});
    const [comparePopupOpen, setComparePopupOpen] = useState(false);
    const dataArray = Object.values(selectedFilesData).map(fileDataString => fileDataString.split(';'));
 
    const formattedDataString = Object.keys(selectedFilesData).join(';') + '\n' + dataArray.map(row => row.join(';')).join('\n');

    console.log("Formatted data array:", formattedDataString);

    const handleCompare = () => {
        console.log("Compare button clicked");
        setComparePopupOpen(true);
    };

    const closeComparePopup = () => {
        setComparePopupOpen(false);
    };

    const handleCheckboxChange = (fileName) => {
        setSelectedFiles((prevSelectedFiles) => {
            if (prevSelectedFiles.includes(fileName)) {
                return prevSelectedFiles.filter((selectedFile) => selectedFile !== fileName);
            } else {
                return [...prevSelectedFiles, fileName];
            }
        });
    };

    const handleDownloadRecord = (file) => {
        // Create a Blob object from the file data
        const blob = new Blob([file.data], { type: 'text/plain' });

        // Create a URL for the Blob object
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;

        // Programmatically click the anchor element to trigger downloadav
        document.body.appendChild(a);
        a.click();

        // Cleanup: Remove the anchor element and revoke the URL
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDeleteFile = (fileName) => {
        setSavedFiles(savedFiles.filter(file => file.fileName !== fileName));
        setSelectedFiles(selectedFiles.filter(selectedFile => selectedFile !== fileName));
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

    useEffect(() => {
        console.log('Saved Files:', savedFiles);
    }, [savedFiles]);

    useEffect(() => {
        const fetchDataForSelectedFiles = () => {
            const data = {};
            selectedFiles.forEach(fileName => {
                const selectedFile = savedFiles.find(file => file.fileName === fileName);
                if (selectedFile) {
                    data[fileName] = selectedFile.data;
                }
            });
            setSelectedFilesData(data);
        };

        fetchDataForSelectedFiles();
    }, [selectedFiles, savedFiles]);
    useEffect(() => {
        console.log('Selected Files Data:', selectedFilesData);
        // Convert selectedFilesData into array format
        const dataArray = Object.values(selectedFilesData).map(fileDataString => fileDataString.split(';'));
        console.log("Array Data:", dataArray);
    }, [selectedFilesData]);

    return (
        <div>
            <button onClick={handleSaveRecords} className="border border-black text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black" style={{ position: 'relative', left: '85%', height: '40px', width: '150px', bottom: '30px' }}>Save Records</button>
            <button onClick={handleCompare} className="border border-black text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black" style={{ position: 'relative', left: '70%', height: '40px', width: '150px', bottom: '30px', marginTop: '10px' }}>Compare</button>
          {comparePopupOpen && (
    <ComparePopup
    selectedFiles={selectedFiles}
        selectedFilesDataArray={formattedDataString}
        onClose={closeComparePopup}
    />
)}

            <div className='list_file' style={{ position: 'relative', width: '200px', height: '100px', left: '74%', bottom: '30px' }} >
                <table className="min-w-full border-collapse border border-gray-300 mt-4" >
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
                                <td className="py-2 px-4">
                                    <DeleteFilePopup file={file} onDelete={handleDeleteFile} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        
           
        </div>
    );
};

export default SaveRecordsButton;
