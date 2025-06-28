# Luminus

# Backend
O backend do Luminus é uma aplicação Node.js desenvolvida com o framework Express.js, operando como uma API RESTful. Ele é projetado para ser um sistema distinto do frontend, mas totalmente integrado a ele, conforme as recomendações do projeto. A comunicação entre os dois é realizada via requisições HTTP.
## Arquitetura e Componentes:
### Node.js e Express.js: 
A escolha de Node.js proporciona um ambiente de execução JavaScript assíncrono e não-bloqueante, ideal para construir APIs de alta performance. O Express.js, um framework minimalista e flexível, é utilizado para definir rotas, lidar com middlewares e gerenciar as requisições e respostas HTTP.
###  Controle de Versão (Git/GitHub): 
O projeto utiliza Git para controle de versão, com um repositório no GitHub para colaboração e gerenciamento do código-fonte.
### Gerenciamento de Pacotes (npm): 
As dependências do projeto são gerenciadas via npm, conforme indicado nos arquivos package.json.
## Dependências Cruciais do Backend (package.json):
### express: 
Framework web principal para roteamento e middlewares.
### pg: 
Driver oficial para PostgreSQL, permitindo a interação com o banco de dados.
### bcrypt: 
Biblioteca para hash de senhas, crucial para a segurança das informações de autenticação. -> *chave pública e privada
### jsonwebtoken: 
Implementação de JSON Web Tokens para autenticação baseada em tokens.
### nodemailer:
Módulo para envio de e-mails, utilizado na recuperação de senha.
### dotenv: 
Carrega variáveis de ambiente de um arquivo .env para o process.env, protegendo credenciais sensíveis.
### cors:
Middleware Express para habilitar Cross-Origin Resource Sharing, permitindo requisições de diferentes domínios, essencial para a comunicação entre frontend e backend.
### body-parser:
Middleware Express para parsear o corpo das requisições HTTP, convertendo dados JSON, URL-encoded, etc., em objetos JavaScript acessíveis via req.body.
### csv-parser:
Utilizado para parsear dados de arquivos CSV, essencial para a funcionalidade de importação de alunos.
## Estrutura de Código (Pastas e Módulos):
A estrutura do projeto backend é modular e segue princípios de separação de responsabilidades:
### src/app.js:
O arquivo app.js inicializa a aplicação Express, configura os middlewares globais (como cors e body-parser.json()) e importa e utiliza todos os roteadores definidos no diretório routes.
### src/server.js:
Este arquivo é responsável por iniciar o servidor HTTP do Node.js, escutando em uma porta definida (geralmente 3001) e logando no console que o servidor está online.
### bd.js:
Este módulo centraliza a configuração e a pool de conexão com o banco de dados PostgreSQL. Ele utiliza a biblioteca pg para gerenciar as conexões, garantindo que as consultas sejam executadas de forma eficiente e segura. As interações com o banco de dados são feitas utilizando SQL puro, conforme os requisitos do projeto.
### routes/:
Este diretório contém os arquivos de roteamento, cada um dedicado a um recurso específico do sistema (e.g., professorRouter.js, classroomRouter.js, dossierRouter.js). Cada roteador define as rotas HTTP (GET, POST, PUT, DELETE) e mapeia essas rotas para as funções controladoras correspondentes. O uso de express.Router() permite modularizar as rotas.
### controller/: 
Esta pasta abriga a lógica de negócio de cada recurso. Os controladores interagem com o banco de dados (através do módulo bd.js), processam os dados, aplicam regras de negócio, e preparam a resposta HTTP (JSON) a ser enviada ao cliente.
### utils/:
Contém módulos de funções utilitárias e de suporte:
### mailSender.js: 
Abstrai a lógica de envio de e-mails usando Nodemailer.
### passwordManagement.js:
Encapsula as operações de hashing e comparação de senhas utilizando Bcrypt, e também a lógica de geração e validação de tokens para recuperação de senha, incluindo manipulação de chaves RSA para criptografia.
### CSV/csvAlunos.js: 
Módulo específico para a lógica de importação e processamento de arquivos CSV contendo dados de alunos. Utiliza csv-parser para ler o conteúdo dos arquivos e inserir os dados no banco de dados.
## Segurança:
### Hashing de Senhas: 
Todas as senhas são armazenadas no banco de dados como hashes Bcrypt, inviabilizando a recuperação da senha original mesmo em caso de vazamento do banco de dados.
### JWT para Autenticação:
A autenticação é stateless, utilizando JWTs. Após o login, um token assinado é emitido. Cada requisição subsequente inclui este token no cabeçalho Authorization. O backend valida a assinatura do token e extrai as informações do usuário, garantindo que as ações sejam realizadas por usuários autenticados e autorizados.
### Chaves de Criptografia: 
O projeto faz uso de chaves pública e privada para operações criptográficas, especificamente para a recuperação de senha, onde a chave pública pode ser enviada ao cliente para criptografar informações antes de serem enviadas ao servidor.


## Banco de Dados (PostgreSQL e Docker):
### Esquema Relacional: 
O esquema do banco de dados, definido em database.sql, é composto por tabelas normalizadas que representam as entidades do sistema (Professor, Institution, Classroom, Student, Dossier, Section, Question, Appraisal, Evaluation, Notification, etc.) e seus relacionamentos.
### Docker Integration: 
O docker-compose.yml facilita a configuração de um ambiente de desenvolvimento isolado para o PostgreSQL. Isso garante que o banco de dados seja facilmente inicializado e configurado, sem conflitos com outros serviços na máquina do desenvolvedor. A população inicial de dados pode ser feita via population-database.sql.
### Interação com SQL: 
Todas as operações de CRUD (Create, Read, Update, Delete) no banco de dados são realizadas através de comandos SQL diretamente no código Node.js, via o cliente pg, em linha com os requisitos do projeto que permitem a utilização de um framework ou ORM, mas exigem a interação com dados utilizando SQL.

# Frontend

O frontend do Luminus foi desenvolvido com **Next.js 14** (como inferido pelos arquivos `package.json` e `next.config.ts`), utilizando **React** para a construção da interface do usuário. O uso de **TypeScript** em todo o código eleva a robustez e a manutenibilidade do código, fornecendo tipagem estática e detecção precoce de erros.

A estilização é gerenciada principalmente pelo **Tailwind CSS**, um framework CSS utility-first que permite o desenvolvimento rápido de interfaces responsivas. O `postcss.config.mjs` e `postcss.mjs` indicam a utilização do PostCSS para processamento e otimização do CSS, incluindo o Tailwind.

---

## Estrutura de Pastas e Rotas

A estrutura de pastas segue o padrão de roteamento baseado em arquivos do Next.js, com pastas para rotas autenticadas (`appLayout`) e para rotas de autenticação (`auth`):

* **`app/(appLayout)`**: Contém as páginas e componentes que exigem autenticação do usuário, como `home`, `classroom` e `dossie`. O `layout.tsx` desta pasta provavelmente inclui a Sidebar e outros elementos comuns da interface de usuário autenticada.
* **`app/(auth)`**: Inclui as páginas de autenticação, como `login`, `register`, `confirm-email` e `forgot-password`.
* **`components`**: Contém componentes React reutilizáveis, categorizados para melhor organização (ex: `ui` para componentes Shadcn, `inputs` para inputs customizados).
* **`services`**: Contém módulos para interação com a API RESTful do backend, utilizando Axios. Cada arquivo de serviço (e.g., `classroomServices.ts`, `dossierServices.ts`) encapsula as chamadas de API relacionadas a uma entidade específica.
* **`utils`**: Contém funções utilitárias diversas, como `crypto.ts` para criptografia de dados, `colorHover.ts` para lógica de hover de cores e `inputVerify.ts` para validação de inputs.
* **`types`**: Define interfaces e tipos TypeScript, garantindo a consistência dos dados em toda a aplicação.

---

## Gerenciamento de Estado e Dados

O gerenciamento de estado no Luminus é feito principalmente através de:

* **Hooks do React (`useState`, `useEffect`)**: Para gerenciar o estado local dos componentes e efeitos colaterais. Por exemplo, em `createClassModal.tsx`, `useState` é usado para `title`, `description`, `period`, `institution`, `studentList` e controle de erros.
* **Hooks do Next.js (`useRouter`, `useSearchParams`)**: Para gerenciamento de rotas e acesso a parâmetros de consulta na URL. O `useRouter` é fundamental para navegação programática, como redirecionar o usuário após uma ação bem-sucedida.
* **Context API (inferido)**: Embora não explicitamente detalhado para o gerenciamento de estado global, é comum em aplicações React maiores usar a Context API ou bibliotecas como Zustand/Jotai (ou até Redux, embora menos provável para um projeto com `useState` como primário) para estados compartilhados entre muitos componentes. O `layout.tsx` sugere um ponto central onde o estado de autenticação ou informações do usuário logado poderiam ser gerenciados globalmente.

---

## Interação com o Backend (API RESTful)

O frontend interage com uma API RESTful do backend (Node.js/Express.js, como indicado pelos arquivos `backend/src/app.js` e `backend/routes`).

* **Axios**: Todas as requisições HTTP são feitas usando a biblioteca Axios. O `api.ts` provavelmente configura a instância do Axios com a base URL da API e interceptors para, por exemplo, anexar tokens de autenticação a cada requisição.
* **Criptografia de Dados Sensíveis**: O `utils/crypto.ts` implementa criptografia RSA-OAEP para dados sensíveis, como senhas, antes de enviá-los ao backend. Isso significa que o frontend criptografa a senha usando uma chave pública fornecida pelo backend antes de enviá-la, aumentando a segurança do tráfego. Isso é uma boa prática para evitar que credenciais em texto claro transitem pela rede.

    ```typescript
    // Exemplo simplificado de utils/crypto.ts
    import JSEncrypt from 'jsencrypt';

    export const encryptData = (data: string, publicKey: string): string | false => {
        const crypt = new JSEncrypt();
        crypt.setPublicKey(publicKey);
        return crypt.encrypt(data);
    };
    ```

* **Serviços de API Dedicados**: Cada tipo de recurso (turmas, dossiês, professores, etc.) possui um arquivo de serviço correspondente na pasta `services`. Por exemplo, `classroomServices.ts` conteria funções como `createClassroom`, `getClasses`, `updateClassroom`, `deleteClassroom`. Essa modularização facilita a manutenção e testabilidade do código de comunicação com a API.

---

## Componentes e Funcionalidades Notáveis (Detalhes Técnicos)

* **Dossier Page (Componente Container Principal)**:
    * **Estado Interno (`useState`)**: Gerencia `editingMode` (boolean), `dossierData` (object) para os dados completos do dossiê, `selectedSectionId` (string | null) e `selectedItemIdInSection` (string | null).
    * **Handlers de Eventos**: Propaga funções de _callback_ (`onTitleChange`, `onDescriptionChange`, `onSectionSelect`, `onItemAdd`, etc.) para os componentes filhos, permitindo a comunicação entre eles e a atualização do estado global do dossiê.
    * **Persistência de Dados**: Responsável por orquestrar o salvamento dos dados do dossiê, provavelmente chamando o `dossierServices.ts` para enviar as alterações ao backend.

* **Editable Field (Campo Editável Genérico)**:
    * **Reusabilidade**: É um componente genérico crucial para permitir a edição _inline_ de diversos campos na aplicação (título, descrição, itens de seção).
    * **Lógica Condicional**: Renderiza um elemento HTML estático (e.g., `<span>` ou `<p>`) quando `isEditing` é `false` e um `input` ou `textarea` quando `isEditing` é `true`.
    * **Props Essenciais**: `value`, `isEditing`, `onChange` (_callback_ para atualizar o valor), `placeholder` e `multiline` (para alternar entre `input` e `textarea`).
    * **Estilização Dinâmica**: Aceita `inputStyling` e `textStyling` para aplicar estilos condicionalmente.

* **Section e SectionItem (Estrutura do Dossiê)**:
    * **Composição**: `Section` contém `SectionItems`, refletindo a estrutura hierárquica do dossiê (seções com quesitos).
    * **Interatividade**: `Section` mostra uma `ActionSidebar` quando selecionada e em modo de edição, permitindo ações como adicionar/duplicar/deletar itens/seções.
    * **Callback Props**: `onSelect`, `onTitleChange`, `onItemAdd`, `onItemChange`, `onItemDelete`, `onDuplicate`, `onSettings`, `onDelete` são passadas para baixo para permitir que os elementos filhos interajam com o estado da Dossier Page.
    * **Exclusão de Item**: O `onDeleteItemFromSection` na `ActionSidebar` é o ponto de entrada para a lógica de remoção de um quesito selecionado. Isso acionaria uma atualização no estado do Dossier Page e, subsequentemente, uma chamada à API para persistir a mudança.

* **Gerenciamento de Turmas (`classroom` module)**:
    * **Modais de Criação/Edição**: `createClassModal.tsx` e `editClassModal.tsx` utilizam o componente `Dialog` do Shadcn para formulários de entrada de dados da turma (título, descrição, etc.).
    * **Importação CSV**: O `ImportCSVButton.tsx` (em `Action-bar.tsx/components/Action-bar.tsx`) é responsável por lidar com a leitura de arquivos CSV (provavelmente usando uma biblioteca como `papaparse` ou `csv-parse`) e enviar os dados dos alunos ao backend via `studentService.ts`.
    * **Listagem de Estudantes**: `listStudents.tsx` (em `components/listStudents.tsx`) renderiza a lista de alunos de uma turma específica, possivelmente utilizando paginação, conforme sugerido por `Pagination.tsx` (em `components/Pagination.tsx`).

---

## Otimizações e Boas Práticas

* **Bundle Splitting**: O Next.js automaticamente divide o código em _chunks_ menores, carregando apenas o JavaScript necessário para cada rota, o que melhora o tempo de carregamento inicial.
* **Otimização de Imagens**: O Next.js oferece um componente `<Image>` otimizado para carregamento _lazy_, redimensionamento e formatação de imagens.
* **Acessibilidade (ARIA attributes)**: Componentes como `BaseInput` já incorporam atributos ARIA (e.g., `aria-describedby`) para melhorar a acessibilidade para usuários de leitores de tela.


Em suma, o frontend do Luminus é um projeto Next.js/React/TypeScript bem estruturado, com uma forte ênfase na modularidade, reusabilidade de componentes e segurança na comunicação com a API.
















Academic dossier management system built with Next.js, Node.js, PostgreSQL, and Docker. 

## 🧱 Tecnologias
- 🧑‍🎨 Frontend: Next.js (React)
- ⚙️ Backend: Node.js
- 🛢️ Banco de Dados: PostgreSQL
- 🐳 Contêineres: Docker
- 🧪 CI/CD: Pensar sobre

