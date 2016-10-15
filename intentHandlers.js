/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.HitIntent = function (intent, session, response) {
        var playerName = intent.slots.PlayerName.value;
        var player = getPlayer(playerName);
        var playerHealth = player.health;
        
        if(playerHealth > 0) {
            playerHealth--;
            if(playerHealth > 0) {
                var speechOutput = playerName + ' has been hit and has' + playerHealth + 'health points left!';
            } else {
                var speechOutput = playerName + ' is dead and out of the game.';
            }
        } else {
            var speechOutput = playerName + ' is already dead.';
        }

        response.tell(speechOutput);
        
    };

    intentHandlers.AddPlayerIntent = function (intent, session, response) {
        var playerName = intent.slots.PlayerName.value;
        var player = getPlayer(playerName);
        if(Object.keys(player).length !== 0) {
            addPlayer(playerName);
            var speechOutput = playerName + ' has been added';
        } else {
            var speechOutput = playerName + ' is already in this game.';
        }
        
        
    };

    intentHandlers.RemovePlayerIntent = function (intent, session, response) {
        var playerName = intent.slots.PlayerName.value;
        var speechOutput = PlayerName + ' has been hit!'
        
    };

    intentHandlers.StartGameIntent = function (intent, session, response) {

        var speechOutput = PlayerName + ' has been hit!'
        
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
