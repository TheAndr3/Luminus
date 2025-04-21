create table Instituicao(
	id_instituicao SERIAL primary key,
	nome VARCHAR(100) not null,
	login VARCHAR(50) unique not null,
	senha VARCHAR(255) not null,
	email_instituicao VARCHAR(255) not null unique
);

create table Professor(
	id_professor SERIAL primary key,
	nome VARCHAR(100) not null,
	login VARCHAR(50) unique not null,
	senha VARCHAR(255) not null,
	id_instituicao int ,
	email_professor VARCHAR(255) unique not null,

	FOREIGN KEY (id_instituicao) REFERENCES Instituicao(id_instituicao)
);

create table Dossie(
	id_dossie SERIAL,
	id_professor INTEGER, 
	nome VARCHAR(255) unique not null,
	met_avaliacao VARCHAR(50),
	FOREIGN KEY(id_professor) REFERENCES Professor(id_professor),
	PRIMARY KEY(id_dossie, id_professor)
);

create table Sessao(
	id_dossie int,
	id_professor int,
	id_sessao SERIAL, 
	nome VARCHAR(255) not null,
	descricao VARCHAR(255) not null,
	peso REAL,
	CONSTRAINT fk_Sessao_Dossie FOREIGN KEY(id_dossie, id_professor) REFERENCES Dossie(id_dossie,id_professor),
	
	PRIMARY KEY(id_sessao, id_dossie)
);

