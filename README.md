# Luminus
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


Banco de Dados (PostgreSQL e Docker):
Esquema Relacional: O esquema do banco de dados, definido em database.sql, é composto por tabelas normalizadas que representam as entidades do sistema (Professor, Institution, Classroom, Student, Dossier, Section, Question, Appraisal, Evaluation, Notification, etc.) e seus relacionamentos.
Docker Integration: O docker-compose.yml facilita a configuração de um ambiente de desenvolvimento isolado para o PostgreSQL. Isso garante que o banco de dados seja facilmente inicializado e configurado, sem conflitos com outros serviços na máquina do desenvolvedor. A população inicial de dados pode ser feita via population-database.sql.
Interação com SQL: Todas as operações de CRUD (Create, Read, Update, Delete) no banco de dados são realizadas através de comandos SQL diretamente no código Node.js, via o cliente pg, em linha com os requisitos do projeto que permitem a utilização de um framework ou ORM, mas exigem a interação com dados utilizando SQL.















Academic dossier management system built with Next.js, Node.js, PostgreSQL, and Docker. 

## 🧱 Tecnologias
- 🧑‍🎨 Frontend: Next.js (React)
- ⚙️ Backend: Node.js
- 🛢️ Banco de Dados: PostgreSQL
- 🐳 Contêineres: Docker
- 🧪 CI/CD: Pensar sobre

