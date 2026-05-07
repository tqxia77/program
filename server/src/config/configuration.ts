export default () => ({
  // 数据库
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_USERNAME: process.env.DB_USERNAME || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE || 'yinling',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // 微信
  WECHAT_APPID: process.env.WECHAT_APPID || '',
  WECHAT_SECRET: process.env.WECHAT_SECRET || '',

  // 对象存储
  OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID || '',
  OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET || '',
  OSS_BUCKET: process.env.OSS_BUCKET || '',
  OSS_REGION: process.env.OSS_REGION || '',
  OSS_ENDPOINT: process.env.OSS_ENDPOINT || '',

  // 服务端口
  PORT: parseInt(process.env.PORT, 10) || 3000,
});
