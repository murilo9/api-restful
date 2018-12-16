var cadastroController = new Vue({
    el: "#vueCadastro",
    data: { nome: '', email: '', senha: '', resenha: ''},
    methods: {
        validarForm: function(){
            //Faz a validação do form
            if(this.nome.lenght < 3){
                alert('O nome deve ter pelo menos 3 caracteres');
                return 0;
            }
            if(this.email.lenght < 7){
                alert('Insira um email válido');
                return 0;
            }
            if(this.senha != this.resenha){
                alert('As senhas não coincidem');
                return 0;
            }
            if(this.senha.lenght < 6 || this.senha.lenght > 19){
                alert('A senha deve conter entre 6 e 20 caracteres');
                return 0;
            }
            //Caso ao form tenha passado na validação, envia ao servidor:
            var req = {nome: this.nome, email: this.email, senha: this.senha};      //Dados a serem enviados na request
            $.ajax({
                url: 'http://localhost:8888/cadastro',
                data: req,
                method: 'post',
                statusCode:{
                    400: function(){
                        alert('Este email ja está cadastrado');
                    }
                },
                success: function(){
                    alert('Usuário cadastrado com sucesso');
                    location.href="index.html";
                }
            });
        }
    }
});