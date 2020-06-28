'use strict'

var express = require('express');
var PostController = require('../controller/post');


var router = express.Router();
var md_auth = require('../middlewares/authenticated');

//EL middleware de muktiparty para subida de ficheros
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });

//Ruta de prueba
router.get('/test-post', PostController.test);

router.post('/save-post',md_auth.authenticated, PostController.savePost);
router.get('/posts/:page?', PostController.getPosts);
router.get('/get-posts/:user', PostController.getPostsByUser);
router.get('/post/:id', PostController.getPost);
router.put('/update-post/:id', md_auth.authenticated, PostController.update);
router.delete('/delete-post/:id', md_auth.authenticated, PostController.delete);
router.get('/search/:search', PostController.search);

module.exports = router;