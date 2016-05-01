'use strict';

const co = require('co');
const fetch = require('node-fetch');
const debug = require('debug');

const log = debug('benderobot:utils/send');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const API = 'https://graph.facebook.com/v2.6/me/messages';
const URL = `${API}?access_token=${PAGE_ACCESS_TOKEN}`;

/**
 * Sends a text message using the facebook send API.
 *
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference
 *
 * @param  {String} senderId 	- id of the person sending a message
 * @param  {String} messageText - message
 *
 * @return {Promise} Resolves with the response body
 */
function send(senderId, messageText) {
	log(`sending message on behalf of: "${senderId}"`);
	log(`sending message text: "${messageText}"`);

	return co(function *sendMessage() {
		const options = {
			method: 'POST',
			body: {
				recipient: { id: senderId },
				message: { text: messageText }
			},
			headers: { contentType: 'application/json' }
		};

		const res = yield fetch(URL, options);
		const json = yield res.json();

		log('json: ', JSON.stringify(json, null, 4));

		json.status = res.status;

		return json;
	});
}

module.exports = send;
