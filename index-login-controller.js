var indexLoginController = new Vue({
    el: "#vueLogin",
    data: { login: '', senha: ''},      //Dados sob os quais esta instância Vue opera
    methods: {
        fazerLogin: function(){
            var req = {login: this.login, senha: this.senha};
            $.ajax({
                url: 'http://localhost:8888/login',
                data: req,
                method: 'post',
                statusCode: {
                    200: function(){ alert('login ok')},
                    401: function(){ alert('Dados incorretos.')}
                }
            });
        }
    },
});