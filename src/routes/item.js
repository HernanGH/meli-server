const express = require('express');
const router  = express.Router();
const axios = require('axios');
const logger = require('../logger');
const config = require('../config/config');
const { getCategories } = require('../lib/utils');
const { getBreadcrumb } = require('../lib/utils');
const { parseItem } = require('../lib/utils');

router.get('/:id?', (req, res) => {
  if (!req.params.id && !req.query.q) {
    return res.json({error: 'At least one id or q parameter is required'});
  }
  return new Promise((res) => {
    if(req.params.id) {
        const path = `${config.apiMeliUrl}/items/${req.params.id}`;
        const pathDescription = `${path}/description`;
        return res(Promise.all([
        axios.get(path),
        axios.get(pathDescription)
        ]));
    }
    return res(axios.get(`${config.apiMeliUrl}/sites/MLA/search?q=${req.query.q}&limit=4`));
  })
  .then((resp) => {
    let result = {};
    if (Array.isArray(resp)) {
      const data = resp[0].data;
      const dataDescription = resp[1].data;
      const { sold_quantity, category_id } = data;
      return getBreadcrumb({id: category_id})
      .then(breadcrumb => {
        return {
          item: {
            ...parseItem(data),
            sold_quantity,
            description: dataDescription.plain_text
          },
          breadcrumb
        }    
      })
    } else {
      let items = [];
      resp.data.results.map(item => {
        items.push(parseItem(item));
      });
      const categoryList = getCategories(resp.data);
      return getBreadcrumb(categoryList[categoryList.length -1])
      .then(breadcrumb => {
        return {
          categories: categoryList.map(item => item.name),
          items: items,
          breadcrumb
        }
      });
    }
  })
  .then(result => {
    res.json({
      author: {
        name: config.firstName,
        lastname: config.lastName,
      },
      ...result
    });
  })
  .catch(err => {
    logger.error('Error: ', err.message);
    res.json({error: 'Internal server error'})
  })
});

module.exports = { path: 'items', router };
