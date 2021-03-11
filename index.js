import Express from 'express';

const superagent = require('superagent');

const app =  new Express();
const port = 3000;

app.get('/', (request, response)=>{
    response.sendFile('Client/homePage.html' , { root : __dirname});
})

app.get('/homePage.js', (request, response)=>{
    response.sendFile('Client/homePage.js' , { root : __dirname});
})

app.get('/user/callback', (request, response, next)=>{
    const {query} = request;
    const {code} = query;
    
    if(!code) {
        return response.send("Invalid Code");
    }

    superagent
        .post('https://github.com/login/oauth/access_token')
        .send({ 
            client_id: 'c0c3936b4710adcf7f2b',
            client_secret: '3440cc74f000acb5a7112963286f3745304b9469',
            code : code
            })
        .set('Accept', 'application/json')
        .then(function(result){
            const data = result.body;
            console.log(data);
            response.send(data);
        }); 
})

app.get('/user', (request, response, next) => {
    const access_token = '344b43cb254aeb5dcf061e83fbcd2877920fdaf6';
    superagent
    .get('https://github.com/user')
    .set('Authorization', 'token'+access_token)
    .then(function(result) {
         response.send(result.body);
    });
});

app.listen(port)

