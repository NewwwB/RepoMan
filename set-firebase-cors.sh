#!/bin/bash

# Step 1: Set bucket name
BUCKET_NAME="repomain-e4977.appspot.com"

# Step 2: Create cors.json file
cat <<EOF > cors.json
[
  {
    "origin": ["http://localhost:3000"],
    "method": ["GET", "POST", "PUT"],
    "responseHeader": ["Content-Type", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
EOF

echo "✅ Created cors.json"

# Step 3: Apply the CORS config to the Firebase bucket
echo "⚙️  Setting CORS on bucket: $BUCKET_NAME"
gsutil cors set cors.json gs://$BUCKET_NAME

# Step 4: Confirm CORS was applied
echo "📋 Current CORS config:"
gsutil cors get gs://$BUCKET_NAME

echo "🎉 Done! Firebase Storage CORS configured."
