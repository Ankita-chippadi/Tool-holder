// FilterComponent.js
import React, { useState, useEffect } from 'react';

const FilterComponent = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    tension: true,
    torsion: true,
    bendingMomentY: true,
    temperature: true,
  });

  const handleFilterChange = (columnName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnName]: !prevFilters[columnName],
    }));
  };

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div className="flex space-x-4" >
      <table className="table-auto border border-collapse min-w-min" style={{width:'300px'}}>
      <thead>
        <tr  style={{position:'relative',right:'50px'}}>
          <th className="px-4 py-2 border-b" >
            <label className="inline-flex items-center"  style={{position:'relative',right:'45px'}}>
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={filters.tension}
                onChange={() => handleFilterChange('tension')}
             
              />
              <span className="ml-2">Tension</span>
            </label>
          </th>
        </tr>
        <tr  style={{position:'relative',right:'50px'}}>
          <th className="px-4 py-2 border-b">
            <label className="inline-flex items-center" style={{position:'relative',right:'45px'}}>
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={filters.torsion}
                onChange={() => handleFilterChange('torsion')}
              />
              <span className="ml-2">Torsion</span>
            </label>
          </th>
        </tr>
        <tr  style={{position:'relative',right:'50px'}}>
          <th className="px-4 py-2 border-b">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={filters.bendingMomentY}
                onChange={() => handleFilterChange('bendingMomentY')}
              />
              <span className="ml-2">Bending Moment Y</span>
            </label>
          </th>
        </tr>
        <tr  style={{position:'relative',right:'50px'}}>
          <th className="px-4 py-2 border-b">
            <label className="inline-flex items-center" style={{position:'relative',right:'25px'}}>
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={filters.temperature}
                onChange={() => handleFilterChange('temperature')}
              />
              <span className="ml-2">Temperature</span>
            </label>
          </th>
        </tr>
      </thead>
    </table>
  </div>
  
  );
};

export default FilterComponent;
