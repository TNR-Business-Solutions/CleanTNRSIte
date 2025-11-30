#!/bin/bash
# Test Runner Script
# Runs tests in a loop until all pass

echo "Starting automated test suite..."
echo "Base URL: ${TEST_URL:-https://www.tnrbusinesssolutions.com}"
echo ""

# Set environment variables if not set
export TEST_URL=${TEST_URL:-https://www.tnrbusinesssolutions.com}
export HEADLESS=${HEADLESS:-true}
export ADMIN_PASSWORD=${ADMIN_PASSWORD:-TNR2024!}

# Run test suite
node test-runner-with-logs.js

echo ""
echo "Test suite completed. Check test-results-*.json files for details."

