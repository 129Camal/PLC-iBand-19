var express = require('express')
var router = express.Router()
var Work = require('../../controllers/work')
const { ensureAuthenticated } = require('../../config/auth');

/* GET all the users from the database */
router.get('/', (req, res) => {
        Work.allWorks()
        .then(data =>{
            res.jsonp(data)
        })
        .catch(error =>{
            res.status(500).send("Error trying to list all the Works: " + error)
        })
});

router.get('/titulo/:id', (req, res) => {
    Work.workTitulo(req.params.id)
        .then(data =>{
            res.jsonp(data)
        })
        .catch(error =>{
            res.status(500).send("Error trying to list the title: " + error)
        })
});

router.get('/:id', (req, res) => {
    Work.workID( req.params.id)
        .then(data =>{
            res.jsonp(data)
        })
        .catch(error =>{
            res.status(500).send("Error trying to list the Work with Title: " + error)
        })
});


module.exports = router;