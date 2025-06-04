--instituicoes
insert into Institution(name, password, institution_email) values ('UEFS', '123', 'uefs@uefs.com');
insert into Institution(name, password, institution_email) values ('UFG', '123', 'ufg@ufg.com');
insert into Institution(name, password, institution_email) values ('UFU', '123', 'ufu@ufu.com');

--professores
insert into Professor(name, password, professor_email) values ('tiago', '123', 'tiago@gmail.com');
insert into Professor(name, password, professor_email) values ('joao', '123', 'joao@gmail.com');
insert into Professor(name, password, professor_email) values ('maria', '123', 'maria@gmail.com');

--Dossier
insert into Dossier(professor_id, name, description, evaluation_method) values (1, 'dossier test', 'esse dossier so serve para test', '1, 2, 3, 4, 5, 6, 7, 8, 9, 10');

--sessões
insert into Section(dossier_id, professor_id, name, description, weigth) values(1, 1, 'sessao 1', 'essa sessao serve para test', 20);
insert into Section(dossier_id, professor_id, name, description, weigth) values(1, 1, 'sessao 2', 'essa sessao serve para test', 30);
insert into Section(dossier_id, professor_id, name, description, weigth) values(1, 1, 'sessao 3', 'essa sessao serve para test', 50);

--questões
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 1, 'pergunta 1');
insert into Question(professor_id, dossier_id, section_id, description) values(1,1, 1, 'pergunta 2');
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 2, 'pergunta 1 sessao 2');
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 2, 'pergunta 2 sessao 2');
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 2, 'pergunta 3 sessao 2');
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 3, 'pergunta 1 sessao 3');
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 3, 'pergunta 2 sessao 3');
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 3, 'pergunta 3 sessao 3');
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 3, 'pergunta 4 sessao 3');
insert into Question(professor_id, dossier_id, section_id, description) values(1, 1, 3, 'pergunta 5 sessao 3');

--alunos
insert into student(id, name) values(1, 'aluno 1');
insert into student(id, name) values(2, 'aluno 2');
insert into student(id, name) values(3, 'aluno 3');
insert into student(id, name) values(4, 'aluno 4');
insert into student(id, name) values(5, 'aluno 5');
insert into student(id, name) values(6, 'aluno 6');
insert into student(id, name) values(7, 'aluno 7');
insert into student(id, name) values(8, 'aluno 8');
insert into student(id, name) values(9, 'aluno 9');
insert into student(id, name) values(10, 'aluno 10');

--classe
insert into Classroom(professor_id, name, description, season, institution) values(1, 'Turma de quimica', 'Turma de 1 de quimica', '2022.1', 'UEFS');
insert into Classroom(professor_id, name, description, season, institution) values(2, 'Turma de matematica', 'Turma de 1 de matematica', '2023.1', 'UEFS');


