  // components/StudentRow.tsx
  export function StudentRow({ name, id }: { name: string; id: string }) {
    return (
      <div className="flex items-center w-full bg-[--color-sidebar-primary] text-[--color-sidebar-primary-foreground] rounded mb-2 px-4 py-2">
        <input type="checkbox" className="mr-4" />
        <span className="text-2xl mr-4">👤</span>
        <div className="flex justify-between w-full">
          <span>{name}</span>
          <span>{id}</span>
        </div>
      </div>
    );
  }