/* 
    Router de CRUD de recursos
    Recebe uma request com parâmetro indicando a função (exceto para Read),
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
                    var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, R.stFoto AS foto, U.stNome AS donoNome "+
                        "FROM tbRecursos R INNER JOIN tbUsuarios U ON R.stDono=U.stEmail WHERE R.itId="+buscaValor;
                    break;

                case 'nome':    //Busca por nome
                    var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, R.stFoto AS foto, U.stNome AS donoNome "+
                        "FROM tbRecursos R INNER JOIN tbUsuarios U ON R.stDono=U.stEmail WHERE R.stNome='"+buscaValor+"'";
                    break;

                case 'data':    //Busca por data
                    var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, R.stFoto AS foto,U.stNome AS donoNome "+
                        "FROM tbRecursos R INNER JOIN tbUsuarios U ON R.stDono=U.stEmail WHERE R.dtData="+buscaValor;
                    break;

                case 'dono':    //Busca por dono
                    var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, R.stFoto AS foto,U.stNome AS donoNome "+
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
            var sql = "SELECT R.itId AS id, R.stNome AS nome, R.dtData AS data, R.stDono AS dono, R.stFoto AS foto, U.stNome AS donoNome "+
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
                tmp.foto = result[i].foto;
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

}