const fs = require('fs');
const file = 'src/lib/supabase.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('setTimeout(() => controller.abort(), 2000)', 'setTimeout(() => controller.abort(), 8000)');
fs.writeFileSync(file, content);
