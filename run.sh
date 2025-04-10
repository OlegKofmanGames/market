#!/bin/bash

# Start the backend server
cd backend
./run.sh &

# Start the frontend development server
cd ../frontend
npm run dev 