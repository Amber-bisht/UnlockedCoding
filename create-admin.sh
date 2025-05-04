#!/bin/bash
echo "Creating admin user..."
npx tsx server/scripts/create-admin-user.ts
echo "Done."