/* globals describe, it */
'use strict';

const chai = require('chai');
const fs = require('fs');
const path = require('path');

const muni = require('../../src/sf-transit/muni');

const assert = chai.assert;

describe('muni', done => {
  describe('parseTimes()', () => {
    it('shoud parse predictions xml for predictions', () => {
      const predictionsXml =
        fs.readFileSync(path.resolve(__dirname, 'responses/predictions.xml'));

      const expected = [
        {
          minutes: '17',
          routeTag: '22',
        },
        {
          minutes: '33',
          routeTag: 'J',
        },
      ];

      return muni._parseTimes(predictionsXml)
        .then(predictions => {
          assert.deepEqual(predictions, expected);
        });
    });
  });
});
