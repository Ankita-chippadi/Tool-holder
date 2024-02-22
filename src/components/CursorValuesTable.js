// CursorValuesTable.js
import React, { useState, useEffect } from 'react';

// const InitialTable = () => {
//   return (
//     <table className="min-w-full border-collapse border border-gray-300">
//       <thead className="bg-gray-100"></thead>
//       <tbody>
//         <tr>
//           <td className="py-2 px-4 border">Tension: 0</td>
//           <td className="py-2 px-4 border">Torsion: 0</td>
//           <td className="py-2 px-4 border">Bending Moment Y: 0</td>
//           <td className="py-2 px-4 border">Temperature: 0</td>
//         </tr>
//         <tr>
//           <td className="py-2 px-4 border">X Axis: 0</td>
//         </tr>
//       </tbody>
//     </table>
//   );
// };

const CursorValuesTable = ({ cursorValues }) => {
    console.log('Received Cursor Values:', cursorValues);
  const [dynamicValues, setDynamicValues] = useState([]);

  useEffect(() => {
    // Update dynamic values based on cursorValues
    setDynamicValues(cursorValues);
  }, [cursorValues]);

  return (
    <div>
      {/* <InitialTable /> */}
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100"></thead>
        <tbody>
          {dynamicValues.map((values, index) => (
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
    </div>
  );
};

export default CursorValuesTable;
