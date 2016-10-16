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
var client = require('twilio')('AC86c3899bd3d636ea0ca11f08852c62d7', 'abeafc9d2e485adb038f9e7dac98d58f');
var team1Name = 'Ninjas',
    team2Name = 'Pirates';
var team1NameSingular = 'Ninja',
    team2NameSingular = 'Pirate';
// http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
function shuffle(array) {
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

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
    var teamHealth = team[0].health + team[1].health;
    return teamHealth;
}

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.StartGameIntent = function (intent, session, response) {
        storage.newGame(session, function(game) {
            game.save(function() {
                response.ask('Okay, let\'s get started! Who will be playing today?', '');
            });
        });
    };

    intentHandlers.HitIntent = function (intent, session, response) {
        var allDoneCallback = function(game, speechOutput, success) {
            if (success) {

                var team1Health = getTeamHealth(team1Name, game),
                    team2Health = getTeamHealth(team2Name, game);

                if(team1Health == 0) {
                    var speechOutput = playerName + ' has been hit and team ' + team1Name + ' is defeated, KO!';
                    response.tell(speechOutput);
                } else if (team2Health == 0) {
                    var speechOutput = playerName + ' has been hit and team ' + team2Name + ' is defeated, KO!';
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
            console.log("playerName " + playerName);
            var player = game.getPlayerByCallout(playerName);
            var playerHealth = player.health;

            if(playerHealth > 0) {
                playerHealth--;
                game.decreaseHealth(playerName);
                if(playerHealth > 0) {
                     var speechOutput = {
                        speech: "<speak><audio src='https://s3.amazonaws.com/soundsnerf/Oxygen-Im-New-Mail.mp3'/></speak>",
                        type: AlexaSkill.speechOutputType.SSML
                    };
                } else {
                    var speechOutput = playerName + ' is out.';
                }
            } else {
                var speechOutput = playerName + ' is already out.';
            }

            game.save(allDoneCallback.bind(this, game, speechOutput));

        });
    };

    intentHandlers.AddPlayerIntent = function (intent, session, response) {

        var allDoneCallback = function(speechOutput, success) {
            if (success) {
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
        players = shuffle(players);
        var counter = 0;

        storage.loadGame(session, function(game) {
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

            var speechOutput = {
                speech: '<speak><p><s>Alright, lets start having fun!</s>' +
                '<s>our teams for today are:</s><s>' +
                players[0] + ' and ' +
                players[1] + ' are in team ' + team1Name + '</s>' +
                '<s>' + players[0] + ' is ' + team1NameSingular + ' ' + ' 1 and ' +
                players[1] + ' is ' + team1NameSingular + ' ' + '2</s>' +
                '<s>' + players[2] + ' and ' +
                players[3] + ' are in team ' + team2Name + '</s>' +
                '<s>' + players[2] + ' is ' + team2NameSingular + ' ' + '1 and ' +
                players[3] + ' is ' + team2NameSingular + ' ' + '2</s>' +
                '<s>I wish you all good luck and let the game begin!</s></p>'+
                '<s>3<break time="1s"/>2<break time="1s"/>1<break time="1s"/>Go!</s></speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            game.save(allDoneCallback.bind(this, speechOutput));
        });
    };

    intentHandlers.StartCaptureGameIntent = function (intent, session, response) {
        storage.newGame(session, function(game) {
            game.setGameMode(2);
            game.save(function() {
                var codeWords = ["Hacker", "Club Mate", "Karaoke" , "Octocat", "Merge Conflict", "Coffee"];
                var shuffledCodeWords = shuffle(codeWords);

                //Sende SMS to players for the capture mode
                client.messages.create({
                    body: 'Your code is "'+ shuffledCodeWords[0] +'"',
                    to: '+4915158055841',
                    from: "+4915735985873 "
                });

                client.messages.create({
                    body: 'Your code is "'+ shuffledCodeWords[1] +'"',
                    to: "+4917661254477",
                    from: "+4915735985873 "
                });

                response.ask('Okay, let\'s get started with a capture game! Who will be playing today?', '');
            });
        });
    };

    intentHandlers.ResetGameIntent = function (intent, session, response) {
        storage.loadGame(session, function(game) {
            game.reset();
            response.tell('Ready for the next match!');
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
            response.tell('Okay. See ya!');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay. See ya!');
        } else {
            response.tell('');
        }
    };
};
exports.register = registerIntentHandlers;
