var User = require('../models/user')

module.exports.allUsers = ()=>{
        return User
        .find()
        .sort({name:-1})
        .exec()
}

module.exports.getUser = eid => {
    return User
        .findOne({_id : eid})
        .exec()
}

module.exports.addUser = user =>{
    return User.create(user)
}

module.exports.changeUser = (req,res) =>{

    return User.update({_id:req.params.id},{name:req.body.name, email:req.body.email, password:req.body.password, userType: req.body.userType})
        
}