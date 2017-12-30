const pm2 = require('pm2');
const pkg = require('./package.json');

pm2.start({
  name: pkg.name,
  exec_mode: 'fork',
  script: pkg.main,
  watch: process.env.NODE_ENV === 'production' ?
  null :
  [
    'common/models',
    'server',
  ],
  instances: 1,
  args: ['--colors'],
  autorestart: true,
}, (err) => {
  if (err) {
    console.error(`Unexpected error while starting ${pkg.name}`);
    return process.exit(1);
  }
  console.log(`${pkg.name} is starting\nuse pm2 log for show logs`);
  process.exit(0);
});
