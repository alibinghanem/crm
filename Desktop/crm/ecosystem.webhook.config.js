module.exports = {
  apps: [
    // التطبيق الرئيسي
    {
      name: 'crm-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    // خادم Webhook للتحديث التلقائي
    {
      name: 'crm-webhook',
      script: 'scripts/webhook-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 9000,
        WEBHOOK_SECRET: 'your-secret-key-here' // غيّر هذا!
      },
      error_file: 'logs/webhook-err.log',
      out_file: 'logs/webhook-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    }
  ]
}

