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
retorna status 400 em caso de logout bem-sucedido
*/
app.route('/logout')
.get(function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    //Coleta os dados da request:
    var sessionId = req.query.sessionId;
    console.log('logout id: '+sessionId);
    //Verifica se a session id existe:
    var sessionDestroyed = 0;
    var i = 0;
    while(i < session.length || !sessionDestroyed){
        if(sessionId == session[i].id && sessionDestroyed == 0){   //Se a session fornecida for igual a encontrada
            session.splice(i, 1);       //Deleta esta session do array de sessions
            sessionDestroyed = 1;
        }
        i++;
    }
    if(sessionDestroyed == 1){      //Caso a session tenha sido destruída
        res.end();
        console.log('session destruída, logout feito com sucesso');
    }else{                  //Caso a session não tenha sido encontrada
        console.log('session id não encontrada para logout: '+sessionId);
        res.end(); 
    }
});