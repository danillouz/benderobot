'use strict';

const co = require('co');
const fetch = require('node-fetch');
const debug = require('debug');

const log = debug('benderobot:utils/send');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const API = 'https://graph.facebook.com/v2.6/me/messages';
const URL = `${API}?access_token=${PAGE_ACCESS_TOKEN}`;

/**
 * Sends a message using the facebook send API.
 *
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference
 *
 * @param  {String} senderId - id of the person sending a message
 * @param  {Object} message  - text or attachment (image or template)
 *
 * @return {Promise} Resolves with the response body
 */
function send(senderId, message) {
	log(`sending message on behalf of: "${senderId}"`);
	log(`sending message: "${message}"`);

	return co(function *sendMessage() {
		const options = {
			method: 'POST',
			body: JSON.stringify({
				recipient: { id: senderId },
				message
			}),
			headers: { 'Content-Type': 'application/json' }
		};

		const res = yield fetch(URL, options);
		const json = yield res.json();

		return json;
	});
}

module.exports = send;
