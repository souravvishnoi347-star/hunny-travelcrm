const fs = require('fs');
const files = [
  'src/app/hotels/page.tsx',
  'src/app/itinerary-builder/page.tsx',
  'src/app/rentals/page.tsx',
  'src/app/transport/page.tsx',
  'src/app/vendors/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Find <input type="date" className="sr-only"
  content = content.replace(/type="date"\s+className="sr-only"/g, 'type="date"\n                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"');
  
  // Ensure the parent <label> or <div> has relative if it has Calendar
  content = content.replace(/className="([^"]*flex items-center[^"]*)"([^>]*)>\s*<Calendar/g, (match, classes, rest) => {
    if (!classes.includes('relative')) {
      return \className="\ relative"\>\n                      <Calendar\;
    }
    return match;
  });

  fs.writeFileSync(file, content);
});
