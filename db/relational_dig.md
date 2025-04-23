# Modelo Relacional

## 1. Tabela com os nomes das tabelas e atributos entre parênteses

| Tabela                     | Atributos                                           |
|----------------------------|-----------------------------------------------------|
| Institution                | (id, name, login, password, institution_email)      |
| Professor                  | (id, name, login, password, instituition_id, professor_email) |
| Dossier                    | (id, professor_id, name, evaluation_method)         |
| Section                    | (id, dossier_id, professor_id, name, description, weigth) |
| Question                   | (id, professor_id, dossier_id, section_id, description) |
| Student                    | (id, name)                                          |
| Appraisal                  | (id, student_id, professor_id, points, filling_date) |
| Classroom                  | (id, professor_id, name, description, season, institution, dossier_id, dossier_professor_id) |
| ClassroomStudent           | (classroom_id, student_id, professor_id)            |
| InstitutionalDossier       | (id, instituition_id, name, evaluation_method)      |
| InstitutionalSection       | (id, instituition_id, dossier_id, name, description, weigth) |
| InstitutionalQuestion      | (id, instituition_id, dossier_id, section_id, description) |

## 2. Tabela completa com os detalhes (domínios, chaves, etgitc.)

| Tabela                     | Atributo             | Domínio         | Observações                     |
|----------------------------|----------------------|------------------|----------------------------------|
| Institution                | id                   | INT              | **PK**                          |
|                            | name                 | VARCHAR(100)     | NOT NULL                        |
|                            | login                | VARCHAR(50)      | NOT NULL, UNIQUE                |
|                            | password             | VARCHAR(255)     | NOT NULL                        |
|                            | institution_email    | VARCHAR(255)     | NOT NULL, UNIQUE                |
| Professor                  | id                   | INT              | **PK**                          |
|                            | name                 | VARCHAR(100)     | NOT NULL                        |
|                            | login                | VARCHAR(50)      | NOT NULL, UNIQUE                |
|                            | password             | VARCHAR(255)     | NOT NULL                        |
|                            | instituition_id      | INT              | **FK → Institution(id)**        |
|                            | professor_email      | VARCHAR(255)     | NOT NULL, UNIQUE                |
| Dossier                    | id                   | INT              | **PK (composta)**               |
|                            | professor_id         | INTEGER          | **FK → Professor(id)**          |
|                            | name                 | VARCHAR(255)     | NOT NULL, UNIQUE                |
|                            | evaluation_method    | VARCHAR(50)      | —                                |
| Section                    | id                   | INT              | **PK (composta)**               |
|                            | dossier_id           | INT              | **FK → Dossier(id)**            |
|                            | professor_id         | INT              | **FK → Dossier(professor_id)**  |
|                            | name                 | VARCHAR(255)     | NOT NULL                        |
|                            | description          | VARCHAR(255)     | NOT NULL                        |
|                            | weigth               | REAL             | —                                |
| Question                   | id                   | INT              | **PK (composta)**               |
|                            | professor_id         | INT              | —                                |
|                            | dossier_id           | INT              | —                                |
|                            | section_id           | INT              | **FK → Section(id)**           |
|                            | description          | TEXT             | NOT NULL                        |
| Student                    | id                   | INT              | **PK**                          |
|                            | name                 | VARCHAR(255)     | NOT NULL                        |
| Appraisal                  | id                   | INT              | **PK (composta)**               |
|                            | student_id           | INT              | **FK → Student(id)**            |
|                            | professor_id         | INT              | **FK → Professor(id)**          |
|                            | points               | REAL             | —                                |
|                            | filling_date         | DATE             | NOT NULL                        |
| Classroom                  | id                   | INT              | **PK (composta)**               |
|                            | professor_id         | INT              | **FK → Professor(id)**          |
|                            | name                 | VARCHAR(255)     | NOT NULL                        |
|                            | description          | TEXT             | —                                |
|                            | season               | VARCHAR(50)      | NOT NULL                        |
|                            | institution          | VARCHAR(255)     | NOT NULL                        |
|                            | dossier_id           | INT              | —                                |
|                            | dossier_professor_id | INT              | **FK → Dossier(professor_id)**  |
| ClassroomStudent           | classroom_id         | INT              | **FK → Classroom(id)**          |
|                            | student_id           | INT              | **FK → Student(id)**            |
|                            | professor_id         | INT              | **FK → Classroom(professor_id)**|
| InstitutionalDossier       | id                   | INT              | **PK (composta)**               |
|                            | instituition_id      | INT              | **FK → Institution(id)**        |
|                            | name                 | VARCHAR(255)     | NOT NULL, UNIQUE                |
|                            | evaluation_method    | VARCHAR(50)      | —                                |
| InstitutionalSection       | id                   | INT              | **PK (composta)**               |
|                            | instituition_id      | INT              | **FK → Institution(id)**        |
|                            | dossier_id           | INT              | **FK → InstitutionalDossier(id)**|
|                            | name                 | VARCHAR(255)     | NOT NULL                        |
|                            | description          | TEXT             | NOT NULL                        |
|                            | weigth               | REAL             | —                                |
| InstitutionalQuestion      | id                   | INT              | **PK (composta)**               |
|                            | instituition_id      | INT              | **FK → Institution(id)**        |
|                            | dossier_id           | INT              | **FK → InstitutionalDossier(id)**|
|                            | section_id           | INT              | **FK → InstitutionalSection(id)**|
|                            | description          | TEXT             | NOT NULL                        |
