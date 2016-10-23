/**
 Project of HackHarvard | 36h Hackathon

 "Vokabel Trainer" (English / German) for Amazon Echo.
 Alexa will ask you words in English and validates you answer.

 There are two version: multiple choice and say the answer without any hint.

 This is set to the free text version

 Based on the Amazon 60 minute example
 */

/**
 * This sample shows how to create a simple Trivia skill with a multiple choice format. The skill
 * supports 1 player at a time, and does not support games across sessions.
 */

'use strict';

var words = 5;

/**
 * dictionary of words and the german expression.
 * Pay attention to the Speech Synthesis Markup Language (SSML):
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference
 */

 var questions = [
     {
         "<phoneme alphabet=\"ipa\" ph=\"wɒt\">WHAT</phoneme><break time=\"0.1s\"/><phoneme alphabet=\"ipa\" ph=\"ɪz\">IS</phoneme><break time=\"0.1s\"/><phoneme alphabet=\"ipa\" ph=\"ði:\">THE</phoneme><break time=\"0.1s\"/><phoneme alphabet=\"ipa\" ph=\"ˈʤɜ:mən\">GERMAN</phoneme><break time=\"0.1s\"/><phoneme alphabet=\"ipa\" ph=\"wɜ:d\">WORD</phoneme><break time=\"0.1s\"/><phoneme alphabet=\"ipa\" ph=\"fɔ:ʳ\">FOR</phoneme><break time=\"0.5s\"/><phoneme alphabet=\"ipa\" ph=\"pleɪn\">PLANE</phoneme><break time=\"0.1s\"/>": [
             "Flugzeug",
             "Fahrrad",
             "Zug",
             "Kutsche",
             "Auto",
             "Schiff"
         ]
     },

     {
         "Was heißt <break time=\"0.5s\"/><phoneme alphabet=\"ipa\" ph=\"bi:tʃ\">BEACH</phoneme><break time=\"0.5s\"/> auf Deutsch?": [
             "Strand",
             "Wald",
             "Wiese",
             "Berge",
             "Vulkan",
             "See"
         ]
     },


     {
         "Was heißt <break time=\"0.5s\"/><phoneme alphabet=\"ipa\" ph=\"pæspɔ:rt\">PASSPORT</phoneme><break time=\"0.5s\"/> auf Deutsch?": [
             "Reisepass",
             "Buch",
             "Heft",
             "Notizen",
             "Zettel",
             "Personalausweis"
         ]
     },

 {
         "Was heißt <break time=\"0.5s\"/><phoneme alphabet=\"ipa\" ph=\"su:tkeɪs\">SUITCASE</phoneme><break time=\"0.5s\"/> auf Deutsch?": [
             "Koffer",
             "Sack",
             "Tasche",
             "Rucksack",
             "Seesack",
             "Truhe"
         ]
     },

     {
         "Was heißt <break time=\"0.5s\"/><phoneme alphabet=\"ipa\" ph=\"gaɪdbʊk\">GUIDEBOOK</phoneme><break time=\"0.5s\"/> auf Deutsch?": [
             "Reiseführer",
             "Taschenbuch",
             "Notizbuch",
             "Kochbuch",
             "Schmonzette",
             "Schulbuch"
         ]
     },

];

var welcome = "<phoneme alphabet=\"ipa\" ph=\"haɪ! . ðɪs . ɪz . ju . əˈlɛksə . ɛˈneɪbəld . ˈʤɜrmən . ˈtreɪnər . . aɪ . wɪl . æsk . ju . \">-</phoneme>" + words + "<phoneme alphabet=\"ipa\" ph=\" . wɜrdz . ænd . jul . rɪˈspɑnd . wɪð ðə raɪt . ˈʤɜrmən wɜrd.\">-</phoneme>"
    + "<phoneme alphabet=\"ipa\" ph=\"fɔr . ɪgˈzæmpəl . \">-</phoneme>, Haus <break time=\"0.5s\"/>"
    + "<phoneme alphabet=\"ipa\" ph=\"tu gɛt ə hɪnt ʤʌst seɪ \">-</phoneme>. Wiederholen. <break time=\"0.5s\"/>";

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

     if (event.session.application.applicationId !== "amzn1.ask.skill.11166ed5-c2fc-45f0-8856-65a05384055d") {
         context.fail("Invalid Application ID");
      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // handle yes/no intent after the user has been prompted
    if (session.attributes && session.attributes.userPromptedToContinue) {
        delete session.attributes.userPromptedToContinue;
        if ("AMAZON.NoIntent" === intentName) {
            handleFinishSessionRequest(intent, session, callback);
        } else if ("AMAZON.YesIntent" === intentName) {
            handleRepeatRequest(intent, session, callback);
        }
    }

    // dispatch custom intents to handlers here
    if ("AnswerIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AnswerOnlyIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("DontKnowIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.NoIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------

//Keep 0, when you use the open question mode, change to 4 if you want to use multible choice
var ANSWER_COUNT = 0;
// Change to dictionary length
var GAME_LENGTH = words;
var CARD_TITLE = "HackHarvard";

function getWelcomeResponse(callback) {
    var sessionAttributes = {},
        speechOutput = welcome,
        shouldEndSession = false,

        gameQuestions = populateGameQuestions(),
        correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT)), // Generate a random index for the correct answer, from 0 to 3
        roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex),

        currentQuestionIndex = 0,
        spokenQuestion = Object.keys(questions[gameQuestions[currentQuestionIndex]])[0],
        repromptText = "1. Frage " + spokenQuestion + " ",

        i, j;
        var repromptText2 = "";

    for (i = 0; i < ANSWER_COUNT; i++)
    {
        repromptText2 = "<break time=\"0.5s\"/>" + roundAnswers[i] + ". "
    }

    speechOutput += repromptText;
    sessionAttributes = {
        "speechOutput": repromptText,
        "repromptText": repromptText,
        "currentQuestionIndex": currentQuestionIndex,
        "correctAnswerIndex": correctAnswerIndex + 1,
        "questions": gameQuestions,
        "score": 0,
        "correctAnswerText":
            questions[gameQuestions[currentQuestionIndex]][Object.keys(questions[gameQuestions[currentQuestionIndex]])[0]][0]
    };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function populateGameQuestions() {
    var gameQuestions = [];
    var indexList = [];
    var index = questions.length;

    if (GAME_LENGTH > index){
        throw "Error. Invalid Game Length.";
    }

    for (var i = 0; i < questions.length; i++){
        indexList.push(i);
    }

    // Pick GAME_LENGTH random questions from the list to ask the user, make sure there are no repeats.
    for (var j = 0; j < GAME_LENGTH; j++){
        var rand = Math.floor(Math.random() * index);
        index -= 1;

        var temp = indexList[index];
        indexList[index] = indexList[rand];
        indexList[rand] = temp;
        gameQuestions.push(indexList[index]);
    }

    return gameQuestions;
}

function populateRoundAnswers(gameQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation) {
    // Get the answers for a given question, and place the correct answer at the spot marked by the
    // correctAnswerTargetLocation variable. Note that you can have as many answers as you want but
    // only ANSWER_COUNT will be selected.
    var answers = [],
        answersCopy = questions[gameQuestionIndexes[correctAnswerIndex]][Object.keys(questions[gameQuestionIndexes[correctAnswerIndex]])[0]],
        temp, i;

    var index = answersCopy.length;

    if (index < ANSWER_COUNT){
        throw "Error. Not enough answers for question.";
    }

    // Shuffle the answers, excluding the first element.
    for (var j = 1; j < answersCopy.length; j++){
        var rand = Math.floor(Math.random() * (index - 1)) + 1;
        index -= 1;

        var temp = answersCopy[index];
        answersCopy[index] = answersCopy[rand];
        answersCopy[rand] = temp;
    }

    // Swap the correct answer into the target location
    for (i = 0; i < ANSWER_COUNT; i++) {
        answers[i] = answersCopy[i];
    }
    temp = answers[0];
    answers[0] = answers[correctAnswerTargetLocation];
    answers[correctAnswerTargetLocation] = temp;
    return answers;
}

function handleAnswerRequest(intent, session, callback) {
    var speechOutput = "";
    var sessionAttributes = {};
    var gameInProgress = session.attributes && session.attributes.questions;
    var answerSlotValid = isAnswerSlotValid(intent);
    var userGaveUp = intent.name === "DontKnowIntent";

    if (!gameInProgress) {
        // If the user responded with an answer but there is no game in progress, ask the user
        // if they want to start a new game. Set a flag to track that we've prompted the user.
        sessionAttributes.userPromptedToContinue = true;
        speechOutput = "<phoneme alphabet=\"ipa\" ph=\"ðɛr ɪz noʊ ˈæktɪv ˈsɛʃən. du ju wɑnt tu stɑrt ə nu wʌn? ʤʌst seɪ:\">-</phoneme>. Ja!";
        callback(sessionAttributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
    }
    /**else if (!answerSlotValid && !userGaveUp) {
      // If the user provided answer isn't a number > 0 and < ANSWER_COUNT,
      // return an error message to the user. Remember to guide the user into providing correct values.
      var reprompt = session.attributes.speechOutput;
      var speechOutput = "leider falsch. <phoneme alphabet=\"ipa\" ph=\"ðə kəˈrɛkt ˈænsər wʊd hæv bɪn :  \">-</phoneme>"  + session.attributes.correctAnswerText + ". ";
      callback(session.attributes,
          buildSpeechletResponse(CARD_TITLE, speechOutput, reprompt, false));
    }
    **/
    else {

      /*
      * Check if correct answer: compare answer to dictionary with Amazon language processing
      * ---------------- ++++++++++++++++++++ -------------------
      */

        var gameQuestions = session.attributes.questions,
            correctAnswerIndex = parseInt(session.attributes.correctAnswerIndex),
            currentScore = parseInt(session.attributes.score),
            currentQuestionIndex = parseInt(session.attributes.currentQuestionIndex),
            correctAnswerText = session.attributes.correctAnswerText;

        var speechOutputAnalysis = "";

        if (intent.slots.Answer.value == correctAnswerText) {
            currentScore++;
            speechOutputAnalysis = "richtig! ";
        } else {
            if (!userGaveUp) {
                speechOutputAnalysis = "leider falsch. "
            }
            speechOutputAnalysis += "<phoneme alphabet=\"ipa\" ph=\"ðə kəˈrɛkt ˈænsər wʊd hæv bɪn :  \">-</phoneme>"  + correctAnswerText + ". ";
        }
        // if currentQuestionIndex is #max-1, we've reached #max of questions (zero-indexed) and can exit the game session
        if (currentQuestionIndex == GAME_LENGTH - 1) {
            speechOutput = userGaveUp ? "" : "Die Antwort ist ";
            speechOutput += speechOutputAnalysis + "<phoneme alphabet=\"ipa\" ph=\"ju gɑt\">-</phoneme> " + currentScore.toString() + " out of "
                + GAME_LENGTH.toString() + "<phoneme alphabet=\"ipa\" ph=\"ˈkwɛsʧənz kəˈrɛkt. θæŋk ju fɔr ˈpleɪɪŋ! \">-</phoneme>    ";
            callback(session.attributes,
                buildSpeechletResponse(CARD_TITLE, speechOutput, "", true));
        } else {
            currentQuestionIndex += 1;
            var spokenQuestion = Object.keys(questions[gameQuestions[currentQuestionIndex]])[0];
            // Generate a random index for the correct answer, from 0 to 3
            correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
            var roundAnswers = populateRoundAnswers(gameQuestions, currentQuestionIndex, correctAnswerIndex),

                questionIndexForSpeech = currentQuestionIndex + 1,
                repromptText = "<break time=\"0.5s\"/> Frage" + questionIndexForSpeech.toString() + "<break time=\"0.1s\"/>. " + spokenQuestion + " ";

            speechOutput += userGaveUp ? "" : "Die Antwort ist ";
            speechOutput += speechOutputAnalysis + "Dein score ist " + currentScore.toString() + ". " + repromptText;

            sessionAttributes = {
                "speechOutput": repromptText,
                "repromptText": repromptText,
                "currentQuestionIndex": currentQuestionIndex,
                "correctAnswerIndex": correctAnswerIndex + 1,
                "questions": gameQuestions,
                "score": currentScore,
                "correctAnswerText":
                    questions[gameQuestions[currentQuestionIndex]][Object.keys(questions[gameQuestions[currentQuestionIndex]])[0]][0]
            };
            callback(sessionAttributes,
                buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
        }
    }
}

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.

    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    // Set a flag to track that we're in the Help state.
    session.attributes.userPromptedToContinue = true;

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = welcome,
        repromptText = "To give an answer to a question, respond with the number of the answer . "
        + "Would you like to keep playing?";
        var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}

function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    var answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
    return answerSlotIsInt && parseInt(intent.slots.Answer.value) < (ANSWER_COUNT + 1) && parseInt(intent.slots.Answer.value) > 0;
}

// ------- Helper functions to build responses -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
