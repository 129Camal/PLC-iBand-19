var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// homepage
router.get('/', (req, res) =>
  res.render('dashboard')
);

module.exports = router;
