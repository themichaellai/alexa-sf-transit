'use strict';

const P = require('bluebird');
const qs = require('querystring');
const R = require('ramda');
const request = require('request-promise');
const xml2js = require('xml2js');

// http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni
// http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=M
// http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&stopId=16998

const stops = {
  'church and sixteenth inbound': '13985',
  'church and sixteenth outbound': '13984',
  'church inbound': '15726',
  'church outbound': '16998',
  'civic center inbound': '15727',
  'civic center outbound': '16997',
  'embarcadero inbound': '16992',
  'embarcadero outbound': '17217',
  'montgomery inbound': '15731',
  'montgomery outbound': '16994',
  'powell inbound': '15417',
  'powell outbound': '16995',
  'van ness inbound': '15419',
  'van ness outbound': '16996',
};

const parseTimes = P.coroutine(function*(body) {
  const parser = new xml2js.Parser();
  const parsed = yield P.promisify(parser.parseString)(body);
  const rawPredictions =
    R.defaultTo([], R.path(['body', 'predictions'], parsed));

  // Parse each line's predictions.
  const parsedPredictions = R.map(rawPrediction => {
    if (rawPrediction.direction == null || rawPrediction.length === 0) {
      return null;
    }

    // Array of predictions. Could be empty.
    const directionPredictions = R.pipe(
      R.map(R.prop('prediction')),
      // Array of array of "predictions"
      R.flatten,
      // Array of predictions, extract attributes
      R.map(R.prop('$'))
    )(rawPrediction.direction);

    // We only want to report the very next arrival, so sort based on arrival
    // and return the first arrival time.
    const sorted =
      R.sortBy(pred => parseInt(pred.minutes), directionPredictions);
    const next = R.head(sorted);

    return {
      minutes: next.minutes,
      routeTag: R.path(['$', 'routeTag'], rawPrediction),
    };
  }, rawPredictions);

  const predictions = R.pipe(
    R.reject(R.isNil),
    R.sortBy(pred => parseInt(pred.minutes))
  )(parsedPredictions);
  return predictions;
});
exports._parseTimes = parseTimes;

const requestTimes = P.coroutine(function*(stopId) {
  const queryString = qs.stringify({
    command: 'predictions',
    a: 'sf-muni',
    stopId: stopId,
  });
  const url =
    'http://webservices.nextbus.com/service/publicXMLFeed?' + queryString;
  try {
    const res = yield request(url);
    return parseTimes(res);
  } catch (e) {
    throw new Error('could not load predictions');
  }
});

const getTimesForStop = P.coroutine(function*(stopName) {
  const stopId = stops[stopName];
  if (stopId == null) {
    return null;
  }
  return yield requestTimes(stopId);
});
exports.getTimesForStop = getTimesForStop;

const canGetTimesForStop = stopName => R.has(stopName, stops);
exports.canGetTimesForStop = canGetTimesForStop;
