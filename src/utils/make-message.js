'use strict';

const debug = require('debug');

const log = debug('benderobot:utils/make-message');

/**
 * Makes a `text` message payload conform the facebook
 * send API.
 *
 * @param  {String} text - message text
 *
 * @return {Object} Message payload Object
 */
function text(text) {
	const payload = { text };

	log('text payload: ', JSON.stringify(payload, null, 4));

	return payload;
}

/**
 * Makes a `generic-template` message payload conform
 * the facebook send API.
 *
 * @param  {Array} elements - template elements, i.e. bubles
 *
 * @return {Object} Message payload Object
 */
function templateGeneric(elements) {
	const payload = {
		attachment: {
			type: 'template',
			payload: {
				template_type: 'generic',
				elements
			}
		}
	};

	log('generict template payload: ', JSON.stringify(payload, null, 4));

	return payload;
}

module.exports = { text, templateGeneric };
