
// Mock API server for testing ESP8266 connection
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Mock Modbus data endpoint
app.get('/api/modbusData', (req, res) => {
  // Create mock data for 9 registers (9 silos)
  // Values represent empty space in centimeters
  const mockData = {
    reg1: 120, // 1.2 meters of empty space in silo 1
    reg2: 240, // 2.4 meters of empty space in silo 2
    reg3: 350, // 3.5 meters of empty space in silo 3
    reg4: 180, // 1.8 meters of empty space in silo 4
    reg5: 0,   // Silo 5 is full (no empty space)
    reg6: 520, // 5.2 meters of empty space in silo 6
    reg7: 430, // 4.3 meters of empty space in silo 7
    reg8: 290, // 2.9 meters of empty space in silo 8
    reg9: 150  // 1.5 meters of empty space in silo 9
  };
  
  res.json(mockData);
});

// Start server
app.listen(port, () => {
  console.log(`Mock ESP8266 API server running at http://localhost:${port}`);
});
