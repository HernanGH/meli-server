'use strict';

const express = require('express');
const router  = express.Router();
const axios = require('axios');

router.get('/:id?', (req, res) => {
    axios.get('https://api.mercadolibre.com/items/​' + req.params.id)
    .then((resp) => {
         console.log('RESP: ', resp);   
        res.json(resp.data);
    })
});

module.exports = { path: 'items', router };
