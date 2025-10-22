#!/bin/bash

# Spawn child processes for each script
node amazon-script.js &
node ebay-script.js &

# Wait for all child processes to finish
wait