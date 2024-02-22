export const formatChartDataForSave = (chartData) => {
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
  const chartDataLines = lines.slice(dataIndex + 1); // Skip only the unit row, keep the header row

  // Join each line with semicolons to create a single row
  const formattedData = chartDataLines.map((line, index) => {
      // Add headers in the first row only
      if (index === 0) {
          return 'Tension;Torsion;Bending moment X;Bending moment Y;Time;Temperature';
      }
      return line.split(';').join(';');
  });

//   console.log('Formatted Data:', formattedData); // Add this line for debugging

  return formattedData.join('\n');
};
