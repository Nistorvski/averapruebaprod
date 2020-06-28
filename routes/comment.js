'use strict'

var express = require('express');
var CommentController = require('../controller/comment');


var router = express.Router();
var md_auth = require('../middlewares/authenticated');

//EL middleware de muktiparty para subida de ficheros
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });


router.post('/comment/post/:postId',md_auth.authenticated, CommentController.add);
router.put('/comment/:commentId', md_auth.authenticated, CommentController.update);
router.delete('/comment/:postId/:commentId', md_auth.authenticated, CommentController.delete);

module.exports = router;