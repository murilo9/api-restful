var sistemaController = new Vue({
    el: "#vueSistema",
    data: {},
    methods: {},
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