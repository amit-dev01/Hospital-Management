"use client";

export default function SidebarHeader({ title = "", role = "doctor" }) {
  const isDoctor = role === "doctor";
  
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center w-full shadow-sm">
      <div className="flex items-center flex-1 max-w-xl">
        {title ? (
          <h2 className="text-xl font-bold text-slate-900 dark:text-white hidden md:block">{title}</h2>
        ) : (
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
              placeholder="Search patients, records, or doctors..."
              type="text"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 ml-6">
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">
              {isDoctor ? "Dr. Sarah Johnson" : "Admin User"}
            </p>
            <p className="text-[11px] text-sky-600 font-semibold uppercase tracking-tighter">
              {isDoctor ? "Cardiologist" : "Chief Medical Officer"}
            </p>
          </div>
          <img 
            alt="Profile Picture" 
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
            src={isDoctor 
              ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBNMRsK_Cy9q2kL_IfiQSBJ71EABp9hB0dff0xFl2BGbjHN_JjkMSObWWmkVJqQG4k-d0ttUP4GoFoNSnFzJVZl0RpvoRzgVxtNsdL6sP8j61B1utMqndhsYLWdsxcbvz3SuRheRxOsgDU_1axViUCCwF2-ydm7599llN31Iggvj5yhjXZDtkm05rakDT8tzXHGc3XVfHQvV_xO1Kz8Nd5c_LaQtTWHLXRWeP4Ao9RVQSSA4EkQORfczt44cvSvPMBBbqCtm0U4AlKi"
              : "https://lh3.googleusercontent.com/aida-public/AB6AXuAm325kRxo0KbDlHlhJGiT3JAytdjc-EMsgFC38sM7J0K0znjjku5Y-WpzOIY7EywRRwy0t-Y_s01KtCUKec3elvTiIduOs_E7gBKADojIVFAQWqoHFpjaNdCZtiRKSjFHX6xa87qtvpWDzfC0X6VmXEaUra17zUEsLGeRvqn02CtE1Mjad7Uwj1VqyYYnznWxb6iIwMLuOSmbc1iRih4mx1g7J4H3xlCsICllNF5M0vcM9SDMb5kWGbE0GSFp_fna6pfQMVzYq7Cm1"
            }
          />
        </div>
      </div>
    </header>
  );
}
