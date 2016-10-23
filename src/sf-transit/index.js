const alexa  = require('alexa-app');
var app = new alexa.app('sf-transit');

const nextTrainIntentSchema = {
  slots: {
    stopname: "STOPNAME",
  },
  utterances: [
    "next trains for {-|stopname}",
  ],
};

app.launch((req, res) => {
  const prompt = 'Tell me the name of a MUNI stop.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('nextTrain', nextTrainIntentSchema, (req, res) => {
  res.say('You asked for the stop ' + req.slot('stopname'));
});

module.exports = app;
