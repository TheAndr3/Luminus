CREATE TABLE costumUser(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE EvaluationMethod(
    id SERIAL,
    costumUser_id INT,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT fk_EvaluationMethod_costumUser FOREIGN KEY(costumUser_id) REFERENCES costumUser(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY(id, costumUser_id)
);

create TABLE EvaluationType(
    id SERIAL,
    costumUser_id INT,
    evaluation_method INT,
    name VARCHAR(255) NOT NULL,
    value REAL NOT NULL,

    CONSTRAINT fk_Evaluation_costumUser FOREIGN KEY(evaluation_method, costumUser_id) REFERENCES EvaluationMethod(id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, evaluation_method, costumUser_id)
);


CREATE TABLE Dossier(
    id SERIAL,
    costumUser_id INT,
    name VARCHAR(255) NOT NULL,
    description text,
    evaluation_method INT,

    CONSTRAINT fk_Dossier_costumUser FOREIGN KEY(costumUser_id) REFERENCES costumUser(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Dossier_EvaluationMethod FOREIGN KEY(evaluation_method, costumUser_id) REFERENCES EvaluationMethod(id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, costumUser_id)
);

CREATE TABLE Section(
    id SERIAL,
    costumUser_id INT,
    dossier_id INT,
    name VARCHAR(255) NOT NULL,
    description text,
    weigth REAL,

    CONSTRAINT fk_Section_Dossier FOREIGN KEY(dossier_id, costumUser_id) REFERENCES Dossier(id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, dossier_id, costumUser_id)
);

CREATE TABLE Question(
    id SERIAL,
    costumUser_id INT,
    section_id INT,
    dossier_id INT,
    evaluation_method int,
    name VARCHAR(255) NOT NULL,

    CONSTRAINT fk_Question_Evaluation FOREIGN KEY(evaluation_method, costumUser_id) REFERENCES EvaluationMethod(id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Question_Section FOREIGN KEY(section_id, dossier_id, costumUser_id) REFERENCES Section(id, dossier_id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, section_id, dossier_id, costumUser_id)
);

CREATE TABLE Student(
	id INT PRIMARY KEY,
	name VARCHAR(255) NOT NULL
);

CREATE TABLE Classroom(
    id SERIAL,
    costumUser_id INT NOT NULL,
    dossier_id INT,
    name VARCHAR(255) NOT NULL,
    description text,
    season VARCHAR(50) NOT NULL,
    institution VARCHAR(255),

    CONSTRAINT fk_Classroom_Dossier FOREIGN KEY(dossier_id, costumUser_id) REFERENCES Dossier(id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, costumUser_id)
);

CREATE TABLE ClassroomStudent(
    classroom_id INT,
    student_id INT,
    costumUser_id INT,

    CONSTRAINT fk_ClassroomStudent_Classroom FOREIGN KEY(classroom_id, costumUser_id) REFERENCES Classroom(id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ClassroomStudent_Student FOREIGN KEY(student_id) REFERENCES Student(id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(classroom_id, student_id, costumUser_id)

);

CREATE TABLE Appraisal(
    id SERIAL,
    student_id INT,
    costumUser_id INT,
    classroom_id INT,
    dossier_id INT,
    points REAL,
    filling_date date NOT NULL,

    CONSTRAINT fk_Appraisal_Dossier FOREIGN KEY(dossier_id, costumUser_id) REFERENCES Dossier(id, costumUser_id) ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT fk_Appraisal_Classroom FOREIGN KEY(classroom_id, student_id, costumUser_id) REFERENCES ClassroomStudent(classroom_id, student_id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    PRIMARY KEY(id, student_id, costumUser_id, classroom_id)
);

CREATE TABLE Evaluation(
    id SERIAL,
    student_id INT,
    costumUser_id INT,
    classroom_id INT,
    dossier_id INT,
    section_id INT,
    evaluation_method INT,

    question_id INT,
    appraisal_id INT,

    question_option INT,

    CONSTRAINT fk_Evauation_appraisal FOREIGN KEY(appraisal_id, student_id, costumUser_id, classroom_id) REFERENCES Appraisal(id, student_id, costumUser_id, classroom_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Evaluation_question FOREIGN KEY(question_option, section_id, dossier_id, costumUser_id) REFERENCES Question(id, section_id, dossier_id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Evaluation_EvType FOREIGN KEY(evaluation_method, question_option, costumUser_id) REFERENCES EvaluationType(evaluation_method, id, costumUser_id) ON DELETE CASCADE ON UPDATE CASCADE,


    PRIMARY KEY(id, appraisal_id)
);

create table VerifyCode(
	code INT UNIQUE NOT NULL,
	costumUser_id INT,
	data_sol date,
	status INT,

	CONSTRAINT fk_VerifyCode_costumUser FOREIGN KEY(costumUser_id) REFERENCES costumUser(id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY(code, costumUser_id, data_sol)
);

create table TokenCode(
	token VARCHAR(255),
	costumUser_id INT,

	CONSTRAINT fk_Token_costumUser FOREIGN KEY(costumUser_id) REFERENCES costumUser(id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY(token, costumUser_id)
);