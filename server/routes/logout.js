/* 
    Router de logout
    Recebe um objeto com parâmetro sessionId,
    tenta eliminar a session se ela existir. Retorna sempre status 200.
*/

module.exports = function(app, session, verificaSession){

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

}