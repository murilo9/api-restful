var indexLoginController = new Vue({
    el: "#vueLogin",
    data: { login: '', senha: ''},      //Dados sob os quais esta instância Vue opera
    methods: {
        fazerLogin: function(){
            var self = this;    //Variável self para referenciar data
            var req = {login: this.login, senha: this.senha};   //Dados a serem enviados na login request
            $.ajax({
                url: 'http://localhost:8888/login',
                data: req,
                method: 'post',
                statusCode: {
                    401: function(){ alert('Dados incorretos.')}    //Tratamento de status 401
                },
                success: function(res){         //Tratamento de login bem-sucedido
                    Cookies.set('sessionId', res.sessionId);    //Armazena a sessionId num cookie
                    Cookies.set('login', self.login);       //Armazena o login(email) num cookie
                    location.href='sistema.html';       //Redireciona para a página do sistema
                }
            });
        }
    },
});