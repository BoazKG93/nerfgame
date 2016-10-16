'use strict';
var AWS = require("aws-sdk");

var calloutTags = ["Blue", "Red", "Green"];

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The Game class stores all game states for the user
     */
    function Game(session, data) {
        if (data) {
            console.log('Game init');
            console.log(data);
            if (data.data) {
                this.data = JSON.parse(data.data.S);
            } else {
                this.data = data;
            }
        } else {
            this.data = {
                players: {},
                teamCount: {}
            };
        }
        this._session = session;
    }

    Game.prototype = {
        addPlayer: function(name) {
            this.data.players[name] = {
                name: name,
                health: 2,
                team: "none"
            };
        },
        setGameMode: function(gameMode){
            this.data.gameMode = gameMode;
        },
        setCodeWord1: function(codeword){
            this.data.codeWord1 = codeword;
        },
        setCodeWord2: function(codeword){
            this.data.codeWord2 = codeword;
        },
        getGameMode: function() {
            if(!this.data.gameMode){
                return 1;
            }else {
                return this.data.gameMode;
            }
        },
        getCodeWord1: function() {
            if(!this.data.codeWord1){
                return null;
            }else {
                return this.data.codeWord1;
            }
        },
        getCodeWord2: function() {
            if(!this.data.codeWord2){
                return null;
            }else {
                return this.data.codeWord2;
            }
        },

        /*
        * 0 = init
        * 1 = playing
        * 2 = done
        */
        setGameState: function(state) {
            this.data.state = state;
        },

        getGameState: function(state) {
            if (!this.data.state) {
                return 0;
            }
            return this.data.state;
        },

        addToTeam: function(name, teamName) {
            if (!this.data.teamCount[teamName]) {
                this.data.teamCount[teamName] = 1;
            } else {
                this.data.teamCount[teamName]++;
            }
            this.data.players[name].team = teamName;
            this.data.players[name].callout = calloutTags[this.data.teamCount[teamName]-1] + " " + teamName.slice(0, -1);
        },

        decreaseHealth: function(name) {
            this.data.players[name].health--;
        },

        updatePlayerHealth: function(name, health) {
            this.data.players[name].health = health;
        },

        getPlayer: function(name) {
            return this.data.players[name];
        },

        getPlayerByCallout: function(callout) {
            for (var playerName in this.data.players) {
                var player = this.data.players[playerName];
                console.log(player.callout.toLowerCase().valueOf() + " == " + callout.toLowerCase().valueOf());
                if (player.callout.toLowerCase().valueOf() == callout.toLowerCase().valueOf()) {
                    return player;
                }
            }
            return null;
        },

        getTeam: function(teamName) {
            var res = [];
            for (var playerName in this.data.players) {
                var player = this.data.players[playerName];
                if (player.team.valueOf() == teamName.valueOf()) {
                    res.push(player);
                }
            }
            return res;
        },

        save: function(callback) {
            this._session.attributes.currentGame = this.data;
            console.log("saving data");
            console.log(this.data);
            console.log(JSON.stringify(this.data));
            dynamodb.putItem({
                TableName: 'State',
                Item: {
                    gameId: {
                        N: "0"
                    },
                    data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                console.log("game save");
                console.log("err: ");
                console.log(err);
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback(true);
                }
            });
        },

        reset: function() {
            this.data = {
                players: {},
                teamCount: {}
            };
        }
    };

    return {
        loadGame: function (session, callback) {
            if (session.attributes.currentGame) {
                console.log('get game from session=' + session.attributes.currentGame);
                callback(new Game(session, session.attributes.currentGame));
                return;
            }

            console.log("loadGame");
            var params = {
                TableName: "State",
                Key: {
                    "gameId": {"N": "0"}
                },
                AttributesToGet: ["data"]
            };

            dynamodb.getItem(params, function(err, data) {
                console.log("err:");
                console.log(err);
                console.log("data:");
                console.log(data);
                var currentGame;
                if (err || data.Item === undefined) {
                    if (err) {
                        console.log(err, err.stack);
                    }

                    currentGame = new Game(session);
                    session.attributes.currentGame = currentGame.data;
                    callback(currentGame);
                } else {
                    currentGame = new Game(session, data.Item);
                    session.attributes.currentGame = currentGame.data;
                    callback(currentGame);
                }
            });
        },
        newGame: function (session, callback) {
            callback(new Game(session));
            return;
        },
    };
})();

module.exports = storage;
