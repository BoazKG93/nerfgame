/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage'),
    AlexaSkill = require('./AlexaSkill');
var running = true;

var team1Name = 'Ninja Coders',
    team2Name = 'Teddy Bears';


function keepGameRunning(response, speechOutput) {


    var promtpOutPut = {
        speech: '<speak>'+
        '<break time="1s"/>' +
        ' '+
        '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    }
    
    response.ask(speechOutput,promtpOutPut);
}

function getTeamHealth(teamName, game) {
    var team = game.getTeam(teamName);
    teamHealth = team[0].health + team[1].health;
    return teamHealth;
}

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.HitIntent = function (intent, session, response) {
        var allDoneCallback = function(game, success) {
            if (success) {

                var team1Health = getTeamHealth(team1Name, game),
                    team2Health = getTeamHealth(team2Name, game);

                if(team1Health == 0) {
                    var speechOutput = playerName + ' has been hit and team ' + team1Name + ' is defeated, KO!';
                    game.reset();
                    response.tell(speechOutput);            
                } else if (team2Health == 0) {
                    var speechOutput = playerName + ' has been hit and team ' + team2Name + ' is defeated, KO!';
                    game.reset();
                    response.tell(speechOutput);

                } else {
                    running = true;
                    keepGameRunning(response, speechOutput);            
                }
            } else {
                response.tell("Oops. Something went wrong.");
            }
        };

        running = false;
        var playerName = intent.slots.PlayerName.value;
        storage.loadGame(session, function(game) {
            var player = game.getPlayer(playerName);
            var playerHealth = player.health;

            if(playerHealth > 0) {
                playerHealth--;
                game.decreaseHealth(playerName);
                if(playerHealth > 0) {
                    var speechOutput = {
                        speech: "<audio src='https://s3.amazonaws.com/alexanerfbattlesounds/hit_sound.mp3'/>",
                        type: AlexaSkill.speechOutputType.SSML
                    }
                } else {
                    var speechOutput = playerName + ' is out.';
                }
            } else {
                var speechOutput = playerName + ' is already dead.';
            }

            game.save(allDoneCallback.bind(this, game));

        });


    };

    intentHandlers.AddPlayerIntent = function (intent, session, response) {
        
        console.log('start intent');
        var allDoneCallback = function(success) {
            if (success) {
                console.log('inside the success callback');
                keepGameRunning(response, speechOutput);
            } else {
                response.tell("Oops. Something went wrong.");
            }
        };

        
        var playerName1 = intent.slots.PlayerNameOne.value;
        var playerName2 = intent.slots.PlayerNameTwo.value;
        var playerName3 = intent.slots.PlayerNameThree.value;
        var playerName4 = intent.slots.PlayerNameFour.value;
        var players = [playerName1, playerName2, playerName3, playerName4];
        var counter = 0;
        console.log('before the loop');

        storage.newGame(session, function(game) {
            console.log('starting the loop');
            players.forEach(function(item) {
                if(item.length != 0) {
                        game.addPlayer(item);
                        counter++; 
                        if(counter <= 2) {
                            game.addToTeam(item, team1Name);
                        } else {
                            game.addToTeam(item, team2Name);
                        }
                                    
                }
            });
            console.log('after the loop');

            var speechOutput = { 
                speech: '<speak><p><s>All players have been added, lets start having fun!</s>' +
                '<s>our teams for today are:</s><s>' + 
                playerName1 + ' and ' +
                playerName2 + ' are in team ' + team1Name + ' team</s><s> and ' +
                playerName3 + ' and ' +
                playerName4 + ' are in ' + team2Name + ' team.</s><s>I wish you all good luck and let the game begin!</s></p>'+
                '<s>3<break time="1s"/>2<break time="1s"/>1<break time="1s"/>Go!</s></speak>',
                type: AlexaSkill.speechOutputType.SSML
            }

            game.save(allDoneCallback);

        });
        
    };

    //DEFAULT:
    //============================

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.  Whenever you\'re ready, you can start giving points to the players in your game.');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.  Whenever you\'re ready, you can start giving points to the players in your game.');
        } else {
            response.tell('');
        }
    };
};
exports.register = registerIntentHandlers;
