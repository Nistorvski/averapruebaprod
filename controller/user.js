'use strict'

var validator = require('validator');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

var controller = {


    test: function ( req, res ){
        return res. status(200).send({
            message: 'Prueba del controllador de usuarios'
        });
    },


    save: function(req, res){
        //Recoger los parametros del body
        var params = req.body;

        //Validar los datos
        try{

            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);

        }catch(err){
            return res.status(404).send({
                status:'error',
                message:'Faltan datos por enviar',
            });
        }
                //Si se valida
        if(validate_name && validate_surname && validate_email && validate_password){
            //Crear el objeto de ususarios 
                var user = new User();
            //Asignar valores al usuario creado
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.rol = 'ROLE_USER';
            user.image = null;
            
            //Comprobar si existe el usuario
            User.findOne({email: user.email}, (err, issetUser)=> {

                if (err) {
                    return res.status(500).send({
                        status:'error',
                        message:'No se puede comprobar la duplicidad del usuario '
                    });
                    
                }

                if(!issetUser){
                    
                //Si no existe, proceder a cifrar la contraseña y guardar el usuario.

                    bcrypt.hash(params.password, null, null, (err, hash)=>{
                        user.password = hash;

                        //Y guardar el usuario

                        user.save((err, userStored)=> {

                            if(err){
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'El ususario no se pudo guradar'
                                });
                               
                            }

                            if(!userStored){
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'El ususario no se pudo guradar'
                                });
                            }

                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            }); 
                        }); //Close guardado de usuario

                    });//Close bcrypt 
                }                
            })  ;     

        }else{
            return res.status(500).send({
                status:'error',
                message:'El usuario no es valido'
            });
        }
          

    },
    login: function(req, res) {
        //Recoger los parametros de la peticion
        var params = req.body;

        //Validar los datos
        try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch(err){
            return res.status(404).send({
                message:'Error al validar los datos'
            });
        }

        if(!validate_email && !validate_password){
        
            return res.status(200).send({
                message:'Los datos son incorector, intentalo de nuevo'
            });

        }

           //buscar usuarios que conincidan con el email
           User.findOne({email: params.email.toLowerCase()}, (err, user)=>{

            if(err || !user) {
                return res.status(500).send({
                    status:'error',
                    message:'El usuario no existe'
                });
            }   
            //Si lo encuentra,
           //Comprobar la contraswña (coincidencia de email y password / bcrypt)
            bcrypt.compare(params.password, user.password, (err, check)=>{
                  //Si es correcto,

                  if(check){

                    

                    //Generar eltoken de jwt y devolverlo
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{

                        //Antes  limpiar un poco el user
                        user.password = undefined;

                        //Devolcer los datos
                        return res.status(200).send({
                            status:'success',
                            message: 'Método de login',
                            user
                        });
                    }

                  }else{
                      return res.status(200).send({
                          status:'error',
                          message:'La contraseña es incorecta'
                      });
                  }               
            });         
       });
    },  

    update: function(req, res){
        // Paso 0. Crear el middleware para comprobar el jwt token y ponerselo a la ruta

        //Recoger datos del usuario
        var params = req.body;

        //Validar los datos (recomendable)

            try{

                var validate_name = !validator.isEmpty(params.name);
                var validate_surname = !validator.isEmpty(params.surname);
                var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
              

            }catch(err){
                return res.status(404).send({
                    status:'error',
                    message:'Faltan datos por enviar',
                });
            }

            //Eliminar propiedades inecesarias
                delete params.password;         

            //Comprobar la duplicidad del email
            if(req.user.email != params.email){ 
                    

                 //buscar usuarios que conincidan con el email
                User.findOne({email: params.email.toLowerCase()}, (err, user)=>{

                    if(err ) {
                        return res.status(500).send({
                            status:'error',
                            message:'Error al intentar identificarse..¡!'
                        });
                    }  

                    if(user && user.email == params.email){
                        return res.status(500).send({
                            status:'error',
                            message:'El email no puede ser modificado'
                        });
                    }else{
                                    //Repeticion  de Buscar y actualizar documento
                        var userId = req.user.sub;
                    
                            
                        User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) =>  {

                            if(err){
                                return res.status(500).send({
                                    status:'error',
                                    message: 'No se pudo actualizar el ususario'
                                });
                            }
                
                            if(!userUpdated){
                                return res.status(404).send({
                                    status:'error',
                                    message:'No se encontró el usuario a actualizar'
                                });
                            }
                
                            //Devolver una respuesta
                            return res.status(200).send({
                                status:'success',
                                user: userUpdated
                            });
    
                            
                             }); 
    
                    }                   

                });

            }else{

                
                //Buscar y actualizar documento
            var userId = req.user.sub;
        
                
                User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) =>  {
    
                    if(err){
                        return res.status(500).send({
                            status:'error',
                            message: 'No se pudo actualizar el ususario'
                        });
                    }
        
                    if(!userUpdated){
                        return res.status(404).send({
                            status:'error',
                            message:'No se encontró el usuario a actualizar'
                        });
                    }
        
                    //Devolver una respuesta
                    return res.status(200).send({
                        status:'success',
                        user: userUpdated
                    });
        
        
                  }); 
        
                
           
            }
             
      
    },

    uploadAvatar: function(req, res){
        //Devolver el modulo de multiparty (que es un middleware)/hecho en routes
        //Recoger el fichero de la petición
        var file_name = 'Avatar no subido';

        if(!req.files){
            return res.status(404).send({
                status:'error',
                message: file_name
            }); 
        }

        //Conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext =ext_split[1];

        //Comprobar extension (solo imagenes), si no es valido, borrar el fichero
            if(file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'png' && file_ext != 'gif'){
                fs.unlink(file_path, (err)=> {

                    return res.status(404).send({
                        status:'error',
                        message: 'La extensión no es válida'
                    }); 
                });
            }else{
                 //Sacar el id del ususario identificado
                var userId = req.user.sub;
                //Buscar y actualizar documento en la db
                User.findOneAndUpdate({_id: userId}, {image: file_name}, {new:true},(err, userUpload)=> {

                    if(err){
                        return res.status(500).send({
                            status:'error',
                            message:'La imagen no se pudo subir'
                        });
                    }

                    if(!userUpload){
                        return res.status(404).send({
                            status:'error',
                            message: 'La imagen no existe'
                        });
                    }

                    //Devolver respuesta
                return res.status(200).send({
                    status:'success',
                    user: userUpload
                });
                });
                
            }
       
    },

    avatar: function(req, res){
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile, (exists)=> {
            if(exists){
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({
                    message:'La imagen no existe'
                });
            }
        });

    },

    getUsers:function(req, res){
        User.find().exec((err, users)=>{

            if(err || !users){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se ha encontrado usuarios'
                });
            }

            return res.status(200).send({
                status: 'success',
                 users
            })


        });
    },

    getUser: function(req, res){
        var userId = req.params.userId;

        User.findById(userId).exec((err, user)=> {

            if(err || !user){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se ha encontrado el usuario'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            })


        });

    },

}
module.exports = controller;