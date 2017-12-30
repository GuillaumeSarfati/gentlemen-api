'use strict';

const async = require('async');
const axios = require('axios');
const request = require('request');

module.exports = (Member) => {
  Member.facebook = (facebookAccessToken, callback = () => {}) => {
    async.waterfall([
      (done) => Member.fetch(facebookAccessToken, done),
      // Another Middleware,
    ], (err, member) => {
      Member.connect(member, callback);
    });
  };

  Member.connect = (member, callback = () => {}) => {
    Member.authenticate(member, (err, token) => {
      callback(err, {
        member,
        token,
      });
    });
  };

  Member.fetch = (facebookAccessToken, callback = () => {}) => {
    async.waterfall([
      (done) => {
        request.get({
          url: 'https://graph.facebook.com/v2.3/me',
          qs: {
            access_token: facebookAccessToken,
            fields: 'id,name',
          },
          json: true,
        }, (err, res, newMember) => {
          return done(err, newMember);
        });
      },
      (newMember, done) => {
        Member.findOne({
          where: {
            id: newMember.id,
          },
        }, (err, member) => {
          if (member) {
            member.facebookAccessToken = facebookAccessToken;
            return Member.upsert(member, callback);
          }
          return done(err, newMember);
        });
      },
      (newMember, done) => {
        newMember.facebookAccessToken = facebookAccessToken;
        Member.create(newMember, done);
      },
    ], callback);
  };

  Member.remoteMethod('facebook', {
    accepts: [
      {
        arg: 'facebookAccessToken',
        type: 'string',
      },
    ],
    returns: {
      root: true,
      arg: 'result',
      type: 'object',
    },
    http: {
      verb: 'post',
      path: '/facebook/:id',
    },
  });
};
