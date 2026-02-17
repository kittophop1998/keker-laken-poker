#!/bin/bash

# Script to kill process running on port 3002
PORT=3002

echo "Finding process on port $PORT..."
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "No process found on port $PORT"
else
  echo "Killing process $PID on port $PORT..."
  kill -9 $PID
  echo "Process killed successfully!"
fi
