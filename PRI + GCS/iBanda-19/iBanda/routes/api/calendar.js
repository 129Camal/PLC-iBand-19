var express = require('express')
var router = express.Router()
var Calendar = require('../../controllers/calendar')
const { ensureAuthenticated } = require('../../config/auth');

/* GET all the users from the database */
router.get('/', (req, res) => {
        Calendar.allEvents()
        .then(data =>{
            res.jsonp(data)
        })
        .catch(error =>{
            res.status(500).send("Error trying to list all the Works: " + error)
        })

    
});

module.exports = router;