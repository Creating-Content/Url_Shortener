# Deployment Guide — Short URL Service

This document describes the steps used to deploy the Short URL Service to an **Ubuntu** EC2 instance, run the Node.js app under `pm2`, front it with `nginx` as a reverse proxy, and secure it with Let’s Encrypt (`certbot`). All sensitive values (private keys, MongoDB URIs, domain names) are represented as placeholders — do NOT commit real secrets to the repository.

## Prerequisites

- An AWS EC2 instance (Ubuntu 20.04 / 22.04 recommended) with a public IP and SSH access.
- A key pair (`.pem`) configured in EC2 (do not include the key file in the repo).
- A domain or subdomain pointing to the EC2 public IP (A record).
- MongoDB Atlas cluster (or any accessible MongoDB instance).

> NOTE: Replace placeholders like `YOUR_KEY.pem`, `ubuntu@EC2_PUBLIC_DNS`, `YOUR_DOMAIN`, and `MONGODB_URI_HERE` with your real values.

---

## 1) SSH to the server

On your local machine set file permissions and connect:

```bash
chmod 400 "YOUR_KEY.pem"
ssh -i "YOUR_KEY.pem" ubuntu@EC2_PUBLIC_DNS

# once connected, verify working directory:
pwd
ls
```

## 2) System update and Node.js installation

Install updates and Node.js 22.x (official NodeSource installer):

```bash
sudo apt-get update && sudo apt-get upgrade -y
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
node --version
npm --version
```

If you prefer an LTS version, replace `setup_22.x` with the desired Node version script.

## 3) Clone the repository and install dependencies

```bash
git clone https://github.com/Creating-Content/Url_Shortener.git
cd Url_Shortener
npm install
```

Confirm that the main entry file is `indexEjs.js` (this repository uses that by default).

## 4) Process manager: pm2

Install `pm2` globally and run the app. Use environment variables for secrets — do NOT embed secrets in code.

```bash
sudo npm i -g pm2

# Option A: quick start (set important envs before start)
PM2_APP_NAME="url-shortener"
export MONGODB_URI="MONGODB_URI_HERE"
pm2 start indexEjs.js --name "$PM2_APP_NAME" --update-env

# Persist pm2 across reboots
pm2 startup systemd
pm2 save

# View logs
pm2 logs $PM2_APP_NAME
```

### Recommended: use a pm2 ecosystem file (better for multiple envs)

Create `ecosystem.config.js` in the repo root (example):

```javascript
module.exports = {
  apps: [
    {
      name: 'url-shortener',
      script: 'indexEjs.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8001,
        MONGODB_URI: 'MONGODB_URI_HERE' // replace with env var or runtime secret
      }
    }
  ]
}
```

Then start with:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

To inject secrets at runtime without placing them in the file, set the environment on the shell or use a secure secret manager and `--update-env` when restarting.

## 5) Nginx as reverse proxy

Install nginx and configure a server block that proxies requests to your Node application (running on `localhost:8001`):

```bash
sudo apt-get install -y nginx

# Open the default site config for editing (or create a new file under sites-available)
sudo vim /etc/nginx/sites-available/default
```

Replace the default server block contents with a simple reverse-proxy config (or adapt to your needs):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN; # replace with real domain(s)

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Validate and reload nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
# or
sudo nginx -s reload
```

After this is working, visiting `http://YOUR_DOMAIN` should show your Node app proxied through nginx.

## 6) Secure with Let's Encrypt (certbot)

Install certbot for nginx and request certificates for your domain/subdomain:

```bash
sudo add-apt-repository ppa:certbot/certbot -y
sudo apt-get update
sudo apt-get install -y python3-certbot-nginx

# Run certbot and follow prompts. Replace with your real domains.
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# To test renewals:
sudo certbot renew --dry-run
```

Certbot will update your nginx config to serve HTTPS and configure automatic renewal hooks.

## 7) Common troubleshooting & tips

- If the app does not start, check `pm2 logs` and `journalctl -u nginx` for errors.
- Ensure the `PORT` used by the Node app matches the `proxy_pass` in nginx (default here: 8001).
- Use `sudo ufw allow 'Nginx Full'` to open ports 80 and 443 if `ufw` is enabled.
- Do NOT store the production `MONGODB_URI` in the repository. Use environment variables, `pm2` env, or a secrets manager.
- To set environment variables in the shell before restarting pm2 (example):

```bash
export MONGODB_URI="your_production_mongo_connection_string"
pm2 restart url-shortener --update-env
```

## 8) Optional: persisting the application via systemd (alternative to pm2 startup)

If you prefer running Node directly under systemd, use `pm2 startup` which writes a systemd unit automatically when requested, or create a custom systemd unit that sets environment variables carefully (not recommended to keep secrets in plain text here).

## 9) Security reminders

- Never commit private keys (`.pem`) or connection strings to version control.
- Limit SSH access via Security Group rules (allow your IP only to port 22 when possible).
- Use IAM roles and a secure secret manager for production credentials where possible.

---

If you want, I can:

- create an `ecosystem.config.js` in the repo with placeholders and instructions to use it, or
- produce a ready-to-use `nginx` site file (named `url-shortener`) and a sample `certbot` command customized for `www.url-shortener.casacam.net` (I will use that exact domain only if you confirm).

Feel free to tell me which option you prefer.
