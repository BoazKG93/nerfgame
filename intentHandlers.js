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

function keepGameRunning(response, speechOutput) {


    var promtpOutPut = {
        speech: '<speak>'+
        '<break time="1s"/>' +
        'I am listening to your screams on the battlefield mortal'+
        '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    }
    
    response.ask(speechOutput,promtpOutPut);
}

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.HitIntent = function (intent, session, response) {
        running = false;
        var playerName = intent.slots.PlayerName.value;

        //var player = getPlayer(playerName);
        //var playerHealth = player.health;
        var playerHealth = 10;


        function getPlayer(playerName) {
            var playerNameStub = 'Anton';
            return playerNameStub;
        }


        if(playerHealth > 0) {
            playerHealth--;
            if(playerHealth > 0) {
                var speechOutput = playerName + ' has been hit and has ' + playerHealth + ' health points left!';
            } else {
                var speechOutput = playerName + ' is dead and out of the game.';
            }
        } else {
            var speechOutput = playerName + ' is already dead.';
        }

        //response.tell(speechOutput);
        running = true;
        console.log('At the end of HitIntent');
        keepGameRunning(response, speechOutput);
    };

    intentHandlers.AddPlayerIntent = function (intent, session, response) {
        var playerName1 = intent.slots.PlayerNameOne.value;
        var playerName2 = intent.slots.PlayerNameTwo.value;
        var playerName3 = intent.slots.PlayerNameThree.value;
        var playerName4 = intent.slots.PlayerNameFour.value;
        var players = [playerName1, playerName2, playerName3, playerName4];
        var counter = 0;
        players.forEach(function(item) {
            if(item.length != 0) {
                //addPlayer(this);
                counter++; 
                if(counter <= 2) {
                    //addToTeam(this, "Ninja Coders");
                } else {
                    //addToTeam(this, "Teddy Bears");
                }
            }
        });

        var speechOutput = { 
            speech: '<speak><p><s>All players have been added, lets start having fun!</s>' +
            '<s>our teams for today are:</s><s>' + 
            playerName1 + ' and ' +
            playerName2 + ' are in team Ninja Coders team</s><s> and ' +
            playerName3 + ' and ' +
            playerName4 + ' are in Teddy Bears team.</s><s>I wish you all good luck and let the game begin!</s></p>'+
            '<s>3<break time="1s"/>2<break time="1s"/>1<break time="1s"/>Go!</s></speak>',
            type: AlexaSkill.speechOutputType.SSML
        }

        //response.tell(speechOutput);
        console.log('At the end of the AddPlayerIntent');
        keepGameRunning(response, speechOutput);
    };


    intentHandlers.StartGameIntent = function (intent, session, response) {
        response.ask('So we will start our game shortly! quick question though, who will be playing today?');        
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
