

interface PageControllerProps{
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;

}


export default function PageController({currentPage, totalPages,setCurrentPage}: PageControllerProps){
    return(

        <div>
            {/* PAGINAÇÃO */}
            <div className="flex justify-end mt-6 gap-2">
                <button
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                >
                Anterior
                </button>
                <input
                    type="text"
                    placeholder="Page"
                    className="border px-2 py-1 rounded w-16 text-sm"
                />
                {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                >
                    {i + 1}
                </button>
                ))}

                <button
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                >
                Próxima
                </button>
            </div>


        </div>
    )
}