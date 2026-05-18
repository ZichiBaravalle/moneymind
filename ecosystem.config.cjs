module.exports = {
  "apps": [{
    name: 'money-mind',
    script: '/root/money mind/.output/server/index.mjs',
    instances: 1,
    watch: false,
    error_file: '/root/money mind/logs/err.log',
    out_file: '/root/money mind/logs/out.log',
    log_file: '/root/money mind/logs/combined.log',
    time: true
  }]
}
