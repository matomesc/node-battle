var request = require('request');

/**
 * @class APIError
 * @param {Number} statusCode
 * @param {Object} body
 * @constructor
 * @extends Error
 */
function APIError(statusCode, body) {
	Error.call(this);
	Error.captureStackTrace(this, APIError);
	this.statusCode = statusCode;
	this.body = body;
	this.message = body && body.reason ? body.reason : 'Unknown API Error';
}
APIError.prototype.toString = function () {
	return this.message + '(statusCode=' + this.statusCode +
		', body=' + JSON.stringify(this.body) + ')';
};

/**
 * @class Client
 * @param {Object} options
 * @param {String} options.apiKey
 * @param {String} [options.region='us']
 * @param {String} [options.locale='en_US']
 * @constructor
 */
function Client(options) {
	if (!options.apiKey) {
		throw new Error('options.apiKey is required');
	}

	/**
	 * Default region.
	 *
	 * @property _region
	 * @type String
	 * @private
	 */
	this._region = options.region || 'us';

	/**
	 * Default API key.
	 *
	 * @property _apiKey
	 * @type String
	 * @private
	 */
	this._apiKey = options.apiKey;

	/**
	 * Default locale.
	 *
	 * @property _locale
	 * @type String
	 * @private
	 */
	this._locale = 'en_US';
}

/**
 * @method _request
 * @param {String}   resource
 * @param {Object}   params
 * @param {String}   [params.region]
 * @param {String}   [params.apiKey]
 * @param {String}   [params.locale]
 * @param {Function} callback
 * @returns {Request}
 * @private
 */
Client.prototype._request = function (resource, params, callback) {
	var self = this;

	// determine host based on region
	var region = params.region || self._region;
	var host = Client.hosts[region];
	var path = Client.paths[resource];

	// not an actual param
	delete params.region;

	// set api key
	params.apikey = params.apikey || params.apiKey || self._apiKey;
	delete params.apiKey;

	// set locale
	params.locale = params.locale || self._locale;

	// replace :params in path with urlencoded values
	Object.keys(params).forEach(function (key) {
		var str = ':' + key;
		var val = encodeURIComponent(params[key]);
		if (path.indexOf(str) !== -1) {
			path = path.replace(str, val, 'ig');
			delete params[key];
		}
	});

	var url = 'https://' + host + path;
	var reqOptions = {
		method: 'GET',
		url: url,
		qs: params,
		encoding: 'utf8',
		headers: {
			'Accept': 'application/json;charset=utf-8'
		}
	};

	return request(reqOptions, function (err, res, body) {
		if (err) {
			return callback(err);
		}

		try {
			var parsedBody = JSON.parse(body);
		} catch (e) {
			var msg = 'invalid json: ' + body.toString().slice(0, 200);
			return callback(new Error(msg));
		}

		if (parsedBody.status === 'nok' || res.statusCode >= 400) {
			err = new APIError(res.statusCode, parsedBody);
			err.res = res;
			return callback(err);
		}

		return callback(null, parsedBody, res);
	});
};

/**
 * @property hosts
 * @type Object
 * @static
 */
Client.hosts = {
	us: 'us.api.battle.net',
	eu: 'eu.api.battle.net',
	//kr: 'kr.battle.net',
	//tw: 'tw.battle.net',
	//ch: 'www.battlenet.com.cn'
};

/**
 * @property paths
 * @type Object
 * @static
 */
Client.paths = {
	achievement      : '/wow/achievement/:id',
	auction          : '/wow/auction/data/:realm',

	battlePetAbility : '/wow/battlePet/ability/:id',
	battlePetSpecies : '/wow/battlePet/species/:id',

	// query params:
	// - level: optional, default 1, max 25
	// - breedId: optional, default 3
	// - qualityId: optional pet quality, min 0 (poor), max 6 (legendary), default 1
	battlePetStats   : '/wow/battlePet/stats/:id',

	challengeRealm   : '/wow/challenge/:realm',
	challengeRegion  : '/wow/challenge/region',

	// query params:
	// - fields: optional comma separated list of what to include in response
	//     [achievements, appearance, feed, guild, hunterPets, items, mounts,
	//  	pets, petSlots, progression, pvp, quests, reputation, stats, talents,
	//  	titles, audit]
	//
	character        : '/wow/character/:realm/:name',

	item             : '/wow/item/:id',
	itemSet          : '/wow/item/set/:id',

	// query params:
	// - fields: comma separated list of what to include in response (eg. `achievements,members,news,challenge`)
	guild            : '/wow/guild/:realm/:name',

	pvpLeaderboards  : '/wow/pvp/leaderboards/:bracket', // where bracket can be 2v2, 3v3, 5v5 or rbg
	quest            : '/wow/quest/:id',
	realm            : '/wow/realm/status',
	recipe           : '/wow/recipe/:id',
	spell            : '/wow/spell/:id',
	battlegroups     : '/wow/data/battlegroups/',
	races            : '/wow/data/character/races',
	classes          : '/wow/data/character/classes',
	achievements     : '/wow/data/character/achievements',
	guildRewards     : '/wow/data/guild/rewards',
	guildPerks       : '/wow/data/guild/perks',
	guildAchievements: '/wow/data/guild/achievements',
	itemClasses      : '/wow/data/item/classes',
	talents          : '/wow/data/talents',
	petTypes         : '/wow/data/pet/types'
};

Object.keys(Client.paths).forEach(function (name) {
	Client.prototype[name] = function (params, callback) {
		if (typeof params === 'function') {
			callback = params;
			params = {};
		}
		return this._request(name, params, callback);
	};
});

exports.Client = Client;
exports.APIError = APIError;
exports.createClient = function (options) {
	return new Client(options || {});
};
