
// app/page.tsx ou page.tsx
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { StudentRow } from "./components/StudentRow";
import { Pagination } from "./components/Pagination";
import { Controls } from "./components/Controls";

export default function ClassPage() {
    return (
      <div className="max-w-4xl mx-auto border rounded-xl overflow-hidden">
        <Header title="Álgebra EXA 502" color="bg-pink-500" />
        <div className="px-4">
          <SearchBar placeholder="Search for class" />
          <Controls />
          <div className="py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <StudentRow
                key={i}
                name="Aluno da Silva e Silva"
                id="2222222222"
              />
            ))}
          </div>
          <Pagination />
        </div>
      </div>
    );
  }
  

