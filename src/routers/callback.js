'use strict';

const express = require('express');
const co = require('co');
const productHunt = require('product-hunt');
const debug = require('debug');
const httpErr = require('../utils/http-error');
const makeMessage = require('../utils/make-message');
const getProfile = require('../utils/get-profile');
const devrant = require('../utils/devrant');
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
					return next(httpErr.create(
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

								const command = message.text.toLowerCase();
								const isHello = /hi|hello/.test(command);
								const isProductHunt = /product hunt/.test(command);
								const isDevrant = /devrant/.test(command);

								if (isHello) {
									log('command is "hello"');

									const profile = yield getProfile(id);
									const payload = makeMessage.text(`Hello ${profile.first_name}`);
									const res = yield send(id, payload);

									log('send message res: ', JSON.stringify(res, null, 4));

									continue;
								}

								if (isProductHunt) {
									log('command is "product hunt"');

									const maxItems = 10;
									const posts = yield productHunt.exec();
									const elements = posts
										.slice(0, maxItems)
										.map(({
											name,
											url,
											tagline,
											thumbnail = { }
										}) => ({
											title: name,
											subtitle: tagline,
											item_url: `https://producthunt.com/${url}`,
											image_url: thumbnail.image_url
										}));

									const payload = makeMessage.templateGeneric(elements);
									const res = yield send(id, payload);

									log('send message res: ', JSON.stringify(res, null, 4));

									continue;
								}

								if (isDevrant) {
									log('command is "devrant"');

									const URL_BASE = 'https://www.devrant.io';
									const rants = yield devrant.fetch();
									const elements = rants
										.map(({
											id,
											text,
											score,
											attached_image: {
												url = `${URL_BASE}/static/devrant/img/cartoon2.png`
											}
										}) => ({
											title: `score: ${score}`,
											subtitle: text,
											item_url: `${URL_BASE}/rants/${id}`,
											image_url: url
										}));

									const payload = makeMessage.templateGeneric(elements);
									const res = yield send(id, payload);

									log('send message res: ', JSON.stringify(res, null, 4));

									continue;
								}

								const payload = makeMessage.text('Bite my shiny metal ass!');
								const res = yield send(id, payload);

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
