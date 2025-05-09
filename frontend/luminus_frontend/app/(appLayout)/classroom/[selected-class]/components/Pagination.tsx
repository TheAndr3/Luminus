  // components/Pagination.tsx
  export function Pagination() {
    return (
      <div className="flex items-center gap-2 justify-center mt-4">
        <button className="px-3 py-1 bg-gray-200 rounded">1</button>
        <button className="px-3 py-1 bg-gray-200 rounded">2</button>
        <button className="px-3 py-1 bg-gray-200 rounded">3</button>
        <input
          type="text"
          className="w-12 border rounded px-2 py-1 text-center"
          placeholder="..."
        />
        <button className="px-3 py-1 bg-gray-200 rounded">Next →</button>
      </div>
    );
  }
  