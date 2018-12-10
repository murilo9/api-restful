CREATE TABLE tbUsuarios(
	stEmail VARCHAR(50) NOT NULL,
    stSenha VARCHAR(20) NOT NULL,
    stNome VARCHAR(50) NOT NULL,
    PRIMARY KEY (stEmail)
) ENGINE=innodb;

CREATE TABLE tbRecursos(
	itId INTEGER(8) NOT NULL,
    stNome VARCHAR(50),
    dtData DATETIME DEFAULT NOW(),
    stDono VARCHAR(50) NOT NULL,
    PRIMARY KEY (itId),
    FOREIGN KEY (stDono) REFERENCES tbUsuarios(stEmail)
) ENGINE=innodb;