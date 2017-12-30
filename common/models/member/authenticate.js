module.exports = function(Member) {
  Member.authenticate = function(customer, callback) {
    const {AccessToken} = Member.app.models;
    const ttl = 1000 * 60 * 60 * 24 * 7;
    customer.createAccessToken(ttl, function(err, token) {
      if (err) return callback(err);
      AccessToken.find({}, function() {
        token.token = token.id;
        callback(null, token);
      });
    });
  };
};
