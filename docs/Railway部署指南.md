# Railway 部署指南

## 一、上传代码到 GitHub

### 方法1：在 GitHub 网页上操作（推荐）

#### 1.1 创建新仓库

1. 打开 https://github.com
2. 点击右上角 **+** → **New repository**
3. 仓库名称：`yinling-backend`
4. 选择 **Private**（私有）
5. 点击 **Create repository**

#### 1.2 上传文件

在创建的仓库页面：

1. 点击 **uploading an existing file**
2. 把 `server` 文件夹里的**所有文件**拖进去
3. **注意**：不要上传 `node_modules` 和 `dist` 文件夹
4. 点击 **Commit changes**

### 需要上传的文件清单

```
server/
├── src/                    ✅ 上传
├── package.json            ✅ 上传
├── tsconfig.json           ✅ 上传
├── nest-cli.json          ✅ 上传
├── .env.example           ✅ 上传（复制一份重命名为 .env）
├── .gitignore             ✅ 上传
├── node_modules/          ❌ 不上传
└── dist/                  ❌ 不上传
```

### 1.3 配置环境变量

在仓库页面：

1. 点击 **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

2. 添加以下 Secrets：

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://用户名:密码@主机:5432/数据库名` |
| `JWT_SECRET` | `任意32位以上的随机字符串` |
| `JWT_REFRESH_SECRET` | `另一个随机字符串` |
| `WECHAT_APPID` | `wx你的AppID` |
| `WECHAT_SECRET` | `你的AppSecret` |

---

## 二、在 Railway 部署

### 2.1 创建 Railway 账号

1. 打开 https://railway.app
2. 点击 **Login** → 用 GitHub 账号登录

### 2.2 新建项目

1. 点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 选择你刚创建的 `yinling-backend` 仓库
4. 点击 **Deploy Now**

### 2.3 配置环境变量

1. 点击项目 → **Settings** → **Variables**
2. 添加以下变量：

```
DATABASE_URL=postgresql://用户名:密码@主机:5432/数据库名
JWT_SECRET=你的JWT密钥
JWT_REFRESH_SECRET=你的刷新密钥
WECHAT_APPID=wx你的AppID
WECHAT_SECRET=你的AppSecret
PORT=3000
```

### 2.4 添加 PostgreSQL 数据库

1. 在项目页面点击 **New** → **Database** → **Add PostgreSQL**
2. Railway 会自动创建数据库
3. 点击数据库 → **Connect** → 复制 `DATABASE_URL`

### 2.5 等待部署

1. Railway 会自动检测 `package.json` 中的启动命令
2. 等待 **Deploying...** 变成绿色 ✅
3. 点击生成的域名访问，如：`https://xxx.up.railway.app`

---

## 三、验证部署

### 3.1 测试 API

访问以下地址确认服务正常：

```
https://你的域名.railway.app/api/seeder/init
```

应该返回成功信息。

### 3.2 查看日志

1. 点击部署 → **Logs**
2. 查看是否有错误

---

## 四、常见问题

### Q: Railway 显示部署失败

**检查日志**，常见原因：
- 环境变量缺失
- DATABASE_URL 格式错误
- TypeScript 编译错误

### Q: 数据库连接失败

确保：
- DATABASE_URL 格式正确
- 数据库已创建
- 网络可以访问

### Q: 微信登录不能用

确保：
- WECHAT_APPID 和 WECHAT_SECRET 正确
- 在微信公众平台配置了请求域名

---

## 五、部署完成后的下一步

1. **复制 Railway 提供的域名**
2. **修改前端 `.env` 文件**：
   ```bash
   PROJECT_DOMAIN=https://xxx.railway.app
   ```
3. **重新构建小程序**：
   ```bash
   pnpm build:weapp
   ```
4. **微信开发者工具扫码预览**

---

## 附录：完整环境变量清单

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DATABASE_URL | PostgreSQL连接地址 | postgresql://user:pass@host:5432/db |
| JWT_SECRET | JWT签名密钥(32位+) | abcdefghijk123456789012345678 |
| JWT_REFRESH_SECRET | 刷新Token密钥 | zyxwvut321abcdefghijk987654321 |
| WECHAT_APPID | 微信AppID | wx1234567890abcdef |
| WECHAT_SECRET | 微信AppSecret | abcdef1234567890 |
| PORT | 服务端口 | 3000 |
