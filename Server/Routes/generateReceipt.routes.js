const express = require('express');
const {generateReceipt} = require('../Controllers/generateReceipt.controller');
const router = express.Router();

router.post('/generateReceipt' , generateReceipt);

module.exports = router;