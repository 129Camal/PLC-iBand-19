var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CalendarSchema = new Schema({
    nome:{type:String, required:true},
    data:{type:String, required:true},
    tipo:{type:String, required:true},
    local:{type:String, required:true},
    bilhetes:{type:String}
}, {
    versionKey: false 
})

module.exports = mongoose.model('Calendar', CalendarSchema, 'events')
