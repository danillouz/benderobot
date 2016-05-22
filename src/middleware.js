'use strict';

const bodyParser = require('body-parser');
const httpErr = require('./utils/http-error');
const statusRouter = require('./routers/status');
const callbackRouter = require('./routers/callback');
const debug = require('debug');

const log = debug('benderobot:middleware');

/**
 * Initialized the app middleware.
 *
 * @param  {Function} app - `express.js` application
 */
function init(app) {
	app.use(bodyParser.json());

	app.use('/status', statusRouter.create());
	app.use('/callback', callbackRouter.create());

	app.use(function notFoundMiddleware(req, res, next) {
		log(`route "${req.url}" doesn't exist`);

		next(httpErr.create(
			404,
			'The requested route doesn\'t exist'
		));
	});

	app.use(function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
		let error = err.normalized
			? err
			: httpErr.create(undefined, err.message);

		log(`error "${error}"`);

		res.status(error.status).jsonp(error);
	});
}

module.exports = { init };
