var express = require('express')
var router = express.Router()
var User = require('../../controllers/user')
const { ensureAuthenticated } = require('../../config/auth');

/* GET all the users from the database */
router.get('/', (req, res) => {
    User.allUsers(req, res)
        .then(data =>{
            res.jsonp(data)
        })
        .catch(error =>{
            res.status(500).send("Error trying to list all the Users: " + error)
        })
});

/* GET one certain user from the database */
router.get('/:id', (req, res) => {
    User.getUser(req.params.id)
        .then(data =>{
            res.jsonp(data)
        })
        .catch(error =>{
            res.status(500).send("Error trying to find "+ req.params.id + ": " + error)
        })
});

/* POST para adicionar um novo user  */
router.post('/', (req,res)=>{
    User.addUser(req.body)
    .then(data =>{
        res.jsonp(data)
    })
    .catch(error =>{
        res.status(500).send("Error trying to list all the Users: " + error)
    })
})

router.put('/:id', (req,res)=>{
    User.changeUser(req, res)
    .then(data =>{
        res.jsonp(data)
    })
    .catch(error =>{
        res.status(500).send("Error trying to list all the Users: " + error)
    })
})

module.exports = router;