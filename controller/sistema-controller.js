var sistemaController = new Vue({
    el: "#vueSistema",
    data: {},
    methods: {
        fazerLogout: function(){
            var sessionId = Cookies.get("sessionId");       //Pega a session id dos cookies
            //Envia um GET para o server com a session id:
            $.get('http://localhost:8888/logout?sessionId='+sessionId, function(res, status){
                location.href="index.html";     //Redireciona de volta ao index
            });
        }
    },
    created: function(){    //Assim que a instância do sistema for criada, verifica a session id:
        var sessionId = Cookies.get("sessionId");
        $.ajax({
            url: 'http://localhost:8888/session?sessionId=' + sessionId,         //GET em /session
            method: 'get',
            statusCode: {
                404: function(){ location.href = 'index.html'}    //Em caso de session inexistente, volta pra index
            }
        });
    }
});