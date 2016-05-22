'use strict';

const url = require('url');
const co = require('co');
const fetch = require('node-fetch');
const debug = require('debug');

const API = 'https://www.devrant.io/api/devrant/rants?app=3?sort=recent&limit=10';

/**
 * Retrieves rants from the public devrant API.
 *
 * @param {String} sort  - type of items to fetch (algo/recent/top)
 * @param {Number} limit - number of items to fetch
 *
 * @return {Promise} Resolves with the response body
 */
function *fetchRants(sort = 'algo', limit = 10) {
	const params = {
		app: 3,
		sort,
		limit
	};

	const queryParams = url.format({ query: params });
	const res = yield fetch(`${API}${queryParams}`);
	const json = yield res.json();

	return json.rants;
}

module.exports = {
	fetch: co.wrap(fetchRants)
};
