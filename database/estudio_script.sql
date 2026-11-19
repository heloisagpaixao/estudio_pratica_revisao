CREATE DATABASE IF NOT EXISTS estudio;
USE estudio;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR (100)
);

CREATE TABLE projetos_de_tatuagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    modelo VARCHAR(10) NOT NULL,
    cor VARCHAR(50),
    tamanho VARCHAR(50),
    lugar_do_corpo VARCHAR(50),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projeto_id INT NOT NULL,
    data_sessao DATETIME NOT NULL,
    tipo_de_servico VARCHAR(100),
    FOREIGN KEY (projeto_id) REFERENCES projetos_de_tatuagem(id)
);

INSERT INTO usuarios (nome, email, senha) VALUES
("Administrador", "admin@estudio.com", "$2b$10$RLJXYpsTA/Y8WdDAV/Awxu1Bot2G6jFVpHQ06M3cph9puBeFEkB0q"),
("Amanda Tatuadora", "amanda@estudio.com", "$2b$10$RLJXYpsTA/Y8WdDAV/Awxu1Bot2G6jFVpHQ06M3cph9puBeFEkB0q"),
("Rodolfo Enfermeiro", "rodolfo@estudio.com", "$2b$10$RLJXYpsTA/Y8WdDAV/Awxu1Bot2G6jFVpHQ06M3cph9puBeFEkB0q");

INSERT INTO clientes (nome, cpf, telefone, email) VALUES
("João da Silva", "b9332f3140efaf757e4d684975ef3365", "(11)95729-0221", "joao.silva@email.com"),
("Maria Souza", "be4f639df4cd927594a5e3084b540dc1", "(11)95101-6804", "maria.souza@email.com"),
("Pedro Oliveira", "65eea67226931d6bc95e431330183923", "(11)97376-9638", "pedro.oliveira@email.com");

INSERT INTO projetos_de_tatuagem(cliente_id, modelo, cor, tamanho, lugar_do_corpo) VALUES 
(1, "Caveira", "Preto", "Grande", "Perna"),
(2, "Borboleta", "Rosa", "Pequeno", "Tríceps"),
(3, "Palhaço", "Preto", "Médio", "Costela");

INSERT INTO sessoes (projeto_id, data_sessao, tipo_de_servico) VALUES
(1, "2026-12-05 09:00:00", "Retoque"),
(2, "2026-01-20 14:30:00", "2ª Sessão"),
(3, "2026-02-28 08:00:00", "1ª Sessão");