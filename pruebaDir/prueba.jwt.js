'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');

exports.createToken = function(user) {
    var payload = {
        sub: user._id,
        name:user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user. image,
        int: moment().unix(),
        exp: moment().add(30, 'days').unix
    };
 
return jwt.encode(payload, 'clave-para-generar-el-token-1234');

}

