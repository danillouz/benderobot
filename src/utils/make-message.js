'use strict';

/**
 * Makes a `text` message payload conform the facebook
 * send API.
 *
 * @param  {String} text - message text
 *
 * @return {Object} Message payload Object
 */
function text(text) {
	return {
		text
	};
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
	return {
		type: 'template',
		payload: {
			template_type: 'generic',
			elements
		}
	};
}

module.exports = { text, templateGeneric };
