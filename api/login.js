var express = require('express');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

var login = express.Router();

var driver = neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','talha'));
var session = driver.session();

login.post('/login',bodyParser.json(),(req,res)=>{
    const email = req.body.email;
    const pass = req.body.pass;

    var response = {code:1,msg:'Login Succesfull!'};

    session
    .run(`MATCH (u:User {email:'${email}'}) RETURN u`)
    .then((result)=>{
        if(result.records.length<1){
            response.code = 0;
            response.msg = "We found no Account!";
            res.send(response);
        }else{
            session
            .run(`MATCH (u:User {email:'${email}'}) WHERE u.pass='${pass}' RETURN u`)
            .then((result)=>{
                if(result.records.length<1){
                    response.code = -1;
                    response.msg = "Worng Password, Try Again!";
                    res.send(response);
                }else{
                    res.send(response);
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

module.exports = login;