var express  = require('express');

var app = express();

var signup = require('./api/signup');
app.use('/api',signup);

var login = require('./api/login');
app.use('/api',login);

var category = require('./api/category');
app.use('/api',category);

const PORT = process.env.PORT || 3009;
app.listen(PORT,()=>console.log(`Listenning on port ${PORT}`));