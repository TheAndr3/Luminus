-- Engenharia Avançada do MySQL Workbench

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUIÇÃO';

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
- Esquema luminus_bd
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
- Esquema luminus_bd
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CRIAR ESQUEMA SE NÃO EXISTIR `luminus_bd` DEFAULT CHARACTER SET utf8;
USE `luminus_bd`;

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- Mesa `luminus_bd`.``usuario`
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CRIAR TABELA SE NÃO EXISTIR `luminus_bd`.`usuario` (
 `id_usuario` VARCHAR(5) NOT NULL,
 `nome_usuario` VARCHAR(100) NÃO NULO,
 `login_usuario` VARCHAR(30) NÃO NULO,
 `senha_usuario` VARCHAR(255) NÃO NULO,
 CHAVE PRIMÁRIA (`id_usuario`))
MOTOR = InnoDB;


----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- Mesa `luminus_bd`.`professor`
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CRIAR MESA SE NÃO EXISTIR `luminus_bd`.`professor` (
 `usuario_id_usuario` VARCHAR(5) NOT NULL,
 `email_professor` VARCHAR(320) NÃO NULO,
 ÍNDICE ÚNICO `email_professor_UNIQUE` (`email_professor` ASC) VISÍVEL,
 CHAVE PRIMÁRIA (`usuario_id_usuario`),
 RESTRIÇÃO `fk_professor_usuario1`
 CHAVE ESTRANGEIRA (`usuario_id_usuario`)
 REFERÊNCIAS `luminus_bd`.`usuario` (`id_usuario`)
 EM EXCLUIR NENHUMA AÇÃO
 NA ATUALIZAÇÃO NENHUMA AÇÃO)
MOTOR = InnoDB;


----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- Mesa `luminus_bd`.`instituicao`
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CRIAR TABELA SE NÃO EXISTIR `luminus_bd`.`instituicao` (
 `usuario_id_usuario` VARCHAR(5) NOT NULL,
 `professor_usuario_id_usuario` VARCHAR(5) NOT NULL,
 CHAVE PRIMÁRIA (`usuario_id_usuario`),
 ÍNDICE `_instituicao_usuario1_idx` (`usuario_id_usuario` ASC) VISÍVEL,
 ÍNDICE `_instituicao_professor1_idx` (`professor_usuario_id_usuario` ASC) VISÍVEL,
 RESTRIÇÃO `fk_instituicao_usuario1`
 CHAVE ESTRANGEIRA (`usuario_id_usuario`)
 REFERÊNCIAS `luminus_bd`.`usuario` (`id_usuario`)
 EM EXCLUIR NENHUMA AÇÃO
 NA ATUALIZAÇÃO NENHUMA AÇÃO,
 RESTRIÇÃO `fk_instituicao_professor1`
 CHAVE ESTRANGEIRA (`professor_usuario_id_usuario`)
 REFERÊNCIAS `luminus_bd`.`professor` (`usuario_id_usuario`)
 EM EXCLUIR NENHUMA AÇÃO
 NA ATUALIZAÇÃO NENHUMA AÇÃO)
MOTOR = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`dossie`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`dossie` (
  `id_dossie` INT NOT NULL,
  `nome_dossie` VARCHAR(45) NOT NULL,
  `descricao` VARCHAR(355) NOT NULL,
  `professor_usuario_id_usuario` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id_dossie`),
  INDEX `fk_dossie_professor1_idx` (`professor_usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_dossie_professor1`
    FOREIGN KEY (`professor_usuario_id_usuario`)
    REFERENCES `luminus_bd`.`professor` (`usuario_id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`turma`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`turma` (
  `id_turma` INT NOT NULL,
  `professor_usuario_id_usuario` VARCHAR(5) NOT NULL,
  `dossie_id_dossie` INT NOT NULL,
  `nome_turma` VARCHAR(45) NOT NULL,
  `descricao_turma` VARCHAR(355) NOT NULL,
  PRIMARY KEY (`id_turma`, `professor_usuario_id_usuario`, `dossie_id_dossie`),
  INDEX `fk_turma_professor1_idx` (`professor_usuario_id_usuario` ASC) VISIBLE,
  INDEX `fk_turma_dossie1_idx` (`dossie_id_dossie` ASC) VISIBLE,
  CONSTRAINT `fk_turma_professor1`
    FOREIGN KEY (`professor_usuario_id_usuario`)
    REFERENCES `luminus_bd`.`professor` (`usuario_id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_turma_dossie1`
    FOREIGN KEY (`dossie_id_dossie`)
    REFERENCES `luminus_bd`.`dossie` (`id_dossie`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`csv_dossie`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`csv_dossie` (
  `id_csv_dossie` INT NOT NULL,
  `data_de_importacao` DATETIME NOT NULL,
  `professor_usuario_id_usuario` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id_csv_dossie`, `professor_usuario_id_usuario`),
  INDEX `fk_csv_dossie_professor1_idx` (`professor_usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_csv_dossie_professor1`
    FOREIGN KEY (`professor_usuario_id_usuario`)
    REFERENCES `luminus_bd`.`professor` (`usuario_id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`sessao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`sessao` (
  `id_sessao` INT NOT NULL,
  `dossie_id_dossie` INT NOT NULL,
  `descricao` VARCHAR(355) NOT NULL,
  `peso` FLOAT NOT NULL,
  `csv_dossie_id_csv_dossie` INT NOT NULL,
  `csv_dossie_professor_usuario_id_usuario` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id_sessao`, `dossie_id_dossie`),
  INDEX `fk_sessao_dossie1_idx` (`dossie_id_dossie` ASC) VISIBLE,
  INDEX `fk_sessao_csv_dossie1_idx` (`csv_dossie_id_csv_dossie` ASC, `csv_dossie_professor_usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_sessao_dossie1`
    FOREIGN KEY (`dossie_id_dossie`)
    REFERENCES `luminus_bd`.`dossie` (`id_dossie`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sessao_csv_dossie1`
    FOREIGN KEY (`csv_dossie_id_csv_dossie` , `csv_dossie_professor_usuario_id_usuario`)
    REFERENCES `luminus_bd`.`csv_dossie` (`id_csv_dossie` , `professor_usuario_id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`questao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`questao` (
  `id_questao` INT NOT NULL,
  `sessao_id_sessao` INT NOT NULL,
  `sessao_dossie_id_dossie` INT NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `peso` FLOAT NOT NULL,
  PRIMARY KEY (`id_questao`, `sessao_id_sessao`, `sessao_dossie_id_dossie`),
  INDEX `fk_questao_sessao1_idx` (`sessao_id_sessao` ASC, `sessao_dossie_id_dossie` ASC) VISIBLE,
  CONSTRAINT `fk_questao_sessao1`
    FOREIGN KEY (`sessao_id_sessao` , `sessao_dossie_id_dossie`)
    REFERENCES `luminus_bd`.`sessao` (`id_sessao` , `dossie_id_dossie`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`csv_aluno`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`csv_aluno` (
  `id_csv_aluno` INT NOT NULL,
  `data_de_importacao` DATETIME NOT NULL,
  `professor_usuario_id_usuario` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id_csv_aluno`, `professor_usuario_id_usuario`),
  INDEX `fk_csv_aluno_professor1_idx` (`professor_usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_csv_aluno_professor1`
    FOREIGN KEY (`professor_usuario_id_usuario`)
    REFERENCES `luminus_bd`.`professor` (`usuario_id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`aluno`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`aluno` (
  `id_aluno` VARCHAR(5) NOT NULL,
  `nome_aluno` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_aluno`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`avaliacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`avaliacao` (
  `id_avaliacao` INT NOT NULL,
  `data_de_preenchimento` DATETIME NOT NULL,
  `nota` FLOAT NOT NULL,
  `aluno_id_aluno` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id_avaliacao`),
  INDEX `fk_avaliacao_aluno1_idx` (`aluno_id_aluno` ASC) VISIBLE,
  CONSTRAINT `fk_avaliacao_aluno1`
    FOREIGN KEY (`aluno_id_aluno`)
    REFERENCES `luminus_bd`.`aluno` (`id_aluno`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`turma_aluno`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`turma_aluno` (
  `turma_id_turma` INT NOT NULL,
  `turma_professor_usuario_id_usuario` VARCHAR(5) NOT NULL,
  `turma_dossie_id_dossie` INT NOT NULL,
  `aluno_id_aluno` VARCHAR(5) NOT NULL,
  INDEX `fk_turma_aluno_turma1_idx` (`turma_id_turma` ASC, `turma_professor_usuario_id_usuario` ASC, `turma_dossie_id_dossie` ASC) VISIBLE,
  INDEX `fk_turma_aluno_aluno1_idx` (`aluno_id_aluno` ASC) VISIBLE,
  PRIMARY KEY (`turma_id_turma`, `turma_professor_usuario_id_usuario`, `turma_dossie_id_dossie`, `aluno_id_aluno`),
  CONSTRAINT `fk_turma_aluno_turma1`
    FOREIGN KEY (`turma_id_turma` , `turma_professor_usuario_id_usuario` , `turma_dossie_id_dossie`)
    REFERENCES `luminus_bd`.`turma` (`id_turma` , `professor_usuario_id_usuario` , `dossie_id_dossie`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_turma_aluno_aluno1`
    FOREIGN KEY (`aluno_id_aluno`)
    REFERENCES `luminus_bd`.`aluno` (`id_aluno`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `luminus_bd`.`aluno_contido_csv`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `luminus_bd`.`aluno_contido_csv` (
  `csv_aluno_id_csv_aluno` INT NOT NULL,
  `csv_aluno_professor_usuario_id_usuario` VARCHAR(5) NOT NULL,
  `aluno_id_aluno` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`csv_aluno_id_csv_aluno`, `csv_aluno_professor_usuario_id_usuario`, `aluno_id_aluno`),
  INDEX `fk_aluno_contido_csv_aluno1_idx` (`aluno_id_aluno` ASC) VISIBLE,
  CONSTRAINT `fk_aluno_contido_csv_csv_aluno1`
    FOREIGN KEY (`csv_aluno_id_csv_aluno` , `csv_aluno_professor_usuario_id_usuario`)
    REFERENCES `luminus_bd`.`csv_aluno` (`id_csv_aluno` , `professor_usuario_id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_aluno_contido_csv_aluno1`
    FOREIGN KEY (`aluno_id_aluno`)
    REFERENCES `luminus_bd`.`aluno` (`id_aluno`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
