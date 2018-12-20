var sistemaController = new Vue({
    el: "#vueSistema",

    data: { 
        editarRecurso: false,
        dataAgora: new Date(),
        select: {tipo: 'id', valor: '', spec: ''},    //Objeto da request de select
        create: {funcao: 'create', id: '', nome: '', dono: ''},     //Objeto da request de create
        delete: {funcao: 'delete', id: '', dono: ''},     //Objeto da request de delete
        update: {funcao: 'update', id: '', nome: '', data: ''},      //Objeto da request de update
        recursos: []
    },

    methods: {
        fazerLogout: function(){
            var sessionId = Cookies.get("sessionId");       //Pega a session id dos cookies
            //Envia um GET para o server com a session id:
            $.get('http://localhost:8888/logout?sessionId='+sessionId, function(res, status){
                location.href="index.html";     //Redireciona de volta ao index
            });
        },

        //Funções de CRUD:
        selectRecurso: function(specific){              //----Função de Select----
            var self = this;    //Variável self para referenciar data
            this.select.spec = specific;    //Indica se a request é de um recurso específico ou não
            $.ajax({
                url: 'http://localhost:8888/recurso',
                method: 'get',
                data: self.select,
                statusCode: {
                    500: function(){ alert('Erro no servidor, tente mais tarde') },
                    400: function(){ alert('Bad request (erro no código da página)') }
                },
                success: function(res){        //Em caso de sucesso carrega a response para data
                    self.recursos = [];     //Limpa o array data.recursos primeiro
                    res.forEach(function(val, i){
                        //Cria o objeto temporário que acomodará os dados da response:
                        var tmp = {id:'', nome:'', data:'', dono:'', donoNome:''}    
                        tmp.id = res[i].id;
                        tmp.nome = res[i].nome;
                        tmp.data = res[i].data.slice(0, -5);
                        tmp.dono = res[i].dono;
                        tmp.donoNome = res[i].donoNome;
                        self.recursos.push(tmp);    //Insere o objeto temporário em data.recursos
                    });
                    
                }
            });
        },

        criarRecurso: function(){              //-----Função de Create----
            var self = this;        //Variável self para referenciar data
            //Adiciona os dados que faltam:
            this.create.id = Math.floor(Math.random()*9999999)      //Gera uma id aleatória
            this.create.dono = Cookies.get('login');        //Insere o email do usuário
            $.ajax({
                url: 'http://localhost:8888/recurso',
                method: 'post',
                data: self.create,
                statusCode: {
                    500: function(){ alert('Erro no servidor, tente de novo') },
                    400: function(){ alert('Bad request (erro no código da página)') }
                },
                success: function(res){
                    alert('Recurso inserido com sucesso');
                    self.selectRecurso(0);      //Atualiza a lista de recursos
                }
            });
        },

        deletarRecurso: function(recursoId){              //----Função de Delete----
            var self = this;    //Variável self para referenciar data
            //Adiciona os dados que faltam:
            this.delete.dono = Cookies.get('login');    //Insere o email do usuário
            this.delete.id = recursoId;     //Insere a id do recurso a ser deletado
            $.ajax({
                url: 'http://localhost:8888/recurso',
                method: 'post',
                data: self.delete,
                statusCode: {
                    500: function(){ alert('Erro no servidor, tente mais tarde') },
                    401: function(){ alert('Você não pode deletar um recurso que não é seu') }
                },
                success: function(res){
                    alert('Recurso deletado com sucesso');
                    self.selectRecurso(0);      //Atualiza a tabela de recursos
                }
            });
        },

        atualizarRecurso: function(){              //----Função de Update----
            var self = this;        //Variável self para refernciar data
            $.ajax({
                url: 'http://localhost:8888/recurso',
                method: 'post',
                data: self.update,
                statusCode: {
                    500: function(){ alert('Erro no servidor, tente mais tarde') }
                },
                success: function(res){
                    alert('Recurso atualziado com sucesso');
                    self.editarRecurso = false;
                    self.selectRecurso(0);      //Atualiza a lista de recursos
                }
            })
        },

        verifAtualizarRecurso: function(recursoId){      //Verifica se é possível fazer update deste recurso
            var self = this;        //Variável self para referenciar data
            this.recursos.forEach(function(recurso, i){      //Percorre o array de recursos
                if(recurso.id == recursoId){    //Quando achar o recurso especificado
                    if(recurso.dono == Cookies.get('login')){    //Se o usuário for dono deste recurso
                        self.editarRecurso = true;      //Abre a janela de edição
                        //Carrega os dados do recurso pro objeto de update (que será exibido nas inputs):
                        self.update.nome = recurso.nome;
                        self.update.data = recurso.data;
                        self.update.id = recursoId;     //Coloca esta id no objeto de update
                    }else            //Se o usuário não for dono deste recurso
                        alert('Você não pode editar um recurso que não é seu');
                }
            })
        },

        fechaRecurso: function(){       //Fecha a janela de editar recurso
            this.editarRecurso = false;
        }

    },

    created: function(){    //Assim que a instância do sistema for criada, verifica a session id e busca todos os recursos:
        var sessionId = Cookies.get("sessionId");
        //Verifica a session id:
        $.ajax({
            url: 'http://localhost:8888/session?sessionId=' + sessionId,         //GET em /session
            method: 'get',
            statusCode: {
                404: function(){ location.href = 'index.html' }    //Em caso de session inexistente, volta pra index
            }
        });
        //Busca todos os recursos:
        this.selectRecurso(0);
    }
});