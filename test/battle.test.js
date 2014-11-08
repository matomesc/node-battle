var assert = require('chai').assert;
var battle = require('../index');
var config = require('./config');

var client = battle.createClient({
	apiKey: config.apiKey
});

describe('battle.createClient()', function () {
	it('should check options param', function (done) {
		assert.throws(function () {
			battle.createClient();
		}, 'options.apiKey is required');

		var c1 = battle.createClient({ apiKey: 'a' });
		assert(c1._apiKey === 'a');
		assert(c1._region === 'us');

		var c2 = battle.createClient({ apiKey: 'b', region: 'eu' });
		assert(c2._apiKey === 'b');
		assert(c2._region === 'eu');

		done();
	});
});

describe('client.auction()', function () {
	it('should return auction house data information if `params.realm` is ok', function (done) {
		client.auction({ realm: 'medivh' }, function (err, data) {
			assert(!err);
			assert(!!data);
			assert(typeof data === 'object');
			assert(Array.isArray(data.files));
			assert(data.files.length > 0);
			assert(typeof data.files[0].url === 'string');
			assert(typeof data.files[0].lastModified === 'number');
			done();
		});
	});
	it('should fail if `params.realm` is invalid', function (done) {
		client.auction({ realm: 'askdasda' }, function (err, data) {
			assert(err);
			assert(err instanceof battle.APIError);
			assert(err.res.statusCode === 404);
			assert(!data);
			done();
		});
	})
});

describe('client.character()', function () {
	it('should return character data', function (done) {
		var params = {
			realm: 'medivh',
			name: 'yufa',
			fields: 'achievements,appearance,feed,guild'
		};
		client.character(params, function (err, data) {
			assert(!err);
			assert(typeof data === 'object');
			assert(data.name === 'Yufa');
			assert(data.achievements);
			assert(data.appearance);
			assert(data.feed);
			assert(data.guild);
			done();
		});
	});
});

describe('client.item()', function () {
	it('should return item data', function (done) {
		client.item({ id: 72096 }, function (err, data) {
			assert(!err);
			assert(typeof data === 'object');
			assert(data.id === 72096);
			assert(data.name === 'Ghost Iron Bar');
			done();
		});
	});
});

describe('client.guild()', function () {
	it('should return guild data', function (done) {
		var params = {
			realm: 'medivh',
			name: 'Halo',
			fields: 'achievements,members,news,challenge'
		};
		client.guild(params, function (err, data) {
			assert(!err);
			assert(typeof data === 'object');
			assert(data.name === 'Halo');
			assert(typeof data.achievements === 'object');
			assert(typeof data.challenge === 'object');
			assert(Array.isArray(data.members));
			assert(Array.isArray(data.news));
			done();
		});
	});
});

describe('client.realm()', function () {
	it('should return realm status data', function (done) {
		client.realm(function (err, data) {
			assert(!err);
			assert(typeof data === 'object');
			assert(Array.isArray(data.realms));
		});
	});
});
