'use strict';

const express = require('express');
const debug = require('debug');
const herr = require('../utils/http-error');
const send = require('../utils/send');

const log = debug('benderobot:routers/callback');
const verifyToken = process.env.VERIFY_TOKEN;

/**
 * Creates an `express.js` Router instance.
 *
 * @return {Function} `express.js` Router instance
 */
function create() {
	const router = express.Router(); // eslint-disable-line new-cap

	router
		.route('/')
		.get(function verifyToken(req, res, next) {
			if (req.query['hub.verify_token'] !== verifyToken) {
				return next(herr.create(
					401,
					'Incorrect validation token'
				));
			}

			res.send(req.query['hub.challenge']);
		})
		.post(
			function validatePayload(req, res, next) {
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
				const messagingEvents = req.body.entry
					.map(entry => entry.messaging)
					.reduce( (currentEntry, nextEntry) => currentEntry.concat(nextEntry))
					.map(({
						sender = {},
						recipient = {},
						message = {}
					}) => ({
						senderId: sender.id,
						recipientId: recipient.id,
						messageText: message.text
					}));

				log('messagingEvents: ', JSON.stringify(messagingEvents, null, 4));

				req.messagingEvents = messagingEvents;

				next();
			},

			function sendMessages(req, res, next) {
				Promise
					.all(
						req.messagingEvents.map(({
							senderId,
							messageText
						}) => send(senderId, messageText))
					)
					.then(responses => ({
						ok: responses.filter(({ status }) => status === 200),
						err: responses.filter(({ status }) => status !== 200)
					}))
					.then(responses => {
						log('ok responses: ', JSON.stringify(responses.ok, null, 4));
						log('err responses: ', JSON.stringify(responses.err, null, 4));

						res.sendStatus(200);
					})
					.catch(err => {
						next(herr.create(
							500,
							err.message
						));
					});
			}
		);

	return router;
}

module.exports = { create };
