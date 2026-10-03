const fs = require('fs');
const file = 'src/app/hotels/page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('generateNextDocNumber')) {
  content = content.replace('saveDocumentToHub', 'saveDocumentToHub, generateNextDocNumber');
}

// Replace Clear button for Single Voucher
content = content.replace(/<button\\s*onClick=\\{\\(\\) => updateData\\(BLANK_VOUCHER\\)\\}\\s*className="flex items-center gap-1\\.5 text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-2\\.5 py-1\\.5 rounded-lg transition cursor-pointer border border-gray-200"\\s*title="Clear all fields and start fresh"\\s*>\\s*<RotateCcw className="w-3\\.5 h-3\\.5" \\/>\\s*Clear\\s*<\\/button>/,
\<button
                  onClick={() => {
                    const nextNum = generateNextDocNumber("hotel_voucher", "BILL NO. 001");
                    updateData({ ...BLANK_VOUCHER, voucherNo: nextNum });
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-sky-200"
                  title="Create new voucher with auto-generated number"
                >
                  <FilePlus2 className="w-3.5 h-3.5" />
                  New
                </button>\
);

// We need FilePlus2 import
if (!content.includes('FilePlus2')) {
  content = content.replace('RotateCcw,', 'RotateCcw, FilePlus2,');
}

fs.writeFileSync(file, content);
