var express = require('express');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

//Added a comment

var category = express.Router();

var driver = neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','talha'));
var session = driver.session();

category.get('/category/:userName',(req,res)=>{
    const userName = req.params.userName;
    var response = {code: 1, msg: []};
    var categories = [];

    session
    .run(`MATCH (u:User {userName:'${userName}'})-[r:INTERESTED]->(c:Category) RETURN c`)
    .then((results=>{
        results.records.forEach(record=>{
            var category = {name: record._fields[0].properties.name};
            categories.push(category);
        });

        session
            .run(`MATCH (c:Category) RETURN c`)
            .then((result)=>{
                result.records.forEach(record => {
                    var name = record._fields[0].properties.name;
                    var item = {name: name,isInterested:checkInterest(categories,name)};
                    response.msg.push(item);
                });
                res.send(response);
            })
            .catch((err)=>{
                var item = {name:'err2',isInterested:false};
                response.code = 0;
                response.msg.push(item);
                res.send(response);
            });

    }))
    .catch((err)=>{
        var item = {name:'err1',isInterested:false};
        response.code = 0;
        response.msg.push(item);
        res.send(response);
    });

});

function checkInterest(categories,name){
    var interested = false;
    categories.forEach(item=>{
        if(item.name==name){
            interested = true;
            return;
        }
    });
    return interested;
}

category.post('/category/:userName',bodyParser.json(),(req,res)=>{
    const categories = req.body;
    const userName = req.params.userName;
    var response = {code: 1, msg: []};

    session
    .run(`MATCH (u:User {userName:'${userName}'})-[r:INTERESTED]->(c:Category) DELETE r`)
    .then((result)=>{
        const cmd = getCmd(categories,userName);
        session
        .run(cmd)
        .then((result)=>{
            var item = {name:'Done'};
            response.msg.push(item);
            res.send(response);
        })
        .catch((err)=>{
            var item = {name:'err'};
            response.code = 0;
            response.msg.push(item);
            res.send(response);
       });
    })
    .catch((err)=>{
        var item = {name:'err'};
        response.code = 0;
        response.msg.push(item);
        res.send(response);
    });

});

function getCmd(categories,userName){
    var cmd = `MATCH (u:User {userName:'${userName}'})`;

    categories.forEach(category=>{
        const name = category.name;
        cmd = cmd+` MATCH (${name}:Category {name:'${name}'})`;
    });

    categories.forEach(category=>{
        const name = category.name;
        cmd = cmd+` CREATE (u)-[:INTERESTED]->(${name})`;
    });

    return cmd;
}

module.exports = category;