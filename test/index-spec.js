var battle = require('../index');

process.on('uncaughtException', function (err) {
	console.log(err.stack);
	process.exit(1);
});

describe('client', function () {
	var client = battle.createClient();	
	it('should set a default region if none passed in', function (done) {
		var client = battle.createClient();
		expect(client._region).toBe('us');
		return done();
	});
	it('should use passed in region as default', function (done) {
		var client = battle.createClient({ region: 'eu' });
		expect(client._region).toBe('eu');
		return done();
	});
	it('auction()', function (done) {
		client.auction({ region: 'eu', realm: 'aegwynn' }, function (err, data) {
			expect(err).toBeFalsy();
			expect(typeof data).toBe('object');
			expect(Array.isArray(data.files)).toBe(true);
			return done();
		});
	});
	it('realm()', function (done) {
		client.realm(function (err, data) {
			expect(err).toBeFalsy();
			expect(typeof data).toBe('object');
			expect(Array.isArray(data.realms)).toBe(true);
			expect(data.realms.length > 0).toBe(true);
			return done();
		});
	});
	it('item()', function (done) {
		client.item({ id: 72095 }, function (err, data) {
			expect(err).toBeFalsy();
			expect(typeof data).toBe('object');
			expect(data.id).toBe(72095);
			return done();
		});
	});
	it('item() with bad id', function (done) {
		client.item({ id: 9999999 }, function (err, data) {
			expect(err instanceof battle.APIError).toBe(true);
			expect(err.statusCode).toBe(404);
			expect(err.message.length).toBeGreaterThan(0);
			expect(err.body.status).toBe('nok');
			expect(err.body.reason.length).toBeGreaterThan(0);
			return done();
		});
	});
	it('character()', function (done) {
		client.character({ realm: 'nesingwary', name: 'havøk' }, function (err, data) {
			console.log(err, data);
			done();
		});
	});
});
