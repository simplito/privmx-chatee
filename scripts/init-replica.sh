#!/bin/bash

sleep 5  # Give MongoDB some time to start

# mongodb service (important for Docker Compose)
MONGODB_HOST="mongo"

for i in {1..10}; do
  mongosh --host $MONGODB_HOST --port 27017 --eval "rs.initiate({ _id: 'rs0', members: [ { _id: 0, host: '$MONGODB_HOST:27017' } ] })"
  if [[ $? == 0 ]]; then
    echo "Replica set initialized successfully!"
    break  # Exit the loop if successful
  else
    echo "Replica set initialization failed. Retrying..."
    sleep 5
  fi
done

if [[ $? != 0 ]]; then
  echo "Replica set initialization failed after multiple retries."
  exit 1
fi