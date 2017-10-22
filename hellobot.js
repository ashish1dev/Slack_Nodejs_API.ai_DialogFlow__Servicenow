module.exports = function(req, res, next) {

  // console.log("req.body = ", req.body);
  var userName = req.body.user_name;
  var botPayload = {
    text: 'Hello, ' + userName + '!'
  }


  var msg = "";
  // avoid infinite loop
  if (userName !== 'slackbot') {
    var nonEnglishQuestionText = req.body.text;
    var googleTranslate = require('google-translate')('AIzaSyCps0ub-KvOUOVOWF1nSsVEgm125xUhWZk');

    googleTranslate.detectLanguage(nonEnglishQuestionText, function(err, detection) {
      console.log(detection.language);
      var detectedLanguage = '';
      if (detection.language == 'fr') {
        detectedLanguage = 'French';
      } else if (detection.language == 'en') {
        detectedLanguage = 'English';
      } else if (detection.language == 'de') {
        detectedLanguage = 'German';
      } else if (detection.language == 'es') {
        detectedLanguage = 'Spanish';
      } else {
        detectedLanguage = detection.language;
      }
      googleTranslate.translate(nonEnglishQuestionText, 'en', function(err, translation) {
        //console.log(translation.translatedText);
        console.log(detection.language);
        // =>  Mi nombre es Brandon
        var ticketNumber = '';
        var strArray = nonEnglishQuestionText.split(" ");
        for (var i = 0; i < strArray.length; i++) {
          if (strArray[i].indexOf('INC') != -1) {
            ticketNumber = strArray[i];
          }
        }

        // ticketNumber = 'INC0010329';
        var speechOutput = '';
        console.log("ticketNumber = ", ticketNumber);
        if (ticketNumber != '') {
          process.env.CHAT_TRANSCRIPT = "";
          getJSON(ticketNumber, function(data) {
            console.log("data = ", data);
            if (data != "ERROR" && data == "NO_MATCH") {
              speechOutput = "Ticket number " + ticketNumber + " does not exists under your account. Please ask me details about ticket under your account.";
              console.log(speechOutput);
            }
            if (data != "ERROR" && data != "NO_MATCH") {
              var str_array = data.split('#');
              var description = str_array[0];
              var stateNum = str_array[1];
              var assigned_to = str_array[2];
              if (assigned_to == "") {
                assigned_to = "None";
              }
              console.log("assigned_to = ", assigned_to);
              var state = "";
              if (stateNum == '1') {
                state = "New";
              } else if (stateNum == '2') {
                state = "Active";
              } else if (stateNum == '3') {
                state = "Awaiting Problem";
              } else if (stateNum == '4') {
                state = "Awaiting User Info";
              } else if (stateNum == '5') {
                state = "Awaiting Evidence";
              } else if (stateNum == '6') {
                state = "Resolved";
              } else if (stateNum == '7') {
                state = "Closed";
              } else if (stateNum == '8') {
                state = "Open";
              } else if (stateNum == '9') {
                state = "Acknowledged";
              } else if (stateNum == '10') {
                state = "Work-In-progress";
              } else if (stateNum == '11') {
                state = "Cancelled";
              }

              speechOutput = "Ticket number " + ticketNumber + " has following description  : '" + description + "',  it's state is : " + state + ", and is assigned to : " + assigned_to + ".";
            }

            googleTranslate.translate(speechOutput, detection.language, function(err, translation) {

              speechOutput = translation.translatedText;
              // console.log(translation.translatedText);
              console.log(speechOutput);
              botPayload.text = speechOutput;
              return res.status(200).json(botPayload);
            });

          });
        } else {
          googleTranslate.translate(nonEnglishQuestionText, 'en', function(err, translation) {

            var translatedText = translation.translatedText;
            console.log("translatedText = == ", translatedText);

            getIntentName(translatedText, function(intentName, new_password) {
              //var intentName = data;
              console.log("intentName = ", intentName);
              if (intentName == 'CannotLogin') {
                process.env.CHAT_TRANSCRIPT = "";
                process.env.CHAT_TRANSCRIPT = process.env.CHAT_TRANSCRIPT + "\n User : " + nonEnglishQuestionText;

                msg = "Which application are you trying to access ?";

                googleTranslate.translate(msg, detection.language, function(err, translation) {
                  speechOutput = translation.translatedText;
                  console.log(speechOutput);
                  process.env.CHAT_TRANSCRIPT = process.env.CHAT_TRANSCRIPT + "\n Neva Virtual Agent : " + speechOutput;
                  botPayload.text = speechOutput;
                  return res.status(200).json(botPayload);
                });
              } else if (intentName == 'whichApplication') {
                msg = "OK. You should reset your password. Do you want to reset the password?";
                googleTranslate.translate(msg, detection.language, function(err, translation) {
                  speechOutput = translation.translatedText;
                  console.log(speechOutput);
                  process.env.CHAT_TRANSCRIPT = process.env.CHAT_TRANSCRIPT + "\n Neva Virtual Agent : " + speechOutput;
                  botPayload.text = speechOutput;
                  return res.status(200).json(botPayload);
                });
              } else if (intentName == 'ResetPassword') {
                msg = "Sure, Please tell me your old password";

                googleTranslate.translate(msg, detection.language, function(err, translation) {
                  speechOutput = translation.translatedText;
                  console.log(speechOutput);
                  process.env.CHAT_TRANSCRIPT = process.env.CHAT_TRANSCRIPT + "\n Neva Virtual Agent : " + speechOutput;
                  botPayload.text = speechOutput;
                  return res.status(200).json(botPayload);
                });
              } else if (intentName == 'OldPassword') {
                msg = "ok, Now please tell me your new password ?";

                googleTranslate.translate(msg, detection.language, function(err, translation) {
                  speechOutput = translation.translatedText;
                  console.log(speechOutput);
                  process.env.CHAT_TRANSCRIPT = process.env.CHAT_TRANSCRIPT + "\n Neva Virtual Agent : " + speechOutput;
                  botPayload.text = speechOutput;
                  return res.status(200).json(botPayload);
                });
              } else if (intentName == 'NewPassword') {
                msg = "ok Done ! Your password has been updated to " + new_password;
                googleTranslate.translate(msg, detection.language, function(err, translation) {
                  speechOutput = translation.translatedText;
                  console.log(speechOutput);
                  botPayload.text = speechOutput;
                  process.env.CHAT_TRANSCRIPT = process.env.CHAT_TRANSCRIPT + "\n Neva Virtual Agent : " + speechOutput;
                  createNewIncident("password reset", process.env.CHAT_TRANSCRIPT, "6", function(data) {
                    console.log("created resolved incident ...Received response ...", data);
                  });

                  return res.status(200).json(botPayload);
                });
              } else if (intentName == 'Default Welcome Intent') {
                msg = "Hi ! Welcome to Neva Virtual Agent";

                googleTranslate.translate(msg, detection.language, function(err, translation) {
                  speechOutput = translation.translatedText;
                  console.log(speechOutput);
                  process.env.CHAT_TRANSCRIPT = process.env.CHAT_TRANSCRIPT + "\n Neva Virtual Agent : " + speechOutput;
                  botPayload.text = speechOutput;
                  return res.status(200).json(botPayload);
                });
              } else {
                speechOutput = translation.translatedText;
                console.log(speechOutput);
                botPayload.text = speechOutput;
                return res.status(200).json(botPayload);
              }
            });

          });

        }
        //  var speechOutput = "The question you said is : " + nonEnglishQuestionText + ". The language detected is : " + detectedLanguage + " , and its english translation is : " + translation.translatedText;

      });

      // =>  es
    });

  } else {
    return res.status(200).end();
  }


  function url2(ticketNumber) {
    return {
      url: "https://<<instance_name>>.service-now.com/api/now/table/incident?number=" + ticketNumber,
      auth: {
        "username": "<<username>>",
        "password": "<<password>"
      }
    }
  }


  function createNewIncident(short_description, comments, state, callback) {

    var request = require('request');

    var postData = {
      "short_description": short_description,
      "comments": comments,
      "caller_id": "<<caller_id>",
      "category": "hardware",
      "chat_duration": "15.849761009216309",
      "neva_id": "<<id>>",
      "priority": "2",
      "category_suggestions": [],
      "state": state
    }

    var url = 'https://<<instance_name>>.service-now.com/api/now/v1/table/incident'
    var options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        "username": "<<usernamee>>",
        "password": "<<password>>"
      },
      body: postData,
      json: true,
      url: url
    }
    request(options, function(err, res, body) {
      if (err) {
        console.error('error posting json: ', err)
        throw err
      }
      console.log(body);
      callback(body.result.number);
    })
  }

  function getJSON(ticketNumber, callback) {

    // HTTPS with ServiceNow
    var request = require("request")
    request.get(url2(ticketNumber), function(error, response, body) {
      var d = JSON.parse(body)
      console.log("body = ", body);
      var result = d.result
      console.log("result = ", result);
      if (result.length > 0) {
        var entry = result[0];
        callback(entry.short_description + "#" + entry.state + "#" + entry.assigned_to)
      } else {
        callback("NO_MATCH");
      }

    })
  }

  function getIntentName(receivedMsg, callback) {
    var apiai = require("apiai");
    var apiai_app = apiai("<<api_ai_id>>");
    var options = {
      sessionId: '<<session_id>>'
    };
    var request = apiai_app.textRequest(receivedMsg, options);
    request.on('response', function(response) {
      //  console.log(response);
      callback(response.result.metadata.intentName, response.result.parameters.new_password);
      //return res.status(200).send(response);
    });
    request.on('error', function(error) {
      console.log(error);
    });
    request.end();
  }

}
