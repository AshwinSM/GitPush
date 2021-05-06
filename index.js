import Express, { response } from 'express';

const superagent = require('superagent');

const app =  new Express();
const port = 3000;
const client_id = "c0c3936b4710adcf7f2b";
const client_secret = "3440cc74f000acb5a7112963286f3745304b9469";
const CALLBACK_URL = 'https://github.com/login/oauth/access_token';
const scope = "repo user";
const codeVSAccessTokenMap = {};


app.get('/getToken', (request, response)=>{
    console.log("Inside GetToken");
    const {code} = request.query;
    const access_token = codeVSAccessTokenMap[code];
    delete codeVSAccessTokenMap[code];
    console.log(access_token);
    console.log(codeVSAccessTokenMap);
    response.send(access_token)
})

app.get('/user/callback', (request, response, next)=>{
    const {query} = request;
    const {code} = query;
    
    if(!code) {
        return response.send("Invalid Code");
    }
    
    superagent
        .post(CALLBACK_URL)
        .send({
            client_id: client_id,
            client_secret: client_secret,
            code : code
            })
        .set('Accept', 'application/json')
        .then(function(result){
            const data = result.body;
            codeVSAccessTokenMap[code] = data.access_token;
            console.log(data);
            console.log(codeVSAccessTokenMap); 
            response.send("Redirecting to GitPush chrome extension");
        });
    })

app.get('/getDirectories',(request, response, next) => {
    superagent
        .get('https://api.github.com/repos/AshwinSM/LeetCode/issues')
        .set('Accept', 'application/json')
        .then(function(data){
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


//Get HTML CSS and JS
app.get('/', (request, response)=>{
    response.sendFile('Client/signInPage.html' , { root : __dirname});
})

app.get('/signInPage', (request, response)=>{
    response.sendFile('Client/signInPage.html' , { root : __dirname});
})

app.get('/home', (request, response)=>{
    console.log("Inside Homee");
    response.sendFile('Client/homePage.html' , { root : __dirname});
})

app.get('/homePage.js', (request, response)=>{
    response.sendFile('Client/homePage.js' , { root : __dirname});
})

app.get('/homePage.css', (request, response)=>{
    response.sendFile('Client/homePage.css' , { root : __dirname});
})

app.get('/signInPage.js', (request, response)=>{
    response.sendFile('Client/signInPage.js' , { root : __dirname});
})

app.get('/signInPage.css', (request, response)=>{
    response.sendFile('Client/signInPage.css' , { root : __dirname});
})

app.get('/axios.min.js', (request, response)=>{
    response.sendFile('axios.min.js' , { root : __dirname});
})

app.get('*/octocat.png', (request, response)=>{
    response.sendFile('Images/logo.png' , { root : __dirname});
})

app.get('*/githubIcon.png', (request, response)=>{
    response.sendFile('Images/githubIcon.png' , { root : __dirname});
})

app.listen(port);
