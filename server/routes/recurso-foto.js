/*  
    Router de upload de foto de recurso
    Recebe um form com a input file (iFoto) e um cookie com a id do recurso
 */

var formidable = require('formidable');     //Faz o require do módulo formidable (pra fazer uploads)
var fs = require('fs');     //Faz o require do módulo fs (file system)

module.exports = function(app){

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

}