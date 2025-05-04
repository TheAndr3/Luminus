import { useRef } from "react"
import { Button } from "@/components/ui/button"

export function ImportCSVButton() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={inputRef}
        className="hidden"
      />
      <Button onClick={handleClick} className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-2 py-1 h-7">
        Importar CSV
      </Button>
    </>
  )
}
