  // components/Pagination.tsx
  export function Pagination() {
    return (
      <div className="flex items-center justify-end mt-6 gap-2">
        <button className="bg-[#101828] text-white px-3 py-1 rounded-full">
          1
        </button>
        <button className="border px-3 py-1 rounded-full">2</button>
        <button className="border px-3 py-1 rounded-full">3</button>
        <input
          type="text"
          placeholder="Page"
          className="border px-2 py-1 rounded w-16 text-sm"
        />
        <select className="border px-2 py-1 rounded text-sm">
          <option>20</option>
          <option>50</option>
          <option>100</option>
        </select>
        <button className="border px-3 py-1 rounded-full">Next</button>
      </div>
    );
  }