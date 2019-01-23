/* 
    Router de login
    Recebe um objeto com parâmetros usuario e senha,
    retorna um sessionId que deve ser armazenado em um cookie no cliente
*/

var mysql = require('mysql');   //Faz o require do módulo mysql

//Declara o mysql connections pool:
var pool  = mysql.createPool({
    connectionLimit : 10,
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'restful'
});

module.exports = function(app, session){

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
                expireDate.setMinutes(expireDate.getMinutes() + 20);    //Adiciona 20 min ao session expire time
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

}