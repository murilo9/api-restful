/* 
    Router de cadastro
    Recebe um objeto com parâmetros nome, email e senha,
    retorna status 200 se o cadsatro for bem-sucedido, e 400 (bad request)
    com uma mensagem de erro caso os dados não sejam aceitos no INSERT do DB.
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

module.exports = function(app){

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

}