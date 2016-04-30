'use strict';

const express = require('express');
const middleware = require('./middleware');

/**
 * Creates a fully configured `express.js` app.
 *
 * @return {Object} exposes interface to start/stop the app
 */
function create() {
	let app = express();
	let server;

	middleware.init(app);

	return {
		start() {
			return Promise
				.resolve()
				.then( () => {
					const port = process.env.PORT || 8888;

					server = app.listen(port);

					return server;
				});
		},

		stop() {
			return Promise
				.resolve()
				.then( () => {
					server.close();
				});
		}
	};
}

module.exports = { create };
