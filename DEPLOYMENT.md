# 🐳 Docker Deployment Guide

## การ Build และ Run ด้วย Docker

### วิธีที่ 1: ใช้ Docker Compose (แนะนำ)

```bash
# Build และ run
docker-compose up -d

# ดู logs
docker-compose logs -f

# หยุด
docker-compose down
```

### วิธีที่ 2: ใช้ Docker คำสั่งโดยตรง

```bash
# Build image
docker build -t kaker-poker .

# Run container
docker run -d -p 3000:3000 --name kaker-poker-game kaker-poker

# ดู logs
docker logs -f kaker-poker-game

# หยุด
docker stop kaker-poker-game
docker rm kaker-poker-game
```

## การเข้าถึง

หลังจาก deploy แล้ว เกมจะรันที่:
- `http://localhost:3000` (local)
- `http://<YOUR_SERVER_IP>:3000` (server)

## การ Deploy บน Server

### 1. Upload โปรเจคขึ้น Server

```bash
# ใช้ git
git clone <your-repo>
cd kaker_poker

# หรือใช้ scp
scp -r kaker_poker user@server:/path/to/deploy/
```

### 2. Build และ Run บน Server

```bash
# เข้าไปใน server
ssh user@server

# เข้าไปใน directory
cd /path/to/deploy/kaker_poker

# Build และ run
docker-compose up -d
```

### 3. เปิด Port บน Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 3000

# หรือใช้ iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## ข้อกำหนดของ Server

- Docker Engine 20.10+
- Docker Compose 2.0+
- RAM: อย่างน้อย 512MB
- Disk: อย่างน้อย 1GB

## การอัพเดท

```bash
# Pull code ใหม่
git pull

# Rebuild และ restart
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### ถ้า Port 3000 ถูกใช้แล้ว

แก้ไขใน `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # เปลี่ยนจาก 3000 เป็น 8080
```

### ดู logs เพื่อ debug

```bash
docker-compose logs -f kaker-poker
```

### เข้าไปใน container

```bash
docker exec -it kaker-poker-game sh
```

## Production Tips

1. **ใช้ Reverse Proxy (Nginx/Caddy)** สำหรับ HTTPS
2. **ตั้งค่า Resource Limits** ใน docker-compose.yml
3. **ใช้ Health Checks** เพื่อ auto-restart
4. **Backup** ถ้ามีการเก็บข้อมูล

## ตัวอย่าง docker-compose.yml แบบเต็ม

```yaml
version: '3.8'

services:
  kaker-poker:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    container_name: kaker-poker-game
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```
