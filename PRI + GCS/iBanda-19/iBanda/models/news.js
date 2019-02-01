var mongoose = require('mongoose')
var Schema = mongoose.Schema

var MetaSchema = new Schema({
    data:{type: String, required:true},
    autor:{type: String, required:true}
})

var NewsSchema = new Schema({
    meta:{type:MetaSchema, required:true},
    titulo:{type:String, required:true},
    corpo:{type:String, required:true}
}, {
    versionKey: false 
})

module.exports = mongoose.model('News', NewsSchema, 'news')
