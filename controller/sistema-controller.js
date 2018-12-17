var sistemaController = new Vue({
    el: "#vueSistema",

    data: { 
        select: {tipo: 'id', valor: '', spec: ''},    //Objeto da request de select
        create: {},     //Objeto da request de create
        delete: {},     //Objeto da request de delete
        update: {},      //Objeto da request de update
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
                        tmp.data = res[i].data;
                        tmp.dono = res[i].dono;
                        tmp.donoNome = res[i].donoNome;
                        self.recursos.push(tmp);    //Insere o objeto temporário em data.recursos
                    });
                    
                }
            });
        },
        createRecurso: function(){              //-----Função de Create----
            //TODO
        },
        deleteRecurso: function(){              //----Função de Delete----
            //TODO
        },
        updateRecurso: function(){              //----Função de Update----
            //TODO
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