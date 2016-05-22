'use strict';

const url = require('url');
const co = require('co');
const fetch = require('node-fetch');
const debug = require('debug');

const API = 'https://www.devrant.io/api/devrant/rants?app=3?sort=recent&limit=10';

/**
 * Retrieves the 10 recent rants from the public devrant API.
 *
 * @return {Promise} Resolves with the response body
 */
function *fetchRecentRants() {
	const params = {
		app: 3,
		sort: 'recent',
		limit: 10
	};

	const queryParams = url.format({ query: params });
	const res = yield fetch(`${API}${queryParams}`);
	const json = yield res.json();

	return json.rants;
}

module.exports = {
	recent: co.wrap(fetchRecentRants)
};
