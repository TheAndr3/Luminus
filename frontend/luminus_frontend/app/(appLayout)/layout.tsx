'use client';

import Sidebar from "../../components/sidebar/sidebar"; 

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div> 
      <Sidebar />
      <div className="pl-20">
        <div className="flex h-screen">
          <div className="flex w-16 items-center justify-center">
            <div className="flex flex-col items-center text-lg text-gray-400">
              <span>L</span>
              <span>U</span>
              <span>M</span>
              <span>I</span>
              <span>N</span>
              <span>U</span>
              <span>S</span>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto rounded-tl-2xl rounded-bl-2xl border-l border-[#000000] bg-white shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)]">
          <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}