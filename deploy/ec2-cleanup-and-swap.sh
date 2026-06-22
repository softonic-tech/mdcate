#!/usr/bin/env bash
set -euo pipefail

echo "==> Stopping containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true

echo "==> Pruning Docker (images, volumes, networks, build cache)..."
docker system prune -a --volumes -f
docker builder prune -a -f

SWAP_SIZE="${SWAP_SIZE:-4G}"
if ! sudo swapon --show | grep -q '/swapfile'; then
  echo "==> Creating ${SWAP_SIZE} swapfile..."
  sudo fallocate -l "${SWAP_SIZE}" /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  sudo sysctl vm.swappiness=10
  grep -q 'vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
else
  echo "==> Swap already configured, skipping."
fi

echo "==> Done."
free -h
echo ""
df -h /
echo ""
docker system df
