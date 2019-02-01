var Work = require('../models/work')

module.exports.allWorks = ()=>{
    return Work
        .find()
        .exec()
}

module.exports.workID = id =>{
    return Work
        .find({_id: id})
        .exec()
}

module.exports.workTitulo = id =>{
    return Work
        .find({_id: id}, {titulo:1, _id:0})
        .exec()
}


