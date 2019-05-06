var express = require('express');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

var signup = express.Router();

var driver = neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','talha'));
var session = driver.session();

signup.post('/signup',bodyParser.json(),(req,res)=>{

    const name = req.body.name;
    const userName = req.body.userName;
    const email = req.body.email;
    const pass = req.body.pass;

    var response = {code:1,msg:'User Created'};

    session
    .run(`MATCH (u:User {email:'${email}'}) RETURN u`)
    .then((result)=>{
        if(result.records.length>0){
            response.code = 0;
            response.msg = "This Account Already Exists";
            res.send(response);
        }else{
            session
            .run(`MATCH (u:User {userName:'${userName}'}) RETURN u`)
            .then((result)=>{
                if(result.records.length>0){
                    response.code = -1;
                    response.msg = "Try Another User Name";
                    res.send(response);
                }else{
                    session
                    .run(`CREATE (u:User {name:'${name}',userName:'${userName}',email:'${email}',pass:'${pass}'})`)
                    .then((result)=>{
                        res.send(response);
                    })
                    .catch((err)=>{
                        response.code = -2;
                        response.msg = "Something went worng. Try Again!";
                        res.send(response);
                    });
                }
            })
            .catch((err)=>{
                response.code = -2;
                response.msg = "Something went worng. Try Again!";
                res.send(response);
            });
        }
    })
    .catch((err)=>{
        response.code = -2;
        response.msg = "Something went worng. Try Again!";
        res.send(response);
    });

});

module.exports = signup;