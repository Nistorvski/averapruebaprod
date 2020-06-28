'use strict'
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;


//Modelo de los comentarios
var ComentSchema = Schema ({
    content: String,
    date: { type: Date, default:Date.now},
    user: {type: Schema.ObjectId, ref: 'User'}

});
//Por si quiero exportar tambien el modelo de los comentarios:

module.exports = mongoose.model('Coment', ComentSchema);


//Modelo de las publicaciones


var PostSchema = Schema ({
    title: String,
    description: String,
    image: String,
    date: { type: Date, default:Date.now},
    user: {type: Schema.ObjectId, ref: 'User'},
    comments: [ComentSchema]
});

//Cargar el plugin
PostSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Post', PostSchema);