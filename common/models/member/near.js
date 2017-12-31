'use strict';

const async = require('async');

module.exports = (Member) => {
  Member.near = (req, lat, lng, callback = () => {}) => {
    const {Match} = Member.app.models;
    console.log('NEAR ME', typeof lat, lat, typeof lng,  lng);
    async.waterfall([
      (done) => {
        Member.findById(req.accessToken.userId, (err, owner) => {
          if (err || !owner) {
            return done(err || {
              status: 404,
              message: 'Owner not found !',
            });
          }
          done(null, owner);
        });
      },
      (owner, done) => {
        console.log('owner : ', owner);
        Match.find({
          where: {
            ownerId: owner.id,
          },
        }, (err, matchs) => done(err, owner, matchs));
      },
      (owner, matchs, done) => {
        const idNin = matchs.map((match) => match.destId);
        idNin.push(owner.id);
        Member.find({
          where: {
            id: {
              nin: idNin,
            },
            position: {
              near: {
                lat,
                lng,
              },
              maxDistance: 10,
            },
          },
          limit: 10,
        }, done);
      },
    ], callback);
  };

  Member.remoteMethod('near', {
    accepts: [
      {
        arg: 'req',
        type: 'object',
        http: {
          source: 'req',
        },
      },
      {
        arg: 'lat',
        type: 'number',
      },
      {
        arg: 'lng',
        type: 'number',
      },
    ],
    returns: {
      root: true,
      arg: 'result',
      type: 'object',
    },
    http: {
      verb: 'get',
      path: '/near/:lat/:lng',
    },
  });
};
