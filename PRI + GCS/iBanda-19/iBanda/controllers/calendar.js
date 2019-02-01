var Calendar = require('../models/calendar')

module.exports.allEvents = ()=>{
    return Calendar
        .find()
        .exec()
}


