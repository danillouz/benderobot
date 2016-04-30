'use strict';

const express = require('express');
const pjson = require('../../package');

/**
 * Creates an `express.js` Router instance.
 *
 * @return {Function} `express.js` Router instance
 */
function create() {
	const router = express.Router(); // eslint-disable-line new-cap

	router
		.route('/')
		.get(function (req, res) {
			res.jsonp({
				status: 'ok',
				version: pjson.version
			});
		});

	return router;
}

module.exports = { create };
