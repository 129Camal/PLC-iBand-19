var express = require('express')
var router = express.Router()
var News = require('../../controllers/news')

/* GET all the users from the database */
router.get('/', (req, res) => {
        News.allNews()
        .then(data =>{
            res.jsonp(data)
        })
        .catch(error =>{
            res.status(500).send("Error trying to list all the news: " + error)
        })

    
});

module.exports = router;