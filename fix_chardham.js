const fs = require('fs');
const file = 'src/app/itinerary-builder/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace prices with empty string
code = code.replace(/\"price\": \"₹ 28,500 \/ Pax\"/g, '\"price\": \"\"');
code = code.replace(/\"price\": \"₹ 32,500 \/ Pax\"/g, '\"price\": \"\"');
code = code.replace(/\"price\": \"₹ 19,500 \/ Pax\"/g, '\"price\": \"\"');

fs.writeFileSync(file, code);
