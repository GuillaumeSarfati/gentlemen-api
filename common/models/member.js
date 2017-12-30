'use strict';

module.exports = (Member) => {
  require('./member/facebook')(Member);
  require('./member/authenticate')(Member);
  require('./member/search')(Member);
  require('./member/near')(Member);
};
