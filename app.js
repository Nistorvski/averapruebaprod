'use strict'

//Importaciones
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Rutas
var user_route = require('./routes/user');
var post_route = require('./routes/post');
var comment_route = require('./routes/comment');

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Reescribir rutas

app.use('/api', user_route);
app.use('/api', post_route);
app.use('/api', comment_route);

//Exportar

module.exports = app;