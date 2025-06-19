CREATE TABLE CustomUser(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE EvaluationMethod(
    id SERIAL,
    customUserId INT,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT fk_EvaluationMethod_customUser FOREIGN KEY(customUserId) REFERENCES CustomUser(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY(id, customUserId)
);

create TABLE EvaluationType(
    id SERIAL,
    customUserId INT,
    evaluationMethodId INT,
    name VARCHAR(255) NOT NULL,
    value REAL NOT NULL,

    CONSTRAINT fk_Evaluation_customUser FOREIGN KEY(evaluationMethodId, customUserId) REFERENCES EvaluationMethod(id, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, evaluationMethodId, customUserId)
);


CREATE TABLE Dossier(
    id SERIAL,
    customUserId INT,
    name VARCHAR(255) NOT NULL,
    description text,
    evaluationMethodId INT,

    CONSTRAINT fk_Dossier_customUser FOREIGN KEY(customUserId) REFERENCES customUser(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Dossier_EvaluationMethod FOREIGN KEY(evaluationMethodId, customUserId) REFERENCES EvaluationMethod(id, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, customUserId)
);

CREATE TABLE Section(
    id SERIAL,
    customUserId INT,
    dossierId INT,
    name VARCHAR(255) NOT NULL,
    description text,
    weigth REAL,

    CONSTRAINT fk_Section_Dossier FOREIGN KEY(dossierId, customUserId) REFERENCES Dossier(id, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, dossierId, customUserId)
);

CREATE TABLE Question(
    id SERIAL,
    customUserId INT,
    sectionId INT,
    dossierId INT,
    evaluationMethodId int,
    name VARCHAR(255) NOT NULL,

    CONSTRAINT fk_Question_Evaluation FOREIGN KEY(evaluationMethodId, customUserId) REFERENCES EvaluationMethod(id, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Question_Section FOREIGN KEY(sectionId, dossierId, customUserId) REFERENCES Section(id, dossierId, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, sectionId, dossierId, customUserId)
);

CREATE TABLE Student(
	id INT PRIMARY KEY,
	name VARCHAR(255) NOT NULL
);

CREATE TABLE Classroom(
    id SERIAL,
    customUserId INT NOT NULL,
    dossierId INT,
    name VARCHAR(255) NOT NULL,
    description text,
    season VARCHAR(50) NOT NULL,
    institution VARCHAR(255),

    CONSTRAINT fk_Classroom_Dossier FOREIGN KEY(dossierId, customUserId) REFERENCES Dossier(id, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(id, customUserId)
);

CREATE TABLE ClassroomStudent(
    classroomId INT,
    studentId INT,
    customUserId INT,

    CONSTRAINT fk_ClassroomStudent_Classroom FOREIGN KEY(classroomId, customUserId) REFERENCES Classroom(id, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ClassroomStudent_Student FOREIGN KEY(studentId) REFERENCES Student(id) ON DELETE CASCADE ON UPDATE CASCADE,

    PRIMARY KEY(classroomId, studentId, customUserId)

);

CREATE TABLE Appraisal(
    id SERIAL,
    studentId INT,
    customUserId INT,
    classroomId INT,
    dossierId INT,
    points REAL,
    fillingDate date NOT NULL,

    CONSTRAINT fk_Appraisal_Dossier FOREIGN KEY(dossierId, customUserId) REFERENCES Dossier(id, customUserId) ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT fk_Appraisal_Classroom FOREIGN KEY(classroomId, studentId, customUserId) REFERENCES ClassroomStudent(classroomId, studentId, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,
    
    PRIMARY KEY(id, studentId, customUserId, classroomId)
);

CREATE TABLE Evaluation(
    id SERIAL,
    studentId INT,
    customUserId INT,
    classroomId INT,
    dossierId INT,
    sectionId INT,
    evaluationMethodId INT,

    questionId INT,
    appraisalId INT,

    questionOption INT,

    CONSTRAINT fk_Evauation_appraisal FOREIGN KEY(appraisalId, studentId, customUserId, classroomId) REFERENCES Appraisal(id, studentId, customUserId, classroomId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Evaluation_question FOREIGN KEY(questionId, sectionId, dossierId, customUserId) REFERENCES Question(id, sectionId, dossierId, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_Evaluation_EvType FOREIGN KEY(evaluationMethodId, questionOption, customUserId) REFERENCES EvaluationType(evaluationMethodId, id, customUserId) ON DELETE CASCADE ON UPDATE CASCADE,


    PRIMARY KEY(id, appraisalId)
);

create table VerifyCode(
	code INT NOT NULL,
	customUserId INT,
	requestDate date,
	status INT,

	CONSTRAINT fk_VerifyCode_customUser FOREIGN KEY(customUserId) REFERENCES CustomUser(id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY(code, customUserId, requestDate)
);

create table TokenCode(
	token VARCHAR(255),
	customUserId INT,
    verifyStatus INT,

	CONSTRAINT fk_Token_customUser FOREIGN KEY(customUserId) REFERENCES CustomUser(id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY(token, customUserId)
);