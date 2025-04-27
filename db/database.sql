create table Institution(
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	password VARCHAR(255) NOT NULL,
	institution_email VARCHAR(255) NOT NULL UNIQUE
);

create table Professor(
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	password VARCHAR(255) NOT NULL,
	instituition_id INT ,
	professor_email VARCHAR(255) UNIQUE NOT NULL,

	FOREIGN KEY (instituition_id) REFERENCES Institution(id)
);

create table Dossier(
	id SERIAL,
	professor_id INTEGER, 
	name VARCHAR(255) UNIQUE NOT NULL,
	evaluation_method VARCHAR(50),
	FOREIGN KEY(professor_id) REFERENCES Professor(id),
	PRIMARY KEY(id, professor_id)
);

create table Section(
	
	id SERIAL,
	dossier_id INT,
	professor_id INT,
	name VARCHAR(255) NOT NULL,
	description VARCHAR(255) NOT NULL,
	weigth REAL,
	CONSTRAINT fk_Section_Dossier FOREIGN KEY(dossier_id, professor_id) REFERENCES Dossier(id, professor_id),
	
	PRIMARY KEY(id, dossier_id)
);

create table Question(
	id SERIAL,
	professor_id INT,
	dossier_id INT,
	section_id INT,
	description TEXT NOT NULL,

	CONSTRAINT fk_Question_Section FOREIGN KEY(section_id, dossier_id) REFERENCES Section(id, dossier_id),
	PRIMARY KEY(id, section_id)
);

create table Student(
	id INT PRIMARY KEY,
	name VARCHAR(255) NOT NULL
);

create table Appraisal(
	id SERIAL,
	student_id INT,
	professor_id INT,
	points REAL,
	filling_date date NOT NULL,

	CONSTRAINT fk_Appraisal_Student FOREIGN KEY(student_id) REFERENCES Student(id),
	CONSTRAINT fk_Appraisal_Professor FOREIGN KEY(professor_id) REFERENCES Professor(id),

	PRIMARY KEY(id, student_id, professor_id)
);

create table Classroom(
	id SERIAL,
	professor_id INT,
	name VARCHAR(255) NOT NULL,
	description TEXT,
	season VARCHAR(50) NOT NULL,
	institution VARCHAR(255) NOT NULL,
	dossier_id INT,
	dossier_professor_id INT,

	CONSTRAINT fk_Classroom_Professor FOREIGN KEY(professor_id) REFERENCES Professor(id),
	CONSTRAINT fk_Classroom_Dossier FOREIGN KEY(dossier_id, dossier_professor_id) REFERENCES Dossier(id, professor_id),
	PRIMARY KEY(id, professor_id)
);

create table ClassroomStudent(
	classroom_id INT,
	student_id INT,
	professor_id INT,

	CONSTRAINT fk_ClassroomStudent_Classroom FOREIGN KEY(classroom_id, professor_id) REFERENCES Classroom(id, professor_id),
	CONSTRAINT fk_ClassroomStudent_Student FOREIGN KEY(student_id) REFERENCES Student(id),

	PRIMARY KEY(classroom_id, student_id, professor_id)

);

create table InstitutionalDossier(
	id SERIAL,
	instituition_id INT,
	name VARCHAR(255) UNIQUE NOT NULL,
	evaluation_method VARCHAR(50),

	FOREIGN KEY(instituition_id) REFERENCES Institution(id),
	PRIMARY KEY(id, instituition_id)
);

create table InstitutionalSection(
	id SERIAL,
	instituition_id INT,
	dossier_id INT,

	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	weigth REAL,

	CONSTRAINT fk_InstitutionalSection_InstitutionalDossier FOREIGN KEY(dossier_id, instituition_id) REFERENCES InstitutionalDossier(id, instituition_id),
	PRIMARY KEY (id, dossier_id)
);

create table InstitutionalQuestion(
	id SERIAL,
	instituition_id INT,
	dossier_id INT,
	section_id INT,
	description TEXT NOT NULL,

	CONSTRAINT fk_InstitutionalQuestion_InstitutionalSection FOREIGN KEY(section_id, dossier_id) REFERENCES InstitutionalSection(id, dossier_id),
	CONSTRAINT fk_InstitutionalQuestion_Instituition FOREIGN KEY(instituition_id) REFERENCES Institution(id),
	PRIMARY KEY(id, section_id)
);

create table Notification(
	id SERIAL,
	professor_id INT,
	instituition_id INT,
	status INT,

	CONSTRAINT fk_Notification_Professor FOREIGN KEY(professor_id) REFERENCES Professor(id),
	CONSTRAINT fk_Notification_Instituition FOREIGN KEY(instituition_id) REFERENCES Institution(id),

	PRIMARY KEY(id, professor_id, instituition_id)
);

create table VerifyCode(
	code INT UNIQUE NOT NULL,
	professor_id INT,
	data_sol date,
	status INT,

	CONSTRAINT fk_VerifyCode_Professor FOREIGN KEY(professor_id) REFERENCES Professor(id),
	PRIMARY KEY(code, professor_id, data_sol)
);