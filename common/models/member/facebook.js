'use strict';

const async = require('async');
const request = require('request');

module.exports = (Member) => {
  Member.facebook = (facebookAccessToken, callback = () => {}) => {
    async.waterfall([
      (done) => Member.fetch(facebookAccessToken, done),
      // Another Middleware,
      Member.connect,
    ], callback);
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
    console.log('Member fetch facebook', facebookAccessToken);
    async.waterfall([
      (done) => {
        // Request for get pictures
        // request.get({
        //   url: 'https://graph.facebook.com/me/photos',
        //   qs: {
        //     type: 'uploaded',
        //     access_token: facebookAccessToken,
        //   },
        // }, (err, res, body) => {
        //   console.log(err, res.statusCode, body);
        // });
        request.get({
          url: 'https://graph.facebook.com/me',
          // ?access_token=${accessToken}&fields=id,name,picture.type(large)',
          qs: {
            fields: 'id,name,first_name,gender,picture.type(large)',
            access_token: facebookAccessToken,
          },
          json: true,
        }, (err, res, newMember) => {
          if (err || res.statusCode !== 200) {
            return done(err || {
              status: res.statusCode,
              message: 'Unexpected error while trying to fetch facebook info',
            });
          }
          return done(null, {
            id: newMember.id,
            fullname: newMember.name,
            firstname: newMember.first_name,
            gender: newMember.gender,
            pictures: [
              newMember.picture.data.url,
            ],
          });
        });
      },
      (newMember, done) => {
        console.log(newMember);
        Member.findOne({
          where: {
            id: newMember.id,
          },
        }, (err, member) => {
          if (member) {
            member.facebookAccessToken = facebookAccessToken;
            return member.save(callback);
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
      path: '/facebook/:facebookAccessToken',
    },
  });
};
