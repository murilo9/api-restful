//Declaração dos módulos utilizados:
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var url = require('url');

//Variáveis globais:
var session = [];   //Array de sessions
var app = express();        //Express app

var verificaSession = function(sessionId, destroy){
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
});

//Rota de recurso genérico:
var rotaRecurso = require('./routes/recurso-gen')(app);

//Rota de recurso padrão:
var rotaRecurso = require('./routes/recurso')(app);

//Rota de recurso/foto:
var rotaRecursoFoto = require('./routes/recurso-foto')(app);

//Rota de session:
var rotaSession = require('./routes/session')(app, session);

//Rota de login:
var rotaLogin = require('./routes/login')(app, session);

//Rota de logout:
var rotaLogout = require('./routes/logout')(app, session, verificaSession);

//Rota de cadastro:
var rotaCadastro = require('./routes/cadastro')(app);
