'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 1234;


mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/prueba-solo').then(()=> {
    console.log('Conexión con exito a la base de datos.. ');

    //Crear el servidor
    app.listen(port, ()=>{
        console.log('El servidor está corriendo el localhost:1234');
    })

}).catch(error => {
    console.log(error);
});

