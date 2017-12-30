'use strict';

const fs = require('fs');
const async = require('async');
const request = require('request');
const {GeoPoint} = require('loopback');
const server = require('./server/server');

const {Member, Match} = server.models;

const geoData = fs.readFileSync('./data/geoPts.txt').toString();

const geoPts = geoData.split('\n').map((line) => {
  const geo = line.split(',');
  return {
    lat: Number(geo[1]),
    lng: Number(geo[3]),
  };
});

request('https://randomuser.me/api/?results=1000', (err, res, body) => {
  const data = JSON.parse(body).results;

  const members = data.map((member) => {
    const position = geoPts[Math.floor(Math.random() * (999 - 0 + 1)) + 0];
    const freshMember = {
      email: member.email,
      gender: member.gender,
      firstname: member.name.first,
      password: member.login.password,
      position: new GeoPoint(position),
      lastname: member.name.last,
      pictures: [
        member.picture.large,
      ],
    };
    console.log(freshMember);
    return freshMember;
  });
  Member.create(members, (err) => console.log('creation done'));
});
