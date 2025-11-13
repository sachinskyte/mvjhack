# Pin to IPFS Script
#
# Purpose: Bash script to pin files/directories to IPFS
#
# Contains:
# - File/directory validation
# - Pinata API upload
# - CID extraction
# - Metadata tagging
#
# Usage:
# ./scripts/pin-to-ipfs.sh <file_or_directory>
# Example: ./scripts/pin-to-ipfs.sh ./dist
#
# Functions:
# - validate_path(): Check if file/directory exists
# - upload_to_pinata(): Use Pinata API to pin
# - extract_cid(): Parse CID from response
# - save_cid(): Append CID to cids.json
#
# Script flow:
# 1. Validate input path exists
# 2. Read Pinata credentials from .env
# 3. Upload to Pinata using curl or pinata-sdk
# 4. Extract CID from response
# 5. Display CID and IPFS gateway URL
# 6. Optionally save CID to tracking file
#
# Environment variables required:
# - PINATA_API_KEY
# - PINATA_SECRET_KEY
#
# Output:
# - Console log with CID
# - IPFS gateway URL: https://gateway.pinata.cloud/ipfs/{CID}
# - Optional: cids.json with all pinned CIDs
#
# Example:
# CID: QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Gateway: https://gateway.pinata.cloud/ipfs/QmXXX...
#
# Error handling:
# - File not found
# - API key missing
# - Upload failure
# - Network errors
