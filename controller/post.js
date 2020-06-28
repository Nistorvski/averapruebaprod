'use strict'

var validator = require('validator');
var Post = require('../models/post');


var controller = {

    test: function(req, res){
        return res.status(200).send({
            message:'Método de prueba de post.js'
        });
    },

    savePost: function(req, res){
        //Recoger prametros del body
        var params = req.body;

        //Validar los datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_description = !validator.isEmpty(params.description);
        }catch(err){
            return res.status(500).send({
                message:'No se han validado correctamente todos los campos requeridos'
            }); 
        }      

        if(validate_title && validate_description){

        //Crear objeto
        var post = new Post();
        //Asignar valores 
        post.title = params.title,
        post.description = params.description;
        post.image = null;
        post.user = req.user.sub;

        //Guardar en la basede datos
        post.save((err, postStorage)=>{

            if(err || !postStorage){
                return res.status(200).send({
                    message: 'No se ha podido guardar el post'
                });
            }

            return res.status(200).send({
                post: postStorage
            });

        });

        //Devolver respuesta

        }else{
            return res.status(500).send({
                message:'Los datos no son validos'
            });
        }

    },
    
    getPosts: function(req, res){
        //Cargar la libreria de pagination/Se hace en el modelo
        //Recoger la pagina actual
        if(!req.params.page || req.params.page == null || req.params.page == undefined || req.params.page == 0 || req.params.page == "0"){
            var page = 1;
        }else{
            var page = parseInt(req.params.page);
        }        

        //Indicar las opciones de pagination
        var options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 7,
            page: page
        };
        //Find de paginado
        Post.paginate({}, options, (err, posts)=> {
        

            if(err){
                return res.status(500).send({
                    message: 'No se ha podido hacer la consulta'
                });
            }

            if(!posts){
                return res.status(500).send({
                    message: 'No se ha encontrado ningún post'
                });
            }                     
            
        //Devolver resultado (posts, totals de posts y total de paginas);    

        return res.status(200).send({
            status: 'success',
            posts:posts.docs,
            totalDocs: posts.totalDocs,
            totalPage: posts.totalPage
        });
        });
        
      
    },

    getPostsByUser: function(req, res){
        //conseguir el id del usuario
        var userId = req.params.user;
        //Find con la condicion de buscarme el id del ususario
        Post.find({user: userId}).sort([['date', 'descending']]).exec((err, posts)=> {

            if(err || !posts){
                return res.status(500).send({
                    message: 'No se ha encontrado ningún post para este usuario'
                });
            }

             //Devolver el resultado
            return res.status(200).send({
                status:'success',           
                posts
            });
        });
       
    },

    getPost:function(req, res){
        //Recoger el id del post
        var postId = req.params.id;
        //Hacer el find
        Post.findById(postId).populate('user').exec((err, post)=> {

            if(err || !post){
                return res.status(500).send({
                    message: 'No se ha encontrado ningún post'
                });
            }

             //Devolver el resultado
            return res.status(200).send({
                status:'success',           
                post
            });
        });
        
    },

    update: function(req, res){
        //Recoger el id del topic de la url
        var postId = req.params.id
        //Recoger los datos que llegan desde post
        var params=req.body;
        //Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_description = !validator.isEmpty(params.description);
        }catch(err){
            return res.status(500).send({
                message:'No se han validado correctamente todos los campos requeridos'
            }); 
        }      
        if(validate_title && validate_description){

        //Montar un json con los datos modificables
        var update = {
            title: params.title,
            description: params.description
        };

        //Find an update del topic por id y por id del usuario (tiene que estar identificado para poder modificar un post)
        Post.findOneAndUpdate({_id: postId, user: req.user.sub}, update, {new: true}, (err, postUpdated)=> {


            if(err || !postUpdated){
                return res.status(500).send({
                    status:'error',
                    message: 'No se ha encontrado ningún post para poder modificar..'
                });
            }

            //Devolver el resultado
            return res.status(200).send({
                status:'success',           
                post: postUpdated
            });

        })

      }else{
        return res.status(500).send({
            message:'Los datos no son validos'
        });
     }
 },

 delete: function(req, res){
    //Sacar el id del post de la url
    var postId = req.params.id;

    //Find and delete por postId y por userId
    Post.findOneAndDelete({_id: postId, user: req.user.sub}, (err, post)=> {

        if(err || !post){
            return res.status(500).send({
                status:'error',
                message: 'No se ha encontrado ningún post para poder borrarlo..'
            });
        }
        //Devolver respuesta
        return res.status(200).send({
            status:'success',
            post
        })

    });
    

 },

 search: function(req, res){
     //Sacar el string a buscar de la url
     var searchString = req.params.search;

     //Find or
     Post.find({ "$or": [ 
         { "title": { "$regex": searchString, "$options": "i" } },
         { "description": { "$regex": searchString, "$options": "i" } },       
         { "content": { "$regex": searchString, "$options": "i" } }
     ]}).sort([['date', 'descending']]).exec((err, posts)=> {

        if(err){
            return res.status(500).send({
                status:'error',
                message:'Error del buscador'
            });            
        }

        if(!posts){
            return res.status(404).send({
                status:'error',
                message:'No se pudo encontrar lo que buscas'
            }); 
        }

            //Devolver resultado
            return res.status(200).send({
                status:'success',
                posts
            });

     });

  
 }

}
module.exports = controller; 