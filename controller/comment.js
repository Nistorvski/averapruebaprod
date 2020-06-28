'use strict'

var Post = require('../models/post');
var validator = require('validator');

var controller = {

    add: function(req, res){

        //Recoger el id del post de la url
        var postId = req.params.postId;

        //Find por id del post
        Post.findById(postId).exec((err, post)=> {
            if(err || !post){
                return res.status(500).send({
                    status:'error',
                    message: 'No se ha encontrado ningún post..'
                });
            }

        //Comprobar objeto usuario y validar datos
        if(req.body.content){
        try{
            var validate_content = !validator.isEmpty(req.body.content);
        }catch(err){
            return res.status(500).send({
                message:'Error al validar los datos'
            })
        }
           

           if(validate_content){

            var comment = {
                user: req.user.sub,
                content: req.body.content

            }

            //En la propiedad comments del objeto resultante hacer un push
            post.comments.push(comment);

            //Guardar el post completo con el comment
            post.save((err)=> {

                if(err || !post){
                    return res.status(500).send({
                        status:'error',
                        message: 'No se ha encontrado ningún post para guardarlo en la base de datos..'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                   status:'success',
                   post
                });

            });
            
           }else{
            return res.status(200).send({
                message: 'No se han validado correctamente los datos'
            });
           }       
        }


        });
  
    },

    update: function(req, res){
        //Conseguir id de comentario de la url
        var commentId= req.params.commentId;

        //Recoger datos del body y validarlos
        var params = req.body;

        try{
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(500).send({
                message:'Error al validar los datos'
            })
        }

        if(validate_content){
            //Find and update de subdocumento
            Post.findOneAndUpdate({"comments._id": commentId},{"$set": {"comments.$.content": params.content}}, {new:true}, (err, postUpdated)=> {

                if(err ){
                    return res.status(500).send({
                        status:'error',
                        message: 'No se ha podido editar el comentario..'
                    });
                }
                if(!postUpdated){
                    return res.status(404).send({
                        status:'error',
                        message: 'No se ha encontrado ningún post para editarlo..'
                    });
                    
                }

                 //Devolver datos
                return res.status(200).send({
                    status:'success',
                    post:postUpdated
                });
            });
           
        }else{
            return res.status(200).send({
                message: 'No se han validado correctamente los datos'
            });
           }   
        
      
    },

    delete: function(req, res){
        //Sacar el id del post y del comentario a borrar
        var postId = req.params.postId;
        var commentId = req.params.commentId;

        //Buscar el post
        Post.findById(postId).exec((err, post)=> {
            if(err || !post){
                return res.status(500).send({
                    status:'error',
                    message: 'No se ha encontrado el post que buscas ..'
                });
            }

                //Seleccionar el subdocumento(comentario)
                var comment = post.comments  .id(commentId);

                //Borrar el comentario
                if(comment){
                    comment.remove();

                //Guardar el post
                post.save((err, post)=> {

                    if(err || !post){
                        return res.status(500).send({
                            status:'error',
                            message: 'No se ha podido guardar el post..'
                        });
                    }



                    //Devolver resultado
                return res.status(200).send({
                    post
                });
                });                

                }else{
                    return res.status(500).send({
                        status:'error',
                        message: 'Ya no existe el post que quieres borrar..'
                    });
                }

        });

    }

}

module.exports = controller;