const fs = require('fs');
const file = 'src/app/whatsapp-desk/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onClick=\{\(\) => setSelectedChatId\(chat\.id\)\}/g,
  "onClick={() => { setSelectedChatId(chat.id); setIsMobileChatOpen(true); }}"
);

fs.writeFileSync(file, content);
