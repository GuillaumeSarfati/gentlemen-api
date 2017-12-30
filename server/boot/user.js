'use strict';

const async = require('async');

module.exports = (server) => {
  const {User} = server.models;

  User.near = (req, callback = () => {}) => {
    const {Match} = User.app.models;
    console.log('NEAR ME', req.accessToken.userId);
    async.waterfall([
      (done) => {
        User.findById(req.accessToken.userId, (err, owner) => {
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
        Match.find({
          where: {
            ownerId: owner.id,
          },
        }, (err, matchs) => done(err, owner, matchs));
      },
      (owner, matchs, done) => {
        const idNin = matchs.map((match) => match.memberId);
        idNin.push(owner.id);
        User.find({
          where: {
            id: {
              nin: idNin,
            },
            position: {
              near: owner.position,
              maxDistance: 10,
            },
          },
          limit: 10,
        }, done);
      },
    ], callback);
  };

  User.remoteMethod('near', {
    accepts: [
      {
        arg: 'req',
        type: 'object',
        http: {
          source: 'req',
        },
      },
    ],
    returns: {
      root: true,
      arg: 'result',
      type: 'object',
    },
    http: {
      verb: 'get',
      path: '/near',
    },
  });
};
