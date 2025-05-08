  // components/Controls.tsx
  export function Controls() {
    return (
      <div className="flex justify-end gap-2 py-4">
        <button className="bg-[--color-accent] text-[--color-accent-foreground] px-4 py-2 rounded">Adicionar Aluno ➕</button>
        <button className="bg-[--color-secondary] text-[--color-secondary-foreground] px-4 py-2 rounded">Importar CSV ⬇️</button>
      </div>
    );
  }
  