const fs = require('fs');
const file = 'src/app/hotels/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace checkIn date input
content = content.replace(/<input\s+type="date"\s+className="w-7 h-7 p-0 border border-gray-200 rounded bg-gray-50 cursor-pointer shrink-0 text-xs"\s+title="Pick Check-In Date"\s+onChange=\{\(e\) => \{/g,
\<div className="relative w-7 h-7 bg-sky-50 border border-sky-200 rounded flex items-center justify-center shrink-0 cursor-pointer hover:bg-sky-100 transition" title="Pick Check-In Date">
                          <Calendar className="w-3.5 h-3.5 text-sky-700" />
                          <input
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {\);

content = content.replace(/updateStay\(idx, \{ checkIn: \\\\\\$\\\{d\\\}\\/\\\$\\\{m\\\}\\/\\\$\\\{y\\\} \\\$\\\{timePart\\\}\\\ \}\);\s+\}\}\s+\/>/g,
\updateStay(idx, { checkIn: \\\\\\$\\\{d\\\}/\\\$\\\{m\\\}/\\\$\\\{y\\\} \\\$\\\{timePart\\\}\\\ });
                          }}
                        />
                        </div>\);

// Replace checkOut date input
content = content.replace(/<input\s+type="date"\s+className="w-7 h-7 p-0 border border-gray-200 rounded bg-gray-50 cursor-pointer shrink-0 text-xs"\s+title="Pick Check-Out Date"\s+onChange=\{\(e\) => \{/g,
\<div className="relative w-7 h-7 bg-sky-50 border border-sky-200 rounded flex items-center justify-center shrink-0 cursor-pointer hover:bg-sky-100 transition" title="Pick Check-Out Date">
                          <Calendar className="w-3.5 h-3.5 text-sky-700" />
                          <input
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {\);

content = content.replace(/updateStay\(idx, \{ checkOut: \\\\\\$\\\{d\\\}\\/\\\$\\\{m\\\}\\/\\\$\\\{y\\\} \\\$\\\{timePart\\\}\\\ \}\);\s+\}\}\s+\/>/g,
\updateStay(idx, { checkOut: \\\\\\$\\\{d\\\}/\\\$\\\{m\\\}/\\\$\\\{y\\\} \\\$\\\{timePart\\\}\\\ });
                          }}
                        />
                        </div>\);


fs.writeFileSync(file, content);
