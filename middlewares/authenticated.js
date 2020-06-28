'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave-secreta-para-generar-el-token-7777";

exports.authenticated = function( req, res, next){
    console.log('ESTAS PASANDO POR EL  MIDDLEWARE..¡!');

    //Comprobar si llega la auatorización
    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'La petición no tiene la cabecera de Authorization.¡!'
        });
    }

    //Limpiar el token, quitar la comillas
        var token = req.headers.authorization.replace(/['"]+/g, '');
    
    //Decodificar el token
        try{
            var payload = jwt.decode(token, secret);

                //Comprobar si el token ha expirado
                if(payload.exp <= moment().unix()){
                    return res.status(404).send({
                        message: 'El token ha expirado..¡!'
                    });
                }

        }catch(ex){
            return res.status(404).send({
                message: 'El token no es válido..¡!'
            });
        }



    //Adjuntar usuario identificado a request
        req.user = payload;

    //Pasar a la acción
    next();

}  //Cierre de todo el método.