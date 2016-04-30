'use strict';

const api = require('./api');
const debug = require('debug');

const log = debug('benderobot:start');

api
	.create()
	.start()
	.then(server => {
		log(`running on port ${server.address().port}`);
	})
	.catch(err => {
		log(`error: ${err}`);

		process.exit(1);
	});
