

    // Voy a hacer de nuevo el controlador de user para ver si entendí bien los procesos.

    var validator = require ('validator');
    var User = require ('../models/user');
    var bcrypt = require('bcrypt-nodejs');




    var controller = {

        save: function (req, res){

            //Recoger datos/parametros del body
            var params = req.body;

            //Validar los datos
            try {

            
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname= !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && !validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
            }catch(err){
                return res.status(500).send({
                    message: 'Error al validar los datos'
                });
            }

            if(validate_name && validate_surname && validate_email && validate_password) {
            //Crear el objeto de usuario (new user..)
                var user = new User();
            //Añadir valores al objeto
                user.name = params.name;
                user.surname = params.surname;
                user.email = params.email.toLowerCase();
                user.password = params.password;
                user.role = 'ROLE_USER';
                user.image = null;

                //Comprobar si el usuario existe:  lo haré por el email
                User.findOne({email: user.email}, (err, issetUser)=> {
                    if (err){
                        return res.status(500).send({
                            message:'error en algo con el email y el usuario'
                        });
                    }



                    if(!issetUser){
                        //Si no existe
                        //Encriptar la contraseña
                        bcrypt.hash(params.password), null, null ((err,hash)=>{
                            user.password =hash;

                        });

                    //Y guardar el user en la base de datos
                        user.save((err, user)=>{
                            if(err){
                                return res.status(500).send({
                                    message:'El usuario no su pudo guardar'
                                });
                            }

                            if(!user){
                                return res.status(404).send({
                                    message: 'No hay ningun usuario para guardar'
                                });
                            }


                            //Devolver respuesta
                            return res.status(200).send({
                                message: 'El usuario se ha guardado correctamente',
                                user
                            });

                        });  
                    }else{
                        return res.status(200).send({
                            message:'Este ususario ya está registrado '
                        })
                    }

                })

            }


        },


        login: function(req, res){
            //Recoger los parametros del body
                var params = req.body;

                //Validar los datos
                try {

                    var validate_email = !validator.isEmpty(params.email) && !validator.isEmail(params.email);
                    var validate_password = !validator.isEmpty(params.password);
                    }catch(err){
                        return res.status(500).send({
                            message: 'Error al validar los datos'
                        });
                    }

                    if(!validate_email && !validate_password){
                        return res.status(500).send({
                            message: 'Los datos no se validaron correctamente'
                        });
                    }
                    
            //Comprobar si el email existe
            User.findOne({email: params.email.toLowerCase()}, (err, user)=> {

                if(err || !user){
                    return res.status(500).send({
                        message: 'El usuario no existe, porfavor priemro registrate'
                    });
                }

             if(user) {
                //Si existe
                    //Comprobar la contraseña
                    bcrypt.compare(params.password, user.password, (err, check)=> {
                        if(check){
                            //Generar el token del usuario de jwt. 
                            if(params.gettoken){
                                return res.status(200).send({
                                    token: jwt.createToken(user)
                                });
                            }else{
                                //Limpiar los datos que devuelve sin el token
                                user.password = undefined;

                                //Devolver los datos

                             return res.status(200).send({
                                user
                            })

                            }

                             
                        }else{
                            return res.status(404).send({
                                message:'La contraseña es incorrecta'
                            })
                        }
                    });
                    
             }  
          

            });
      
        },

        update: function(req, res){
            //Crear el middleware para la ruta el PASO 0 .

            //Recoger los datos/parámetros del body
            var params = req.body;
            //Validar los datos
            try {

            
                var validate_name = !validator.isEmpty(params.name);
                var validate_surname= !validator.isEmpty(params.surname);
                var validate_email = !validator.isEmpty(params.email) && !validator.isEmail(params.email);
                
                }catch(err){
                    return res.status(500).send({
                        message: 'Error al validar los datos'
                    });
                }

            //Comprobar duplicidad de email
            if(req.user.email != params.email){            

                User.findOne({email: params.email.toLowerCase()}, (err, user)=> {

                    if(err){
                        return res.status(500).send({
                            message: 'El usuario no existe, porfavor priemro registrate'
                        });
                    }
                
                    if(user && user.email == params.email){
                        return res.status(500).send({
                            message:'E email no puede ser modificado'
                        });
                    }              

                });
        }else{
            var userId = req.user.sub
            //Buscar el ususario por el id y actualizarlo

            User.findOneAndUpdate({_id: userId}, params, {new:true}, (err,userUpdate)=> {

                if(err){
                    return res.status(500).send({
                        message: 'No se pueden actualizar los datos..'
                    });
                }

                if(!userUpdate){
                    return res.status(404).send({
                        message: 'EL usuario no existe para actualizarlo'
                    });
                }

                //Devolver los datos
                return res.status(200).send({
                    status:'success',
                    user: userUpdate
                });
            });

            
        }
            
        }


    }




    