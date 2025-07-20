#!/bin/bash

# Simple Port Test for Raspberry Pi
cd /home/oliver/kiosk-app
echo "🧪 Simple Port Test"
echo "=================="

echo "Testing port 3000:"
curl -v http://localhost:3000 2>&1 | head -10

echo -e "\nTesting port 5000:"
curl -v http://localhost:5000 2>&1 | head -10

echo -e "\nWhat's actually running:"
ps aux | grep -E "(node|npm|chromium)" | grep -v grep

echo -e "\nPM2 processes:"
pm2 list

echo -e "\nNetwork connections:"
netstat -tln | grep -E ':(3000|5000)'
