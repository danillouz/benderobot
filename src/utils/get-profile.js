'use strict';

const url = require('url');
const co = require('co');
const fetch = require('node-fetch');
const debug = require('debug');

const log = debug('benderobot:utils/get-profile');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const API = 'https://graph.facebook.com/v2.6';

/**
 * Retrieves the profile of a users, i.e. sender using the
 * facebook send API.
 *
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference#user_profile_api
 *
 * @param  {String} userId - id of the user
 *
 * @return {Promise} Resolves with the response body
 */
function *getProfile(userId) {
	log(`fetching profile of user: "${userId}"`);

	const fields = [
		'first_name'
		// 'last_name',
		// 'profile_pic',
		// 'locale',
		// 'timezone',
		// 'gender'
	].join(',');

	const params = {
		fields,
		access_token: PAGE_ACCESS_TOKEN
	};

	const queryParams = url.format({ query: params });
	const res = yield fetch(`${API}/${userId}${queryParams}`);
	const json = yield res.json();

	return json;
}

module.exports = co.wrap(getProfile);
