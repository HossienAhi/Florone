# Florone VPS deploy

## Deploy from Git (recommended)

On the VPS:

```bash
git clone <YOUR_REPO_URL> /var/www/florone
cd /var/www/florone
bash deploy/setup-server.sh    # first time only
bash deploy/deploy.sh
```

Create `backend/.env` before deploy if missing:

```bash
cp backend/.env.example backend/.env
```

## URLs after deploy

| Role | URL |
|------|-----|
| Customer menu | http://YOUR_IP/ |
| Admin / cashier | http://YOUR_IP:8080/Cashier |

When you have domains, update `deploy/nginx-*.conf` and add SSL with certbot.

## Windows upload (optional)

### 1) Add SSH key on VPS (one time)
