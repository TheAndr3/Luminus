CREATE TABLE User(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE Professor(
    id INT,
    id_intituition INT,

    CONSTRAINT fk_Professor_User FOREIGN KEY(id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Professor_Intituition FOREIGN KEY(id_intituition) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id)

);

CREATE TABLE EvaluationMethod(
    id SERIAL,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT fk_EvaluationMethod_User FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY(id, user_id);
);

create TABLE EvaluationType(
    id SERIAL,
    user_id INT,
    evaluation_method INT,
    name VARCHAR(255) NOT NULL,
    value REAL NOT NULL,

    CONSTRAINT fk_Evaluation_User FOREIGN KEY(evaluation_method, user_id) REFERENCES EvaluationMethod(id, user_id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, evaluation_method, user_id)
);


CREATE TABLE Dossier(
    id SERIAL,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    description text,
    evaluation_method INT,

    CONSTRAINT fk_Dossier_user FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Dossier_EvaluationMethod FOREIGN KEY(evaluation_method) REFERENCES EvaluationMethod(id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, user_id)
);

CREATE TABLE Section(
    id SERIAL,
    user_id INT,
    dossier_id INT,
    name VARCHAR(255) NOT NULL,
    description text,
    weigth REAL,

    CONSTRAINT fk_Section_Dossier FOREIGN KEY(dossier_id, user_id) REFERENCES Dossier(id, user_id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, dossier_id, user_id)
);

CREATE TABLE Question(
    id SERIAL
    user_id INT,
    section_id INT,
    dossier_id INT,
    evaluation_method int,
    name VARCHAR(255) NOT NULL,
    evaluation INT,

    CONSTRAINT fk_Question_Evaluation FOREIGN KEY(evaluation_method, user_id) REFERENCES EvaluationMethod(id, user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Question_Section FOREIGN KEY(section_id, dossier_id, user_id) REFERENCES Section(id, dossier_id, user_id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, section_id, dossier_id, user_id)
);

CREATE TABLE Student(
	id INT PRIMARY KEY,
	name VARCHAR(255) NOT NULL
);

CREATE TABLE Classroom(
    id SERIAL,
    user_id INT NOT NULL,
    dossier_id INT,
    name VARCHAR(255) NOT NULL,
    description text,
    season VARCHAR(50) NOT NULL,
    institution INT,

    CONSTRAINT fk_Classroom_Dossier FOREIGN KEY(dossier_id, user_id) REFERENCES Dossier(id, user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Classroom_Instituition FOREIGN KEY(institution) REFERENCES Institution(id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, user_id)
);

CREATE TABLE ClassroomStudent(
    classroom_id INT,
    student_id INT,
    user_id INT,

    CONSTRAINT fk_ClassroomStudent_Classroom FOREIGN KEY(classroom_id, user_id) REFERENCES Classroom(id, user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ClassroomStudent_Student FOREIGN KEY(student_id) REFERENCES Student(id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(classroom_id, student_id, user_id)

);

CREATE TABLE Appraisal(
    id SERIAL,
    student_id INT,
    user_id INT,
    classroom_id INT,
    points REAL,
    filling_date date NOT NULL,

    CONSTRAINT fk_Appraisal_Classroom FOREIGN KEY(classroom_id, student_id, user_id) REFERENCES Classroom(id, student_id, user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    PRIMARY KEY(id, student_id, user_id, classroom_id)
);

--terminar essa parte de avaliação verificar a melhor forma de fazer isso

CREATE TABLE Evaluation(
    id SERIAL,
    student_id INT,
    user_id INT,
    classroom_id INT,
    dossier_id INT,
    section_id INT,

    question_id INT,
    appraisal_id INT,

    question_option INT,

    CONSTRAINT fk_Evauation_appraisal FOREIGN KEY(appraisal_id, student_id, user_id, classroom_id) REFERENCES Appraisal(id, student_id, user_id, classroom_id),


);

create table Notification(
	id SERIAL,
	professor INT,
	institution INT,
	status INT,

	CONSTRAINT fk_Notification_ProfessorUser FOREIGN KEY(professor) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_Notification_InstitutionUser FOREIGN KEY(institution) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,

	PRIMARY KEY(id, professor, institution)
);

create table VerifyCode(
	code INT UNIQUE NOT NULL,
	user_id INT,
	data_sol date,
	status INT,

	CONSTRAINT fk_VerifyCode_User FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY(code, user_id, data_sol)
);

create table TokenCode(
	token VARCHAR(255),
	user_id INT,

	CONSTRAINT fk_Token_User FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY(token, user_id)
);