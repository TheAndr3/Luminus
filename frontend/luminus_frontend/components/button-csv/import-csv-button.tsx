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
      <Button onClick={handleClick} className="bg-gray-200 text-black hover:bg-gray-300 rounded-full px-4 py-2">
        Importar CSV
      </Button>
    </>
  )
}
