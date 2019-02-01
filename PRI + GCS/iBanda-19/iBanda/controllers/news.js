var News = require('../models/news')

module.exports.allNews = ()=>{
    return News
        .find()
        .exec()
}


