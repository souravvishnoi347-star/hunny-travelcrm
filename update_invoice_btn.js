const fs = require('fs');
const file = 'src/app/invoices/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the Reset button logic
content = content.replace(/<button\\s*onClick=\\{\\(\\) => setData\\(DEFAULT_INVOICE_DATA\\)\\}\\s*className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-sky-600 bg-gray-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"\\s*title="Reset to default invoice data"\\s*>\\s*<RotateCcw className="w-3.5 h-3.5" \\/>\\s*Reset\\s*<\\/button>/,
\<button
              onClick={() => {
                const nextNum = generateNextDocNumber("invoice", DEFAULT_INVOICE_DATA.invoiceNumber);
                setData({ ...DEFAULT_INVOICE_DATA, invoiceNumber: nextNum });
                if (typeof window !== "undefined") {
                  localStorage.removeItem("traymbhkam_invoice_data");
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition cursor-pointer border border-sky-200"
              title="Create new invoice with auto-generated number"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              New Invoice
            </button>\
);

// We also need to add FilePlus2 to the lucide-react imports if it's not there.
if (!content.includes('FilePlus2')) {
  content = content.replace('RotateCcw,', 'RotateCcw, FilePlus2,');
}

fs.writeFileSync(file, content);
