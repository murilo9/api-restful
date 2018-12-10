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
        database: 'orcommerce'
    });
});

/* Router de um recurso genérico */
app.route('/recurso/test')      //Rota de testes
    .get(function(req, res){
        console('GET request recebida em /recurso');
        //middleware
        res.send('get recurso');    //Envia resposta em texto simples
    })
    .post(function(req, res){
        console('POST request recebida em /recurso');
        //middleware
        var resObj = {resposta: 'POST recurso'};
        res.json(resObj);    //Envia resposta em JSON
    })
    .put(function(req, res){
        console('GET request recebida em /recurso');
        //middleware
        res.send('<p>put recurso</p>');    //Envia resposta em HTML
    })
    .delete(function(req, res){
        console('GET request recebida em /recurso');
        //middleware
        res.send('<resposta>delete recurso</resposta>');    //Envia resposta em XML
    });