# node-battle ![buildstatus](https://travis-ci.org/matomesc/node-battle.svg?branch=master)

`node-battle` is a client for Blizzard's World of Warcraft Community Web API.

## Installation

```
npm install battle
```

## Usage

```js
var battle = require('battle');

// create a new client with a default region
var client = battle.createClient({ region: 'eu' });

// load an item
client.item({ id: 72095 }, function (err, item) {
    console.log(item);
});

// load a character from a US realm
client.character({
    region: 'us',
    realm: 'nesingwary',
    name: 'havøk',
    fields: 'stats'
}, function (err, char) {
    console.log(char);
});

// also nice errors
client.item({ id: 99999999 }, function (err, item) {
    console.log(err instanceof battle.APIError) // true
    console.log(err.statusCode) // 404
    console.log(err.message)    // "unable to get item information."
    console.log(err.body)       // json body
});
```

## API

### `battle.createClient([options])`

Options:
See below.

Create a new client.

### `battle.Client([options])`

Options:

- `[options.region]` (defaults to `us`, supports `us`, `eu`, `kr`, `tw`, `ch`)

#### Endpoints

The client supports all endpoints found on [Blizzard's API docs](http://blizzard.github.io/api-wow-docs/).

Sending a request to the `character` endpoint:

```
client.character({
    region: 'us',            // optional param
    realm: 'nesingwary',     // required param
    name: 'havøk',           // required param
    fields: 'stats'          // optional param
}, function (err, data) {
    // do your thing
})
```
**Note:** Passing in `params.region` will override the client's default region.  
**Note:** all request parameters that are not required to build the url (such as `fields` in the example above) will be sent
to the API as query string parameters.

Available endpoints and their required parameters:

```js
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
```

### `battle.APIError(statusCode, body)`

The error class used for API errors. `err.statusCode` and `err.message` are populated from the response.
