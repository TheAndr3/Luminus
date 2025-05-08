  // components/SearchBar.tsx
  export function SearchBar({ placeholder }: { placeholder?: string }) {
    return (
      <div className="w-full flex items-center gap-2 p-2">
        <input
          type="text"
          placeholder={placeholder ?? 'Search'}
          className="w-full border rounded px-4 py-2 focus:outline-none focus:ring"
        />
        <button className="text-lg">🔍</button>
      </div>
    );
  }
  