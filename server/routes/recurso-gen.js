/* 
    Router de um recurso genérico para teste de requests 
*/

module.exports = function(app){

app.route('/recurso/test')      //Rota de testes
    .get(function(req, res){
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('GET request recebida em /recurso');
        //middleware
        res.send('<resposta>get recurso</resposta>');    //Envia resposta em texto XML (ou HTML ou texto simples)
    })
    .post(function(req, res){
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('POST request recebida em /recurso');
        //middleware
        var resObj = {resposta: 'post recurso'};
        res.json(resObj);    //Envia resposta em JSON
    })

}