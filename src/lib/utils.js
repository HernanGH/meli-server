const axios = require('axios');
const config = require('../config/config');

const getCategories = ({ filters, available_filters }) => {
  let categories = [{ name: 'Sin categorias', id: -1 }];
  if (filters.length > 0) {
    const filterData = filters.find(filter => filter.id === config.categotyId);
    categories = filterData && filterData.values.length > 0 && filterData.values[0].path_from_root
      .map(item => ({ name: item.name, id: item.id }));
  } else if (available_filters.length > 0) {
    const availableFilter = available_filters.find(filter => filter.id === config.categotyId);
    categories = availableFilter && availableFilter.values.length > 0 && availableFilter.values
      .sort((current, next) => next.results - current.results)
      .map(item => ({ name: item.name, id: item.id }));
  }
  return categories;
};

const getBreadcrumb = (category) => {
  if (!category.id) {
    return Promise.resolve([]);
  }
  return axios.get(`${config.apiMeliUrl}/categories/${category.id}`)
    .then(({ data }) => data.path_from_root.map(item => item.name));
};

const parseItem = (item) => {
  const {
    id, title, condition, address,
  } = item;
  return {
    id,
    title,
    price: {
      currency: item.currency_id,
      amount: item.price,
      decimals: parseFloat((item.price % 1).toFixed(2)).toString().split('.')[1],
    },
    picture: item.pictures && item.pictures.length ? item.pictures[0].secure_url : item.thumbnail,
    condition,
    free_shipping: item.shipping.free_shipping,
    address: address && address.state_name,
  };
};

module.exports = {
  getCategories,
  getBreadcrumb,
  parseItem,
};
