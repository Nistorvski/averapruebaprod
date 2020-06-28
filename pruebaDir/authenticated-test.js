'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave-secreta-para-el-token-1234';

exports.authenticated = function(req, res, next){

    //Comprobar si llega la Authorization (en headers)
        if(!req.headers.authenticated){
            return res.status(404).send({
                message:'La petición no tiene la cabecera Authenticated..'
            });
        }

    //Limpiar le token de comillas
var token = req.headers.authenticated.replace(/['"]+/g, '');

    //Decodificar el token

    try{

        var payload = jwt.decode(token, secret);

        //Comprobar si el token ha expirado

        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                message: 'El token ha expirado..'
            });
        }

    }catch(ex){
        return res.status(404).send({
            message: 'El token no es válido..'
        });
    }    

    //Adjuntar usuario identificado a request
        req.user = payload; 3
    //Pasar a la ación 
    next();

}