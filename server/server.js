//Declaração dos módulos utilizados:
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var formidable = require('formidable');
var fs = require('fs');
var url = require('url');

//Variáveis globais:
var session = [];   //Array de sessions
var pool;       //Mysql connection pool
var app = express();        //Express app

//Utilização dos recursos dos módulos:
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    extended: true
}));

//Inicializa o servidor na porta 8888 e declara o mysql connections pool:
app.listen(8888, function () {
    console.log('Servidor rodando na porta 8888');
    pool  = mysql.createPool({
        connectionLimit : 10,
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: '',
        database: 'restful'
    });
});

/* Router de um recurso genérico para teste de requests */

app.route('/recurso/test')      //Rota de testes
    .get(function(req, res){
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('GET request recebida em /recurso');
        //middleware
        res.send('<resposta>get recurso</resposta>');    //Envia resposta em texto XML (ou HTML ou texto simples)
    })
    .post(function(req, res){
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('POST request recebida em /recurso');
        //middleware
        var resObj = {resposta: 'post recurso'};
        res.json(resObj);    //Envia resposta em JSON
    })
    //TODO router de put
    //TODO delete router de delete

/* Router de CRUD de recursos
    Recebe uma request com parâmetro indicando a função (exceto para Read),
*/
app.route('/recurso')
    .get(function(req, res){        //----------------Get: Read----------------
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('recebeu GET recurso');
        //Coleta os dados da request:
        var recursoSpec = req.query.spec;
        if(recursoSpec == 1){       //Se for pra ler um recurso específico
            var buscaValor = req.query.valor;    //Coleta a id do recurso específico a ser buscado
            var buscaTipo = req.query.tipo;      //Coleta o critério da busca
            if(buscaTipo == undefined){     //Verifica se buscaTipo é undefined
                res.status(400);    //Status: 400 bad request
                res.end();
                return 0;
            }
        }

        //Tenta coletar os dados do(s) recurso(s) no BD:
        if(recursoSpec == 1){               //Coletar recurso específico
            console.log('buscar recurso específico: '+buscaTipo+'; valor: '+buscaValor);
            switch(buscaTipo){      //Define o sql script com base no critério de busca
                case 'id':      //Busca por id
                    var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, U.stNome AS donoNome "+
                        "FROM tbRecursos R INNER JOIN tbUsuarios U ON R.stDono=U.stEmail WHERE R.itId="+buscaValor;
                    break;

                case 'nome':    //Busca por nome
                    var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, U.stNome AS donoNome "+
                        "FROM tbRecursos R INNER JOIN tbUsuarios U ON R.stDono=U.stEmail WHERE R.stNome='"+buscaValor+"'";
                    break;

                case 'data':    //Busca por data
                    var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, U.stNome AS donoNome "+
                        "FROM tbRecursos R INNER JOIN tbUsuarios U ON R.stDono=U.stEmail WHERE R.dtData="+buscaValor;
                    break;

                case 'dono':    //Busca por dono
                    var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, U.stNome AS donoNome "+
                        "FROM tbRecursos R INNER JOIN tbUsuarios U ON R.stDono=U.stEmail WHERE U.stNome='"+buscaValor+"'";
                    break;

                default:
                    res.status(401);    //Status: 400 bad request
                    res.end();
                    return 0;
            }
        }
        else if(recursoSpec == 0){                              //Coletar todos os recursos: define o script para SELECT *
            console.log('buscar todos os recursos');
            var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, U.stNome AS donoNome "+
                        "FROM tbRecursos R INNER JOIN tbUsuarios U ON R.stDono=U.stEmail";
        }
        //Faz a consulta:
        pool.query(sql, function(err, result, fields){
            if(err){    //Em caso de erro na execução da consulta
                console.log(err);
                res.status(500);    //Status: 500 internal server error
                res.end();
                return 0;
            }
            var recursos = [];      //Objeto que será enviado na response
            result.forEach(function(val, i){
                var tmp = {id: '', nome: '', data: '', dono: '', donoNome: ''};    //Objeto temporário que acomodará os dados
                tmp.id = result[i].id;
                tmp.nome = result[i].nome;
                tmp.data = result[i].data;
                tmp.dono = result[i].dono;
                tmp.donoNome = result[i].donoNome;
                recursos.push(tmp);     //Insere o objeto temporário no array de recursos
            });
            res.send(recursos);     //Envia o objeto com os dados na response
        });
    })

    .post(function(req, res){       //----------------Post: Create, Update, Remove----------------
        res.setHeader('Access-Control-Allow-Origin', '*');
        //Coleta os dados da request:
        var funcao = req.body.funcao;
        switch(funcao){
            case 'create':      //Criar recurso
                //Coleta os dados da request:
                var recursoId = req.body.id;
                var recursoNome = req.body.nome;
                var recursoDono = req.body.dono;
                //Tenta fazer a inserção no BD:
                var sql = "INSERT INTO tbRecursos VALUES("+recursoId+",'"+recursoNome+"',NOW(),'"+recursoDono+"', '')";
                pool.query(sql, function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500);
                    }
                    res.end();
                });
                break;

            case 'update':      //Atualizar recurso
                //Coleta os dados da request:
                var recursoId = req.body.id;
                var recursoNome = req.body.nome;
                var recursoData = req.body.data;
                //Faz o update no DB:
                console.log('recursoData = '+recursoData);
                var sql = "UPDATE tbRecursos SET stNome = '"+recursoNome+"', dtData='"+recursoData+"'"+
                            "WHERE itId="+recursoId;
                pool.query(sql, function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500);
                        res.end();
                        return 0;
                    }
                    if(result.affectedRows == 0)    //Se nada foi deletado, então houve algum erro na id
                        res.status(500);    //Staus: 500 server issue
                    res.end();
                });
                break;

            case 'delete':      //Deletar recurso
                //Coleta os dados da request:
                var recursoId = req.body.id;
                var recursoDono = req.body.dono;
                //Tenta deletar o recurso do BD:
                var sql = "DELETE FROM tbRecursos WHERE itId="+recursoId+" && stDono='"+recursoDono+"'";
                pool.query(sql, function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500);
                        res.end();
                        return 0;
                    }
                    if(result.affectedRows == 0)    //Se nada foi deletado, então o usuário não era dono do recurso
                        res.status(401);    //Staus: 401 unauthorized
                    res.end();
                });
                break;

            default:            //Em caso de função desconhecida
                console.log('Função recebida: '+funcao);
                res.status(400);    //Status: 400 bad request
                res.end();
        }
    });

/*  Router de upload de foto de recurso
    Recebe um form com a input file (iFoto) e um cookie com a id do recurso
 */
app.route('/recurso/uploadfoto')
    .post(function(req, res){
        console.log('tentando fazer upload de arquivo');
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files){
            if(err){
                console.log('erro');
                res.status(500);
                res.end();
                return 0;
            }
            var fotoNome = files.iFoto.name;    //Pega o nome do arquivo no file input
            var recursoId = req.cookies.ultimoRecursoCriadoId;      //Lê a id do recurso no cookie da request
            fs.mkdirSync('recursos/_'+recursoId);     //Cria o diretório do recurso no servidor
            var serverPath = 'C:/xampp/htdocs/restful/server/recursos/_'+recursoId+'/';
            var oldpath = files.iFoto.path;     //Caminho completo da file input
            var newpath = serverPath + fotoNome;    //Caminho novo = pasta do recurso no server + arquivo da file input
            fs.rename(oldpath, newpath, function (err){
                if(err){       //Em caso de erro ao transferir o arquivo de upload para a pasta no server
                    console.log(err);
                    res.status(500);
                    res.end();
                    return 0;
                }
                //Atualiza o registro do recurso no BD:
                var sql = "UPDATE tbRecursos SET stFoto='"+fotoNome+"' WHERE itId="+recursoId;
                pool.query(sql, function(err, result, fields){
                    if(err){        //Em caso de erro ao atualizar o registro do recurso:
                        console.log(err);
                        res.status(500);
                        res.end();
                        fs.unlink("recursos/_"+recursoId+'/');     //Deleta a foto do servidor
                    }
                    else{
                        //Caso o upload e registro tenham sido bem-sucedidos, redireciona de volta à página:
                        res.redirect('http://localhost/restful/view/sistema.html');
                        res.end();
                    }
                });
            });
        });
    });

/* Router de session
    Recebe um objeto com parâmetro sessionId,
    retorna um status que indica se a session é válida ou não
*/
app.route('/session')
.get(function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    //Coleta os dados da request:
    var sessionId = req.query.sessionId;
    //Verifica se a session existe:
    var i = 0;
    var found = 0;
    var data = new Date();
    while(i < session.length && found == 0){    //Percorre o array de sessions
        if(session[i].id == sessionId && session[i].expireDate < data)
            found = 1;
        i++;
    }
    if(found == 1)      //Caso esta session seja válida
        res.end();          //Envia resposta vazia com stauts 200
    else{               //Caso esta session não tena sido encontrada
        console.log('session id não encontrada: '+sessionId);
        res.status(404);    //Envia resposta vazia com status 404 not found
        res.end();
    }
});

/* Router de login
    Recebe um objeto com parâmetros usuario e senha,
    retorna um sessionId que deve ser armazenado em um cookie no cliente
*/
app.route('/login')
.post(function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    //Coleta os dados da request:
    var login = req.body.login;
    var senha = req.body.senha;
    //Define o script SQL:
    var sql = "SELECT stSenha FROM tbUsuarios WHERE stEmail='"+ login + "'";
    //Faz a consulta:
    pool.query(sql, function(err, result, fields){
        if(err){    //Em caso de erro na execução da consulta
            console.log(err);
            res.status(500);    //Status: 500 internal server error
            res.end();
        }else{
            //Faz a leitura do resultado:
            if(result[0].stSenha == senha){     //Caso a senha esteja correta
                var id = Math.floor(Math.random()*99999999);     //Gera o session id
                var expireDate = new Date();
                expireDate.setMinutes = expireDate.getDate + 20;    //Adiciona 20 min ao session expire time
                //Armazena esta session id com o expire date no array de sessions do server:
                session.push({id, expireDate});
                res.send({sessionId: id});      //Envia a response com a session id
                console.log('login efetuado com sucesso. Id: '+ id);
            }else{      //Caso a senha esteja incorreta
                console.log('Senha incorreta');
                res.status(401);    //Status: 401 unauthorized
                res.end();
            }
        }

    });
});

/* Router de logout
Recebe um objeto com parâmetro sessionId,
tenta eliminar a session se ela existir. Retorna sempre status 200.
*/
app.route('/logout')
.get(function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    //Coleta os dados da request:
    var sessionId = req.query.sessionId;
    console.log('logout id: '+sessionId);
    //Verifica se a session id existe:
    if(verificaSession(sessionId, 1) == 1){      //Caso a session exista, destrói
        res.end();
        console.log('session destruída, logout feito com sucesso');
    }else{                  //Caso a session não exista
        console.log('session id não encontrada para logout: '+sessionId);
        res.end();
    }
});

/* Router de cadastro
    Recebe um objeto com parâmetros nome, email e senha,
    retorna status 200 se o cadsatro for bem-sucedido, e 400 (bad request)
    com uma mensagem de erro caso os dados não sejam aceitos no INSERT do DB.
*/
app.route('/cadastro')
.post(function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    //Coleta os dados da request:
    var email = req.body.email;
    var nome = req.body.nome;
    var senha = req.body.senha;
    //Verifica se este email já está cadastrado:
    var sql = 'SELECT stEmail FROM tbUsuarios';
    pool.query(sql, function(err, result, fields){
        if(err){        //Se der erro no query
            res.status(500);        //Lança status 500 internal error
            res.end();
            return 0;
        }
        var i = 0;
        while(i < result.length){       //Percorre o array de resultados
            if(result[i].stEmail == email){     //Caso o email já exista
                res.status(400);        //Retorna status 400 e mensagem de erro
                res.send({msg: 'Este email já está cadastrado'});
                return 0;
            }
            i++;
        }
    });
    //Caso o email seja válido, realiza o cadastro no BD:
    var sql = "INSERT INTO tbUsuarios VALUES ('"+email+"','"+senha+"','"+nome+"')";
    pool.query(sql,function(err, result, fields){
        if(err){        //Se der erro no query
            res.status(500);        //Lança status 500 internal error
            res.end();
            return 0;
        }
        res.status(200);        //Se a inserção foi bem-sucedida, lança status 200
        res.end();
    });
});

/* */
function verificaSession(sessionId, destroy){
    var i = 0;
    var found = 0;
    var data = new Date();
    while(i < session.length && found == 0){    //Percorre o array de sessions
        if(session[i].id == sessionId && session[i].expireDate < data){  //Se a session existe e não expirou
            found = 1;      //Deixa found igual a 1
            if(destroy == 1)        //Caso seja pra destruir a session
                session.splice(i,i);    //Destrói a session
        }
        i++;
    }
    return found;
}
