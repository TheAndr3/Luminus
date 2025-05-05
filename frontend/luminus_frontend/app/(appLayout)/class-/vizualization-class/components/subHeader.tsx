// components/HeaderCampos.tsx
import DialogPage from "./createClassModal";


export function SubHeader() {
  return (
    <div className="mt-10 flex gap-48 w-[80%] ml-auto p-4 rounded">
      <h3>Selecionar todos</h3>
      <h3>Disciplina</h3>
      <h3>Turma</h3>
      <h3>Dossiê</h3>
      <DialogPage></DialogPage>
    </div>
  );
}