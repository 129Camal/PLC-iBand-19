var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PartituraSchema = new Schema({
    path:{type: String},
    voz:{type: String},
    clave:{type: String},
    afinacao:{type: String}
})

var InstrumentoSchema = new Schema({
    nome:{type: String},
    nDownloads: {type: Number},
    partitura: {type: PartituraSchema, required:true}
})

var WorkSchema = new Schema({
    _id:{type:String},
    nVisualizacao:{type:Number},
    titulo:{type:String, required:true},
    tipo:{type:String, required:true},
    compositor:{type:String},
    arranjo:{type:String},
    instrumentos: [InstrumentoSchema]

}, {
    versionKey: false 
})

module.exports = mongoose.model('Work', WorkSchema, 'works')
