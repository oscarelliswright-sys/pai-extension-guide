# VPS Setup

**Purpose:** Complete VPS configuration from scratch
**Estimated Time:** 45-90 minutes
**Difficulty:** Intermediate
**Last Updated:** February 4, 2026

---

## Table of Contents

1. [Initial VPS Access](#initial-vps-access)
2. [System Updates & Security](#system-updates--security)
3. [User Setup](#user-setup)
4. [Essential Software](#essential-software)
5. [Docker Installation](#docker-installation)
6. [Nextcloud Setup](#nextcloud-setup)
7. [Bun Runtime](#bun-runtime)
8. [Claude Code (Optional)](#claude-code-optional)
9. [Cron Jobs](#cron-jobs)
10. [Verification](#verification)

---

## Initial VPS Access

### Step 1: Get VPS Credentials

**From Hostinger (or your provider):**
- IP address (e.g., `123.45.67.89`)
- Root password (sent via email)
- SSH port (usually 22)

**Save these securely** (password manager recommended)

---

### Step 2: First SSH Connection

**On Mac/Linux:**
```bash
ssh root@YOUR_VPS_IP
```

**On Windows (PowerShell):**
```powershell
ssh root@YOUR_VPS_IP
```

**You'll see:**
```
The authenticity of host 'YOUR_VPS_IP' can't be established.
ECDSA key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no)?
```

**Type:** `yes` and press Enter

**Enter password:** Paste root password (right-click in terminal)

**Verification:**
```bash
# You should see a prompt like:
root@hostname:~#
```

---

### Step 3: Change Root Password

**Immediately change to a strong password:**
```bash
passwd root
```

**Enter new password twice** (won't show characters while typing)

**Verification:**
```bash
# Log out and log back in with new password
exit
ssh root@YOUR_VPS_IP
```

---

## System Updates & Security

### Step 1: Update System Packages

```bash
# Update package list
apt update

# Upgrade all packages (takes 5-10 minutes)
apt upgrade -y

# Remove unused packages
apt autoremove -y
```

**Verification:**
```bash
# Should show "0 upgraded, 0 newly installed"
apt update && apt list --upgradable
```

---

### Step 2: Set Timezone

```bash
# Set to your timezone (example: Europe/London)
timedatectl set-timezone Europe/London

# View available timezones:
timedatectl list-timezones | grep -i london

# Or for US Eastern:
timedatectl set-timezone America/New_York
```

**Verification:**
```bash
timedatectl
# Should show your timezone in "Time zone:" field
```

---

### Step 3: Set Hostname

```bash
# Replace 'pai-vps' with your preferred hostname
hostnamectl set-hostname pai-vps

# Edit hosts file
nano /etc/hosts
```

**Add this line after `127.0.0.1 localhost`:**
```
127.0.1.1 pai-vps
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Verification:**
```bash
hostname
# Should output: pai-vps
```

---

### Step 4: Configure Firewall

```bash
# Install UFW (Uncomplicated Firewall)
apt install ufw -y

# Allow SSH (CRITICAL: Do this BEFORE enabling firewall)
ufw allow 22/tcp

# Allow HTTPS (for Nextcloud)
ufw allow 443/tcp

# Enable firewall
ufw enable

# Say 'y' when prompted
```

**Verification:**
```bash
ufw status verbose

# Should show:
# Status: active
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

---

## User Setup

### Step 1: Create Ubuntu User

**Why:** PAI runs as `ubuntu` user (not root for security)

```bash
# Create user
adduser ubuntu

# Enter password (save this!)
# Enter full name: Oscar (or your name)
# Press Enter for other fields (can leave blank)
```

**Verification:**
```bash
# Check user was created
id ubuntu

# Should output: uid=1000(ubuntu) gid=1000(ubuntu) groups=1000(ubuntu)
```

---

### Step 2: Grant Sudo Privileges

```bash
# Add ubuntu to sudo group
usermod -aG sudo ubuntu

# Verify
groups ubuntu
# Should show: ubuntu : ubuntu sudo
```

**Verification:**
```bash
# Switch to ubuntu user
su - ubuntu

# Test sudo access
sudo whoami
# Should output: root

# Exit back to root
exit
```

---

### Step 3: Set Up SSH Key Authentication

**On your local machine (Mac/Linux/Windows PowerShell):**

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter for default location
# Enter passphrase (optional but recommended)

# Copy public key to clipboard:

# Mac:
cat ~/.ssh/id_ed25519.pub | pbcopy

# Linux:
cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard

# Windows PowerShell:
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
```

**Back on VPS as root:**

```bash
# Switch to ubuntu user
su - ubuntu

# Create .ssh directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Create authorized_keys file
nano ~/.ssh/authorized_keys
```

**Paste your public key** (right-click in terminal)

**Save:** `Ctrl+X`, `Y`, `Enter`

```bash
# Set permissions
chmod 600 ~/.ssh/authorized_keys

# Exit back to root
exit
```

**Verification (from local machine):**
```bash
# Should connect without password
ssh ubuntu@YOUR_VPS_IP

# You should now be logged in as ubuntu
ubuntu@pai-vps:~$
```

---

### Step 4: Disable Password Authentication (Optional but Recommended)

**On VPS as root:**

```bash
# Edit SSH config
nano /etc/ssh/sshd_config
```

**Find and change these lines:**
```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

**Save:** `Ctrl+X`, `Y`, `Enter`

```bash
# Restart SSH service
systemctl restart sshd
```

**Verification:**
```bash
# From local machine, try password login (should fail):
ssh root@YOUR_VPS_IP
# Should output: Permission denied (publickey)

# Key-based login should still work:
ssh ubuntu@YOUR_VPS_IP
# Should connect successfully
```

---

## Essential Software

### Step 1: Install Core Packages

**As ubuntu user on VPS:**

```bash
# Update package list
sudo apt update

# Install essential packages
sudo apt install -y \
  curl \
  wget \
  git \
  unzip \
  build-essential \
  ffmpeg \
  postgresql-client \
  ca-certificates \
  gnupg \
  lsb-release
```

**Verification:**
```bash
# Check installations
git --version
curl --version
ffmpeg -version
psql --version
```

---

### Step 2: Install Node.js (LTS)

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify
node --version
npm --version

# Should output: v20.x.x and 10.x.x
```

---

## Docker Installation

### Step 1: Install Docker

```bash
# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**Verification:**
```bash
sudo docker --version
# Should output: Docker version 24.x.x

sudo docker compose version
# Should output: Docker Compose version v2.x.x
```

---

### Step 2: Configure Docker for Ubuntu User

```bash
# Add ubuntu to docker group
sudo usermod -aG docker ubuntu

# Apply group changes (log out and back in)
exit
ssh ubuntu@YOUR_VPS_IP
```

**Verification:**
```bash
# Should work without sudo
docker ps
# Should output: CONTAINER ID   IMAGE ...  (empty list is fine)
```

---

## Nextcloud Setup

### Step 1: Create Directory Structure

```bash
# Create directories
sudo mkdir -p /opt/nextcloud/{data,config,apps}

# Set ownership
sudo chown -R www-data:www-data /opt/nextcloud/
```

---

### Step 2: Create Docker Compose File

```bash
# Create compose file
sudo nano /opt/nextcloud/docker-compose.yml
```

**Paste this configuration:**
```yaml
version: '3'

services:
  nextcloud:
    image: nextcloud:latest
    container_name: nextcloud
    restart: always
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - /opt/nextcloud/data:/var/www/html/data
      - /opt/nextcloud/config:/var/www/html/config
      - /opt/nextcloud/apps:/var/www/html/custom_apps
    environment:
      - NEXTCLOUD_ADMIN_USER=admin
      - NEXTCLOUD_ADMIN_PASSWORD=CHANGE_THIS_PASSWORD
      - NEXTCLOUD_TRUSTED_DOMAINS=YOUR_VPS_IP
      - OVERWRITEPROTOCOL=https
```

**Replace:**
- `CHANGE_THIS_PASSWORD` → Strong admin password
- `YOUR_VPS_IP` → Your VPS IP address

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### Step 3: Start Nextcloud

```bash
# Navigate to Nextcloud directory
cd /opt/nextcloud

# Start Nextcloud (takes 2-3 minutes first time)
sudo docker compose up -d

# Check status
sudo docker compose ps

# Should show:
# NAME        IMAGE              STATUS
# nextcloud   nextcloud:latest   Up X minutes
```

**Verification:**
```bash
# Check logs (wait for "ready to handle connections")
sudo docker compose logs -f nextcloud

# Press Ctrl+C to exit logs once you see "ready"
```

---

### Step 4: Access Nextcloud Web UI

**In browser:** `https://YOUR_VPS_IP`

**You'll see SSL warning** (expected, we'll fix later)
- Click "Advanced" → "Proceed to YOUR_VPS_IP"

**Create admin account:**
- Username: `admin`
- Password: (same as in docker-compose.yml)

**Skip all setup wizards** (click "Skip" or close)

---

### Step 5: Create PAI User in Nextcloud

**Via Web UI:**
1. Click profile icon (top right) → "Users"
2. Click "+ New user"
3. Username: `oscar` (or your name)
4. Display name: Oscar Wright
5. Password: (set a password)
6. Click "Create"

---

### Step 6: Create PARA Folder Structure

**Via Docker:**
```bash
# Run occ commands inside container
sudo docker exec -u www-data nextcloud php occ user:list
# Should show: oscar and admin

# Create folders for oscar user
sudo docker exec -u www-data nextcloud mkdir -p /var/www/html/data/oscar/files/Inbox
sudo docker exec -u www-data nextcloud mkdir -p /var/www/html/data/oscar/files/Projects
sudo docker exec -u www-data nextcloud mkdir -p /var/www/html/data/oscar/files/Areas
sudo docker exec -u www-data nextcloud mkdir -p /var/www/html/data/oscar/files/Resources
sudo docker exec -u www-data nextcloud mkdir -p /var/www/html/data/oscar/files/Archive
sudo docker exec -u www-data nextcloud mkdir -p /var/www/html/data/oscar/files/Recordings/Meetings

# Scan files to make Nextcloud aware
sudo docker exec -u www-data nextcloud php occ files:scan --path=/oscar/files
```

**Verification:**
```bash
# Via web UI
# Log out of admin, log in as oscar
# You should see: Inbox, Projects, Areas, Resources, Archive folders
```

---

### Step 7: Configure Nextcloud for PAI

```bash
# Set trusted domains
sudo docker exec -u www-data nextcloud php occ config:system:set trusted_domains 1 --value=YOUR_VPS_IP

# Enable app passwords (for API access)
sudo docker exec -u www-data nextcloud php occ config:system:set auth.bruteforce.protection.enabled --value=false --type=boolean

# Set default phone region (optional)
sudo docker exec -u www-data nextcloud php occ config:system:set default_phone_region --value=GB
```

---

## Bun Runtime

### Step 1: Install Bun

```bash
# Install Bun (TypeScript runtime)
curl -fsSL https://bun.sh/install | bash

# Add to PATH (append to ~/.bashrc)
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc

# Apply changes
source ~/.bashrc
```

**Verification:**
```bash
bun --version
# Should output: 1.x.x

which bun
# Should output: /home/ubuntu/.bun/bin/bun
```

---

### Step 2: Test Bun

```bash
# Create test script
echo 'console.log("Bun works!");' > test.ts

# Run with Bun
bun run test.ts
# Should output: Bun works!

# Clean up
rm test.ts
```

---

## Claude Code (Optional)

**Purpose:** Development environment for PAI customization

**Skip this if:** You only want to use PAI, not develop/customize it

### Step 1: Install Claude Code

```bash
# Download and install
curl -fsSL https://claude.ai/install.sh | bash

# Add to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Verification:**
```bash
claude --version
# Should output: 2.x.x

which claude
# Should output: /home/ubuntu/.local/bin/claude
```

---

### Step 2: Configure Claude Code

```bash
# Create .claude directory
mkdir -p ~/.claude/{context,MEMORY,skills,hooks,tools}

# Create global CLAUDE.md (PAI system instructions will go here later)
nano ~/.claude/CLAUDE.md
```

**Paste minimal config:**
```markdown
# PAI System

You are Kay, PAI assistant running on VPS.
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### Step 3: Create Persistent Session Script

```bash
# Create scripts directory
mkdir -p ~/.claude/scripts

# Create persistent wrapper
nano ~/.claude/scripts/claude-persistent.sh
```

**Paste this script:**
```bash
#!/bin/bash

# Add Claude to PATH (required for tmux sessions)
export PATH="$HOME/.local/bin:$PATH"

# Auto-resume previous session
claude --dangerously-skip-permissions --continue
```

**Save:** `Ctrl+X`, `Y`, `Enter`

```bash
# Make executable
chmod +x ~/.claude/scripts/claude-persistent.sh
```

---

### Step 4: Add Startup Menu to .bashrc

```bash
# Edit .bashrc
nano ~/.bashrc
```

**Add at the end:**
```bash
# PAI Startup Menu
if [[ $- == *i* ]] && [[ -z "$TMUX" ]] && [[ -z "$CLAUDE_SESSION" ]]; then
  echo "╔════════════════════════════════════════╗"
  echo "║         PAI Startup Menu               ║"
  echo "╠════════════════════════════════════════╣"
  echo "║  1) Claude Code (no tmux)              ║"
  echo "║  2) New tmux session (fresh start)     ║"
  echo "║  3) Resume tmux session (continue)     ║"
  echo "║  4) Shell only (no Claude)             ║"
  echo "╚════════════════════════════════════════╝"
  echo ""
  read -t 10 -p "Select option (1-4, default 1 in 10s): " choice
  choice=${choice:-1}

  case $choice in
    1)
      claude --dangerously-skip-permissions
      ;;
    2)
      tmux kill-session -t pai 2>/dev/null
      tmux new-session -s pai "$HOME/.claude/scripts/claude-persistent.sh"
      ;;
    3)
      tmux attach-session -t pai || echo "No session 'pai' found. Use option 2."
      ;;
    4)
      echo "Shell only mode"
      ;;
    *)
      echo "Invalid choice"
      ;;
  esac
fi
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## Cron Jobs

### Step 1: Create Automations Directory

```bash
# Create directory
mkdir -p ~/automations

# Create placeholder scripts (will implement later)
touch ~/automations/health-check.sh
touch ~/automations/security-audit.sh
touch ~/automations/rag-reindex.sh
touch ~/automations/extract-missed-learnings.sh
touch ~/automations/memory-maintenance.sh
touch ~/automations/meeting-check.sh

# Make executable
chmod +x ~/automations/*.sh
```

---

### Step 2: Set Up Git Auto-Sync

```bash
# Create sync script
nano ~/.claude/sync-to-github.sh
```

**Paste this script:**
```bash
#!/bin/bash
cd "$HOME/.claude"
git add -A
git diff --cached --quiet || git commit -m "Auto-sync"
git push origin main 2>/dev/null
```

**Save:** `Ctrl+X`, `Y`, `Enter`

```bash
# Make executable
chmod +x ~/.claude/sync-to-github.sh
```

---

### Step 3: Configure Crontab

```bash
# Edit crontab
crontab -e

# Choose nano as editor (option 1)
```

**Add these lines:**
```cron
# Git auto-sync (every 15 minutes)
*/15 * * * * /home/ubuntu/.claude/sync-to-github.sh

# Health check (daily at 2 AM, Mon-Sat)
0 2 * * 1-6 /home/ubuntu/automations/health-check.sh

# Security audit (weekly, Sunday 2 AM)
0 2 * * 0 /home/ubuntu/automations/security-audit.sh

# RAG reindex (daily at 3 AM)
0 3 * * * /home/ubuntu/automations/rag-reindex.sh

# Extract learnings (daily at 4 AM)
0 4 * * * /home/ubuntu/automations/extract-missed-learnings.sh

# Memory maintenance (weekly, Sunday 5 AM)
0 5 * * 0 /home/ubuntu/automations/memory-maintenance.sh

# Meeting processing (every 15 min, business hours Mon-Fri)
*/15 8-19 * * 1-5 /home/ubuntu/automations/meeting-check.sh
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Verification:**
```bash
# List crontab
crontab -l

# Should show all cron jobs
```

---

## Verification

### System Verification Checklist

**Run these commands to verify everything:**

```bash
# 1. System info
echo "=== System Info ==="
hostnamectl
echo ""

# 2. Users
echo "=== Users ==="
id ubuntu
groups ubuntu
echo ""

# 3. Firewall
echo "=== Firewall ==="
sudo ufw status
echo ""

# 4. Docker
echo "=== Docker ==="
docker --version
docker compose version
docker ps
echo ""

# 5. Nextcloud
echo "=== Nextcloud ==="
sudo docker exec -u www-data nextcloud php occ status
echo ""

# 6. Nextcloud folders
echo "=== Nextcloud Folders ==="
ls -la /opt/nextcloud/data/oscar/files/
echo ""

# 7. Software versions
echo "=== Software Versions ==="
node --version
npm --version
bun --version
git --version
psql --version
ffmpeg -version | head -1
echo ""

# 8. Claude Code (if installed)
echo "=== Claude Code ==="
if command -v claude &> /dev/null; then
  claude --version
else
  echo "Claude Code not installed (optional)"
fi
echo ""

# 9. Cron jobs
echo "=== Cron Jobs ==="
crontab -l | grep -v '^#' | grep -v '^$'
echo ""

# 10. SSH key
echo "=== SSH Key ==="
ls -la ~/.ssh/
echo ""

echo "✅ Verification complete!"
```

**Expected output:**
- Hostname: `pai-vps`
- User: `ubuntu` with `sudo` group
- Firewall: Active with ports 22, 443 open
- Docker: Running with Nextcloud container
- Nextcloud: `installed: true`, `version: 27.x.x`
- Folders: Inbox, Projects, Areas, Resources, Archive exist
- All software versions displayed
- Cron jobs listed (7 jobs)
- SSH key present in `~/.ssh/`

---

### Common Issues

**Issue: Nextcloud container won't start**

**Solution:**
```bash
# Check logs
sudo docker compose logs nextcloud

# If port 443 already in use:
sudo lsof -i :443
# Kill conflicting process or change port in docker-compose.yml
```

---

**Issue: Can't SSH with key**

**Solution:**
```bash
# Check permissions (on VPS)
ls -la ~/.ssh/
# Should show:
# drwx------ 2 ubuntu ubuntu  4096 ... .ssh
# -rw------- 1 ubuntu ubuntu   xxx ... authorized_keys

# Fix if wrong:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

**Issue: Bun command not found**

**Solution:**
```bash
# Re-add to PATH
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Or use full path:
/home/ubuntu/.bun/bin/bun --version
```

---

**Issue: Docker permission denied**

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker ubuntu

# Log out and back in
exit
ssh ubuntu@YOUR_VPS_IP

# Verify
docker ps
```

---

## Post-Setup Steps

**VPS setup complete!** ✅

**What's been configured:**
- ✅ Secure VPS with firewall
- ✅ Ubuntu user with sudo access
- ✅ SSH key authentication
- ✅ Docker and Docker Compose
- ✅ Nextcloud with PARA structure
- ✅ Bun TypeScript runtime
- ✅ Claude Code (optional)
- ✅ Cron job framework
- ✅ Essential software installed

**Next steps:**
1. **[Database Setup](database-setup.md)** - Initialize PostgreSQL
2. **[Notion Integration](notion-integration.md)** - Connect Notion databases
3. **[Telegram Bot Setup](telegram-bot-setup.md)** - Configure Telegram interface

**Save these credentials** (in password manager):
- VPS IP: _______________
- Ubuntu user password: _______________
- Nextcloud admin password: _______________
- Nextcloud oscar password: _______________

---

## Appendix: Complete Verification Script

**Save this as `verify-vps-setup.sh`:**

```bash
#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║     PAI VPS Setup Verification         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check command
check_command() {
  if command -v $1 &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 installed"
    return 0
  else
    echo -e "${RED}✗${NC} $1 not found"
    return 1
  fi
}

# Check essential software
echo "=== Essential Software ==="
check_command git
check_command curl
check_command docker
check_command bun
check_command psql
check_command ffmpeg
echo ""

# Check Docker
echo "=== Docker Status ==="
if docker ps &> /dev/null; then
  echo -e "${GREEN}✓${NC} Docker running"
  docker ps --format "table {{.Names}}\t{{.Status}}"
else
  echo -e "${RED}✗${NC} Docker not running or permission denied"
fi
echo ""

# Check Nextcloud
echo "=== Nextcloud Status ==="
if sudo docker exec nextcloud php occ status &> /dev/null; then
  echo -e "${GREEN}✓${NC} Nextcloud running"
  sudo docker exec -u www-data nextcloud php occ status
else
  echo -e "${RED}✗${NC} Nextcloud not running"
fi
echo ""

# Check folders
echo "=== PARA Folders ==="
for folder in Inbox Projects Areas Resources Archive; do
  if [ -d "/opt/nextcloud/data/oscar/files/$folder" ]; then
    echo -e "${GREEN}✓${NC} $folder exists"
  else
    echo -e "${RED}✗${NC} $folder missing"
  fi
done
echo ""

# Check cron
echo "=== Cron Jobs ==="
cron_count=$(crontab -l 2>/dev/null | grep -v '^#' | grep -v '^$' | wc -l)
if [ $cron_count -ge 6 ]; then
  echo -e "${GREEN}✓${NC} $cron_count cron jobs configured"
else
  echo -e "${RED}✗${NC} Only $cron_count cron jobs (expected 6+)"
fi
echo ""

# Check firewall
echo "=== Firewall ==="
if sudo ufw status | grep -q "Status: active"; then
  echo -e "${GREEN}✓${NC} Firewall active"
  sudo ufw status | grep -E '22|443'
else
  echo -e "${RED}✗${NC} Firewall not active"
fi
echo ""

# Check SSH key
echo "=== SSH Authentication ==="
if [ -f ~/.ssh/authorized_keys ]; then
  key_count=$(wc -l < ~/.ssh/authorized_keys)
  echo -e "${GREEN}✓${NC} SSH keys configured ($key_count key(s))"
else
  echo -e "${RED}✗${NC} No SSH keys found"
fi
echo ""

echo "╔════════════════════════════════════════╗"
echo "║     Verification Complete              ║"
echo "╚════════════════════════════════════════╝"
```

**Make executable and run:**
```bash
chmod +x verify-vps-setup.sh
./verify-vps-setup.sh
```

---

**VPS Ready!** Proceed to [Database Setup](database-setup.md).
