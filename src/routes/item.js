const express = require('express');
const axios = require('axios');
const logger = require('../logger');
const config = require('../config/config');
const { getCategories } = require('../lib/utils');
const { getBreadcrumb } = require('../lib/utils');
const { parseItem } = require('../lib/utils');

const router = express.Router();
router.get('/:id?', (req, res) => {
  if (!req.params.id && !req.query.q) {
    return res.json({ error: 'At least one id or q parameter is required' });
  }
  return new Promise((resolve) => {
    if (req.params.id) {
      const path = `${config.apiMeliUrl}/items/${req.params.id}`;
      const pathDescription = `${path}/description`;
      return resolve(Promise.all([
        axios.get(path),
        axios.get(pathDescription).catch(() => Promise.resolve({ data: { plain_text: 'Sin descripcion' } })),
      ]));
    }
    return resolve(axios.get(`${config.apiMeliUrl}/sites/MLA/search?q=${req.query.q}&limit=4`));
  })
    .then((resp) => {
      if (Array.isArray(resp)) {
        const { data } = resp[0];
        const dataDescription = resp[1].data;
        const { sold_quantity, category_id } = data;
        return getBreadcrumb({ id: category_id })
          .then(breadcrumb => ({
            item: {
              ...parseItem(data),
              sold_quantity,
              description: dataDescription.plain_text,
            },
            breadcrumb,
          }));
      }
      const items = [];
      resp.data.results.map((item) => {
        items.push(parseItem(item));
      });
      const categoryList = getCategories(resp.data);
      return getBreadcrumb(categoryList[categoryList.length - 1])
        .then(breadcrumb => ({
          categories: categoryList.map(item => item.name),
          items,
          breadcrumb,
        }));
    })
    .then((result) => {
      res.json({
        author: {
          name: config.firstName,
          lastname: config.lastName,
        },
        ...result,
      });
    })
    .catch((err) => {
      logger.error('Error: ', err.message);
      res.json({ error: 'Internal server error' });
    });
});

module.exports = { path: 'items', router };
