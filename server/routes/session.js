/* 
    Router de session
    Recebe um objeto com parâmetro sessionId,
    retorna um status que indica se a session é válida ou não
*/

module.exports = function(app, session){

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
        if(session[i].id == sessionId && session[i].expireDate > data)
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

}