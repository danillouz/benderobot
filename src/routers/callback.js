'use strict';

const express = require('express');
const co = require('co');
const productHunt = require('product-hunt');
const debug = require('debug');
const herr = require('../utils/http-error');
const makeMessage = require('../utils/make-message');
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
				// Facebook can't ping if the response status is NOT 200.
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

			function processPayload(req, res) {
				co(function *processAndSend() {
					for (const entry of req.body.entry) {
						for (const {
							sender: { id },
							optin,
							message,
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

								const posts = yield productHunt.exec();
								const elements = posts
									.slice(0, 10)
									.map(({
										name, url, tagline, thumbnail
									}) => ({
										title: name,
										item_url: `https://producthunt.com/${url}`,
										image_url: thumbnail.image_url,
										subtitle: tagline
									}));

								const payload = makeMessage.templateGeneric(elements);
								const res = yield send(id, payload);

								log('elements: ', JSON.stringify(elements, null, 4));
								log('payload: ', JSON.stringify(payload, null, 4));
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
					log(`process payload error: ${err}`);
					log(err.stack);
				});

				res.sendStatus(200);
			}
		);

	return router;
}

module.exports = { create };
