const fs = require('fs');
const file = 'src/app/whatsapp-desk/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target =   return (
    <div className="space-y-4 pb-8">
      {/* Toast Alert */};

const replacement =   return (
    <div className="w-full relative">
      {/* --- MOBILE WHATSAPP UI (Shows only on mobile) --- */}
      <div className="block md:hidden -mx-4 -mt-4 bg-[#0b141a] min-h-[calc(100vh-4rem)] text-[#e9edef] font-sans flex flex-col relative pb-20">
        
        {/* WA Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h1 className="text-[22px] font-semibold text-[#e9edef]">WhatsApp</h1>
          <div className="flex items-center gap-5 text-[#aebac1]">
            <IndianRupee className="w-[22px] h-[22px]" />
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-4 mt-2 mb-3 bg-[#202c33] rounded-full flex items-center px-4 py-2 gap-3 text-[#8696a0]">
          <Search className="w-4 h-4" />
          <span className="text-[15px] font-normal">Ask Meta AI or Search</span>
        </div>

        {/* Filter Chips */}
        <div className="px-4 flex gap-2 overflow-x-auto hide-scrollbar mb-2">
          <div className="bg-[#111b21] border border-[#202c33] px-4 py-1.5 rounded-full text-sm text-[#00a884] bg-[#00a884]/10 shrink-0">All</div>
          <div className="bg-[#202c33] px-4 py-1.5 rounded-full text-sm text-[#8696a0] shrink-0">Unread 20</div>
          <div className="bg-[#202c33] px-4 py-1.5 rounded-full text-sm text-[#8696a0] shrink-0">Favourites</div>
          <div className="bg-[#202c33] px-4 py-1.5 rounded-full text-sm text-[#8696a0] shrink-0">Groups</div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isBot = lastMsg?.sender === "bot" || lastMsg?.sender === "agent";
            return (
              <div key={chat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] active:bg-[#202c33] cursor-pointer" onClick={() => setSelectedChatId(chat.id)}>
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                    <img src={\https://ui-avatars.com/api/?name=\&background=random\} alt={chat.customerName} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 border-b border-[#202c33] pb-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-[#e9edef] text-base font-normal truncate pr-2">{chat.customerName}</h3>
                    <span className="text-[#8696a0] text-xs shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isBot && <CheckCheck className="w-[14px] h-[14px] text-[#53bdeb] shrink-0" />}
                    <p className="text-[#8696a0] text-sm truncate">{lastMsg?.text || "Started conversation"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-4 w-12 h-12 bg-[#21c063] rounded-2xl flex items-center justify-center shadow-lg z-20 cursor-pointer">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#111b21]"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0b141a] border-t border-[#202c33] flex items-center justify-between px-2 z-30 pb-1">
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[#e9edef]">
            <div className="relative">
              <MessageSquare className="w-6 h-6 fill-current" />
              <div className="absolute -top-1 -right-2 bg-[#21c063] text-[#111b21] text-[10px] font-bold px-1.5 py-0.5 rounded-full">20</div>
            </div>
            <span className="text-[11px] font-medium">Chats</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[#8696a0]">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
            <span className="text-[11px] font-medium">Updates</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[#8696a0]">
            <Users className="w-6 h-6" />
            <span className="text-[11px] font-medium">Communities</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[#8696a0]">
            <Phone className="w-6 h-6" />
            <span className="text-[11px] font-medium">Calls</span>
          </div>
        </div>
      </div>

      {/* --- DESKTOP CRM UI (Shows only on desktop) --- */}
      <div className="hidden md:block space-y-4 pb-8">
        {/* Toast Alert */};

content = content.replace(target, replacement);

// Don't forget to close the new wrapper div at the end of the return statement
content = content.replace(
\      </div>
    </div>
  );
}\,
\      </div>
      </div>
    </div>
  );
}\
);

fs.writeFileSync(file, content);
