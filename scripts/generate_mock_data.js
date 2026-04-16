const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');

const scenarios = [
  { gender: 'male', activity: 'low' },
  { gender: 'male', activity: 'high' },
  { gender: 'female', activity: 'low' },
  { gender: 'female', activity: 'high' }
];

const postures = ['Standing', 'Sitting', 'Lying', 'Walking', 'Running'];

function generateCSV(scenario) {
  const fileName = `${scenario.gender}_${scenario.activity}.csv`;
  const filePath = path.join(dataDir, fileName);
  
  let content = 'timestamp,heart_rate,spo2,breathing_rate,gsr,temperature,dehydration_index,posture,fall_detected,steps\n';
  
  let currentSteps = 0;
  for (let i = 0; i < 600; i++) { // 10 minutes at 1Hz
    const timestamp = i;
    let hr, spo2, br, gsr, temp, dehyd, posture, fall;
    
    if (scenario.activity === 'low') {
      hr = 60 + Math.random() * 20;
      spo2 = 97 + Math.random() * 3;
      br = 12 + Math.random() * 4;
      gsr = 2 + Math.random() * 2;
      temp = 36.5 + Math.random() * 0.5;
      dehyd = 1 + Math.random() * 1;
      posture = Math.random() > 0.8 ? 'Sitting' : 'Standing';
      if (Math.random() > 0.1 && scenario.gender === 'male' && i > 100 && i < 110) posture = 'Walking';
    } else {
      hr = 100 + Math.random() * 60;
      spo2 = 94 + Math.random() * 5;
      br = 20 + Math.random() * 15;
      gsr = 10 + Math.random() * 10;
      temp = 37.5 + Math.random() * 1.5;
      dehyd = 4 + Math.random() * 4;
      posture = Math.random() > 0.5 ? 'Running' : 'Walking';
      currentSteps += Math.floor(Math.random() * 3);
    }
    
    fall = i === 450 ? 'true' : 'false'; // A fall at 7:30
    if (fall === 'true') posture = 'Lying';

    content += `${timestamp},${hr.toFixed(1)},${spo2.toFixed(1)},${br.toFixed(1)},${gsr.toFixed(2)},${temp.toFixed(1)},${dehyd.toFixed(1)},${posture},${fall},${currentSteps}\n`;
    
    if (scenario.activity === 'low' && Math.random() > 0.95) currentSteps++;
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Generated ${fileName}`);
}

scenarios.forEach(generateCSV);
