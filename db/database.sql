create table Instituicao(
	id_instituicao SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	login VARCHAR(50) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	email_instituicao VARCHAR(255) NOT NULL UNIQUE
);

create table Professor(
	id_professor SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	login VARCHAR(50) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	id_instituicao INT ,
	email_professor VARCHAR(255) UNIQUE NOT NULL,

	FOREIGN KEY (id_instituicao) REFERENCES Instituicao(id_instituicao)
);

create table Dossie(
	id_dossie SERIAL,
	id_professor INTEGER, 
	nome VARCHAR(255) UNIQUE NOT NULL,
	met_avaliacao VARCHAR(50),
	FOREIGN KEY(id_professor) REFERENCES Professor(id_professor),
	PRIMARY KEY(id_dossie, id_professor)
);

create table Sessao(
	id_dossie INT,
	id_professor INT,
	id_sessao SERIAL, 
	nome VARCHAR(255) NOT NULL,
	descricao VARCHAR(255) NOT NULL,
	peso REAL,
	CONSTRAINT fk_Sessao_Dossie FOREIGN KEY(id_dossie, id_professor) REFERENCES Dossie(id_dossie,id_professor),
	
	PRIMARY KEY(id_sessao, id_dossie)
);

create table Questao(
	id_questao SERIAL,
	id_professor INT,
	id_dossie INT,
	id_sessao INT,
	descricao TEXT NOT NULL,

	CONSTRAINT fk_Questao_Sessao FOREIGN KEY(id_sessao, id_dossie) REFERENCES Sessao(id_sessao, id_dossie),
	PRIMARY KEY(id_questao, id_sessao)
);

create table Aluno(
	id_aluno INT PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

create table Avaliacao(
	id_avaliacao SERIAL,
	id_aluno INT,
	id_professor INT,
	NOTa REAL,
	data_prenchimento date NOT NULL,

	CONSTRAINT fk_Avaliacao_Aluno FOREIGN KEY(id_aluno) REFERENCES Aluno(id_aluno),
	CONSTRAINT fk_Avaliacao_Professor FOREIGN KEY(id_professor) REFERENCES Professor(id_professor),

	PRIMARY KEY(id_avaliacao, id_aluno, id_professor)
);

create table Turma(
	id_turma SERIAL,
	id_professor INT,
	nome VARCHAR(255) NOT NULL,
	descricao TEXT,
	periodo VARCHAR(50) NOT NULL,
	instituicao VARCHAR(255) NOT NULL,
	id_dossie INT,
	id_professor_dossie INT,

	CONSTRAINT fk_Turma_Professor FOREIGN KEY(id_professor) REFERENCES Professor(id_professor),
	CONSTRAINT fk_Turma_dossie FOREIGN KEY(id_dossie, id_professor_dossie) REFERENCES Dossie(id_dossie, id_professor),
	PRIMARY KEY(id_turma, id_professor)
);

create table TurmaAluno(
	id_turma INT,
	id_aluno INT,
	id_professor INT,

	CONSTRAINT fk_TurmaAluno_Turma FOREIGN KEY(id_turma, id_professor) REFERENCES Turma(id_turma, id_professor),
	CONSTRAINT fk_TurmaAluno_Aluno FOREIGN KEY(id_turma) REFERENCES Aluno(id_aluno),

	PRIMARY KEY(id_turma, id_aluno)

);

create table DossieInstituicao(
	id_dossie SERIAL,
	id_instituicao INT,
	nome VARCHAR(255) UNIQUE NOT NULL,
	met_avaliacao VARCHAR(50),

	FOREIGN KEY(id_instituicao) REFERENCES Instituicao(id_instituicao),
	PRIMARY KEY(id_dossie, id_instituicao)
);

create table SessaoInstituicao(
	id_sessao SERIAL,
	id_instituicao INT,
	id_dossie INT,

	nome VARCHAR(255) NOT NULL,
	descricao VARCHAR(255) NOT NULL,
	peso REAL,

	CONSTRAINT fk_SessaoInstituicao_DossieInstituicao FOREIGN KEY(id_dossie, id_instituicao) REFERENCES DossieInstituicao(id_dossie, id_instituicao),
	PRIMARY KEY (id_sessao, id_dossie)
);

create table QuestaoInstituicao(
	id_questao SERIAL,
	id_instituicao INT,
	id_dossie INT,
	id_sessao INT,
	descricao TEXT NOT NULL,

	CONSTRAINT fk_QuestaoInstituicao_SessaoInstituicao FOREIGN KEY(id_sessao, id_dossie) REFERENCES SessaoInstituicao(id_sessao, id_dossie),
	CONSTRAINT fk_QuestaoInstituicao_Instituicao FOREIGN KEY(id_instituicao) REFERENCES Instituicao(id_instituicao),
	PRIMARY KEY(id_questao, id_sessao)
);