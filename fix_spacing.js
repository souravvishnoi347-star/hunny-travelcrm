const fs = require('fs');
const file = 'src/app/itinerary-builder/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
\        {/* Top Decorative Chevron Accent Bar */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-1">
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
          <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ UTTARAKHAND OFFICIAL PILGRIMAGE DOSSIER ✦</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
        </div>

        {/* Floating Brand Header Pill */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xs border border-amber-200/90 shadow-md rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img src="/logo.png" alt="Traymbhkam Tour and Travels" className="h-14 w-auto object-contain shrink-0 drop-shadow-xs" />
            <div className="min-w-0">
              <h2 className="text-[17px] font-serif-luxury font-black tracking-tight text-[#0f2744] leading-tight uppercase">
                Traymbhkam Tour and Travels
              </h2>
              <p className="text-[9.5px] font-display font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="bg-[#0f2744] text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider shadow-2xs">
              ✦ 2026 OFFICIAL ITINERARY ✦
            </div>
            <p className="text-[9px] text-gray-500 font-medium mt-1">Haridwar Central Operations Desk</p>
          </div>
        </div>

        {/* Central Grand Hero Showcase: Rectangular Master Frame (No Circle) */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1 w-full">\,
\        {/* Top Decorative Chevron Accent Bar */}
        <div className="relative z-10 w-full flex items-center justify-between gap-3 mb-3">
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
          <span className="text-[11px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ UTTARAKHAND OFFICIAL PILGRIMAGE DOSSIER ✦</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
        </div>

        {/* Floating Brand Header Pill */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xs border border-amber-200/90 shadow-md rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <img src="/logo.png" alt="Traymbhkam Tour and Travels" className="h-20 w-auto object-contain shrink-0 drop-shadow-xs" />
            <div className="min-w-0">
              <h2 className="text-[22px] font-serif-luxury font-black tracking-tight text-[#0f2744] leading-tight uppercase">
                Traymbhkam Tour and Travels
              </h2>
              <p className="text-[10px] font-display font-bold text-amber-700 uppercase tracking-widest mt-1">
                Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="bg-[#0f2744] text-amber-300 border border-amber-400/40 px-4 py-1.5 rounded-full text-[11px] font-display font-bold uppercase tracking-wider shadow-2xs">
              ✦ 2026 OFFICIAL ITINERARY ✦
            </div>
            <p className="text-[10px] text-gray-500 font-bold mt-1.5">Haridwar Central Operations Desk</p>
          </div>
        </div>

        {/* Central Grand Hero Showcase: Rectangular Master Frame (No Circle) */}
        <div className="relative z-10 flex flex-col items-center justify-center mt-6 mb-auto py-1 w-full">\
);

fs.writeFileSync(file, content);
