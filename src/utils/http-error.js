'use strict';

const status = require('statuses');

/**
 * Creates a custom HTTP error.
 *
 * @param  {Number} statusCode - HTTP status code
 * @param  {String} message    - custom error message
 *
 * @return {Object} Custom error Object
 */
function create(
	statusCode = 500,
	message = 'An unexpected error occured.'
) {
	const err = new Error(message);

	err.name = status(statusCode);
	err.status = statusCode;
	err.normalized = true;
	err.toJSON = () => ({
		name: err.name,
		message: err.message
	});

	return err;
}

module.exports = { create };
