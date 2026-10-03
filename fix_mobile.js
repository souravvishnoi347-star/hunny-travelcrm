const fs = require('fs');
const file = 'src/app/whatsapp-desk/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const injection = \        {/* Active Chat Overlay (Mobile) */}
        {isMobileChatOpen && activeChat && (
          <div className="absolute inset-0 z-50 bg-[#0b141a] flex flex-col">
            {/* Chat Header */}
            <div className="bg-[#202c33] px-2 py-2 flex items-center gap-3 shrink-0">
              <button onClick={() => setIsMobileChatOpen(false)} className="p-1 rounded-full text-[#aebac1] flex items-center">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden ml-1">
                  <img src={\https://ui-avatars.com/api/?name=\&background=random\} alt="avatar" className="w-full h-full" />
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-[#e9edef] font-medium text-[17px] leading-tight truncate">{activeChat.customerName}</h2>
                <p className="text-[#8696a0] text-xs truncate">tap here for contact info</p>
              </div>
              <div className="flex items-center gap-4 text-[#aebac1] px-2">
                <Phone className="w-5 h-5" />
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0b141a] bg-opacity-95" style={{ backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QNEW37mXk.png')", backgroundSize: 'cover', backgroundBlendMode: 'overlay' }}>
              <div className="flex flex-col gap-2">
                {activeChat.messages.map(msg => {
                  const isCust = msg.sender === "customer";
                  return (
                    <div key={msg.id} className={\lex \\}>
                      <div className={\max-w-[85%] rounded-lg px-3 py-1.5 \\}>
                        <p className="text-[15px] leading-snug whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[11px] text-white/60">{msg.timestamp}</span>
                          {!isCust && <CheckCheck className="w-[14px] h-[14px] text-[#53bdeb]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="bg-[#202c33] px-2 py-2 flex items-center gap-2 shrink-0 pb-3">
              <div className="flex-1 bg-[#2a3942] rounded-full flex items-center px-3 py-2 gap-3 min-h-[44px]">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#8696a0] shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                <input type="text" placeholder="Message" className="flex-1 bg-transparent border-none focus:outline-none text-[#e9edef] text-[15px] placeholder-[#8696a0]" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#8696a0] shrink-0"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#8696a0] shrink-0"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </div>
              {replyText ? (
                <button onClick={handleSendReply} className="w-[44px] h-[44px] rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 text-[#111b21] ml-1" />
                </button>
              ) : (
                <div className="w-[44px] h-[44px] rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#111b21]"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- DESKTOP CRM UI (Shows only on desktop) --- */}
\;

content = content.replace(
\      </div>

      {/* --- DESKTOP CRM UI (Shows only on desktop) --- */}\,
  injection
);

fs.writeFileSync(file, content);
