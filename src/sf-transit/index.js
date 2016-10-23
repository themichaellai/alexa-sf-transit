const alexa = require('alexa-app');
const muni = require('./muni');
const P = require('bluebird');
const R = require('ramda');
const app = new alexa.app('sf-transit');

const nextTrainIntentSchema = {
  slots: {
    stopname: "STOPNAME",
  },
  utterances: [
    "{-|stopname}",
  ],
};

app.launch((req, res) => {
  const prompt = 'Tell me the name of a MUNI stop.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

const handleNextTrain = (req, res) => {
  const stopName = req.slot('stopname');
  if (muni.canGetTimesForStop(stopName)) {
    muni.getTimesForStop(stopName)
      .then(predictions => {
        const predictionStrings =
          R.map(pred => pred.routeTag + ' in ' + pred.minutes + ' minutes',
                predictions);
        if (predictionStrings.length === 0) {
          res.say('no estimated times for ' + r);
        } else {
          res.say(predictionStrings.join(', '));
        }
        res.send();
      })
      .catch(err => {
        res.say('could not retrieve information');
        res.send();
      });
    return false;
  } else {
    // TODO: suggest similar stops
    res.say('can not find information for ' + stopName);
    res.send();
    return true;
  }
};

app.intent('nextTrain', nextTrainIntentSchema, handleNextTrain);

module.exports = app;
