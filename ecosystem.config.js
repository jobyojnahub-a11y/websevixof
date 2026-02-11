module.exports = {
  apps: [
    {
      name: 'websevix',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/websevix/websevix',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXTAUTH_URL: 'https://websevix.com',
        NEXTAUTH_SECRET: 'websevixofficial!!@@##$$%%^^%%$$#!!',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
