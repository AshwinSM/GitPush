import { createServer } from 'http';
import {readFile} from 'fs';
import {parse} from 'url';
const superagent = require('superagent');

createServer(function(req, res) {
    const path = parse(req.url).pathname
    ;
    if(path == '/') {
        readFile("Client/HomePage.html", function (error, pgResp) {
                        if (error) {
                            res.writeHead(404);
                            res.write('Contents you are looking are Not Found');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.write(pgResp);
                        }
                        res.end();
        });
    }
    else if (path == '/user/callback') { //check the URL of the current request
        const queryObject = parse(req.url,true).query;
        const {code} = queryObject;
        // res.end(code);
        if(!code){
            res.end("Error in Authentication");
        }

        superagent
        .post('https://github.com/login/oauth/access_token')
        .send({ 
            client_id: 'c0c3936b4710adcf7f2b',
            client_secret: '3440cc74f000acb5a7112963286f3745304b9469',
            code : code
            }) // sends a JSON post body
        .set('Accept', 'application/json')
        .then(function(result){
            const data = result.body;
            console.log(data);
            const {access_token} = data;
            const {token_type} = data;
            const {scope} = data;
            // res.setHeader('Content-Type', 'application/json');
            // res.end(data);
            res.end(access_token + " "+ token_type+" "+scope);
        });

    }else {
        res.write("Starting Git Push. Come on Ashwin and Abi!!!!"+ req.path);
        res.end();
    }
    
}).listen(3000);
