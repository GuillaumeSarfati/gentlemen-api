'use strict';

const async = require('async');

module.exports = (server) => {
  delete server.models.Member.validations.email;
  delete server.models.Member.validations.password;
};
