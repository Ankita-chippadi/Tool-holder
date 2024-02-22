import React, { useState } from 'react';

const RollingAverageControls = ({ onUpdateSettings }) => {
  const [windowSize, setWindowSize] = useState(100); // Default window size
  const [calculationType, setCalculationType] = useState('mean'); // Default calculation type
  const [isAveragingOn, setIsAveragingOn] = useState(false);

  const handleWindowSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setWindowSize(newSize);
    onUpdateSettings({ windowSize: newSize, calculationType, isAveragingOn });
  };

  const handleCalculationTypeChange = (e) => {
    const newType = e.target.value;
    setCalculationType(newType);
    onUpdateSettings({ windowSize, calculationType: newType, isAveragingOn });
  };

  const handleAveragingToggle = () => {
    const newAveragingState = !isAveragingOn;
    setIsAveragingOn(newAveragingState);
    onUpdateSettings({ windowSize, calculationType, isAveragingOn: newAveragingState });
  };

  return (
    <div>
      <label>
        Window Size:
        <input
          type="number"
          value={windowSize}
          onChange={handleWindowSizeChange}
          min={1}
          max={100}
        />
      </label>
      <label>
  Calculation Type:
  <select value={calculationType} onChange={handleCalculationTypeChange}>
    <option value="mean">Mean</option>
    <option value="median">Median</option>
    <option value="mode">Mode</option>
  </select>
</label>
      <label>
        Averaging:
        <input type="checkbox" checked={isAveragingOn} onChange={handleAveragingToggle} />
      </label>
    </div>
  );
};

export default RollingAverageControls;
