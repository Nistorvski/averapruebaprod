'use strict'

var express = require('express');
var UserController = require('../controller/user');


var router = express.Router();
var md_auth = require('../middlewares/authenticated');

//EL middleware de muktiparty para subida de ficheros
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' })

//Rutas de prueba
router.get('/test', UserController.test);

//Rutas del api de Usuarios

router.post('/save', UserController.save);
router.post('/login', UserController.login);
router.put('/update-user', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);


module.exports = router;