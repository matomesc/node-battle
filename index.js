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
 * @constructor
 */
function Client(options) {
	if (!options.apiKey) {
		throw new Error('options.apiKey is required')
	}

	/**
	 * Default region.
	 *
	 * @property _region
	 * @type String
	 * @private
	 */
	this._region = options.region || 'us';
	this._apiKey = options.apiKey;
}

/**
 * @method _request
 * @param {Object}   options
 * @param {String}   options.method
 * @param {String}   options.url
 * @param {Object}   options.params
 * @param {Function} callback
 * @returns {Request}
 * @private
 */
Client.prototype._request = function (options, callback) {
	var self = this;
	var reqOptions = {
		method: options.method,
		url: options.url,
		qs: options.params,
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
			return callback(err);
		}

		return callback(null, parsedBody);
	});
};

/**
 * @property hosts
 * @type Object
 * @static
 */
Client.hosts = {
	us: 'us.battle.net',
	eu: 'eu.battle.net',
	kr: 'kr.battle.net',
	tw: 'tw.battle.net',
	ch: 'www.battlenet.com.cn'
};

/**
 * @property paths
 * @type Object
 * @static
 */
Client.paths = {
	achievement      : '/api/wow/achievement/:id',
	auction          : '/api/wow/auction/data/:realm',
	battlePetAbility : '/api/wow/battlePet/ability/:id',
	battlePetSpecies : '/api/wow/battlePet/species/:id',
	battlePetStats   : '/api/wow/battlePet/stats/:id',
	challengeRealm   : '/api/wow/challenge/:realm',
	challengeRegion  : '/api/wow/challenge/region',
	character        : '/api/wow/character/:realm/:name',
	item             : '/api/wow/item/:id',
	itemSet          : '/api/wow/item/set/:id',
	guild            : '/api/wow/guild/:realm/:name',
	arenaTeam        : '/api/wow/arena/:realm/:size/:name', // size=2v2, 3v3, 5v5
	arenaLadder      : '/api/wow/pvp/arena/:battlegroup/:size',
	ratedBg          : '/api/wow/pvp/ratedbg/ladder',
	quest            : '/api/wow/quest/:id',
	realm            : '/api/wow/realm/status',
	recipe           : '/api/wow/recipe/:id',
	spell            : '/api/wow/spell/:id',
	battlegroups     : '/api/wow/data/battlegroups/',
	races            : '/api/wow/data/character/races',
	classes          : '/api/wow/data/character/classes',
	achievements     : '/api/wow/data/character/achievements',
	guildRewards     : '/api/wow/data/guild/rewards',
	guildPerks       : '/api/wow/data/guild/perks',
	guildAchievements: '/api/wow/data/guild/achievements',
	itemClasses      : '/api/wow/data/item/classes',
	talents          : '/api/wow/data/talents',
	petTypes         : '/api/wow/data/pet/types'
};

Object.keys(Client.paths).forEach(function (name) {
	Client.prototype[name] = function (params, callback) {
		if (typeof params === 'function') {
			callback = params;
			params = {};
		}
		// determine host based on region
		var region = params.region || this._region;
		var host = Client.hosts[region];
		var path = Client.paths[name];

		// not an actual param
		delete params.region;

		// set api key
		params.apiKey = params.apiKey || this._apiKey;

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
		var options = {
			method: 'GET',
			url: url,
			params: params
		};

		return this._request(options, callback);
	};
});

exports.Client = Client;
exports.APIError = APIError;
exports.createClient = function (options) {
	return new Client(options || {});
};
