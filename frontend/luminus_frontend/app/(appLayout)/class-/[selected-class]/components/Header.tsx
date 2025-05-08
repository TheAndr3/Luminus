// components/Header.tsx
export function Header({ title, color }: { title: string; color?: string }) {
    return (
      <header
        className={`w-full p-8 flex h-screen items-center text-white ${color ?? 'bg-[--color-primary]'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white text-black rounded px-3 py-1 text-sm">Adicionar Dossiê</button>
          <button className="bg-white text-black rounded-full p-2">
            ✏️
          </button>
        </div>
      </header>
    );
  }