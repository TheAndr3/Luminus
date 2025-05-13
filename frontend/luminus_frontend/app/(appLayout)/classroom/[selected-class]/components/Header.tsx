// components/Header.tsx
export function Header({ title, color }: { title: string; color?: string }) {
    return (
      <div className={`bg-[${color}] text-white text-[22px] font-bold p-4 rounded h-35 text-bottom`}>
          {title}
      </div>
    );
  }