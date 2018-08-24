module.exports = {
  apps : [{
    name      : 'station',
    script    : 'index.js',
    env: {
      NODE_ENV: 'prod'
    },
    env_production : {
      NODE_ENV: 'prod'
    },
    env_vagrant : {
        NODE_ENV: 'vagrant'
    }
  }]
};
