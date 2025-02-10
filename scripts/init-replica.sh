#!/bin/bash

# Wait for MongoDB to be ready (optional but recommended)
sleep 5  # Give MongoDB some time to start

# Get the hostname of the mongodb service (important for Docker Compose)
MONGODB_HOST=mongo

# Attempt to initialize the replica set.  Retry a few times in case MongoDB isn't fully up yet.
for i in {1..10}; do #retry up to 10 times
  mongosh --host $MONGODB_HOST --eval "rs.initiate({ _id: 'rs0', members: [ { _id: 0, host: '$MONGODB_HOST' } ] })"
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