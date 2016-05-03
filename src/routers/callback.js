'use strict';

const express = require('express');
const co = require('co');
const debug = require('debug');
const herr = require('../utils/http-error');
const send = require('../utils/send');

const log = debug('benderobot:routers/callback');

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

/**
 * Creates an `express.js` Router instance.
 *
 * @return {Function} `express.js` Router instance
 */
function create() {
	const router = express.Router(); // eslint-disable-line new-cap

	router
		.route('/')
		.get(function verifyToken(req, res) {
			if (req.query['hub.verify_token'] !== VERIFY_TOKEN) {
				// Facebook can't ping if response status is NOT 200.
				return res.send('Error, wrong validation token');
			}

			res.send(req.query['hub.challenge']);
		})
		.post(
			function validatePayload(req, res, next) {
				log('req.query: ', JSON.stringify(req.query, null, 4));
				log('req.body: ', JSON.stringify(req.body, null, 4));

				const entry = req.body.entry;
				const isArray = Array.isArray(entry);

				if (!entry || !isArray) {
					return next(herr.create(
						400,
						'Invalid request payload'
					));
				}

				next();
			},

			function processPayload(req, res, next) {
				co(function *() {
					for (const entry of req.body.entry) {
						for (const {
							sender: { id },
							optin,
							message: { text },
							delivery,
							postback
						} of entry.messaging) {
							if (optin) {
								log('authentication webhook');
								log('optin: ', JSON.stringify(optin, null, 4));

								// NIY
							}

							if (message) {
								log('message received webhook');
								log('message: ', JSON.stringify(message, null, 4));

								const res = yield send(id, text);

								log('send message res: ', JSON.stringify(res, null, 4));
							}

							if (delivery) {
								log('message delivery webhook');
								log('delivery: ', JSON.stringify(delivery, null, 4));

								// NIY
							}

							if (postback) {
								log('postback webhook');
								log('postback: ', JSON.stringify(postback, null, 4));

								// NIY
							}
						}
					}
				})
				.catch(err => {
					next(herr.create(
						500,
						err.message
					));
				});

				res.sendStatus(200);
			}
		);

	return router;
}

module.exports = { create };
