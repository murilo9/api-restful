var indexTestController = new Vue({
    el: "#vueTest",
    data: {},
    methods: {
        clickButton: function(button){
            switch(button){
                case 'get':
                    $.get('http://localhost:8888/recurso/test', function(res, status){
                        if(status == 'success')     //Resposta em texto simples
                            alert(res);
                        else
                            alert('Status: '+status);
                    });
                    break;
                case 'post':
                    $.post('http://localhost:8888/recurso/test', function(res, status){
                        if(status == 'success'){     //Resposta em JSON
                            alert(res.resposta);
                        }else
                            alert('Status: '+status);
                    });
                    break;
                //TODO case put, case delete
            }
        }
    },
    created: function(){
        
    }
});