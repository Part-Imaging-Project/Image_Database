# For development(Strictly)

## Project Structure
.
├── uploadToBlob.js       # Handles Azure Blob uploads and saves metadata
├── postgresDb.js         # PostgreSQL connection and queries
├── watcher.js            # Watches folder and processes new images
├── server.js             # REST API server
├── .env                  # Environment variables
├── README.md

## prerequisites
Node.js (v18+)

Azure Subscription (with:

Blob Storage Account

PostgreSQL Flexible Server)

Environment variables set in .env file

## Installation
npm install

##  .env Configuration
# PostgreSQL
PG_HOST=your_postgres_host
PG_PORT=5432
PG_USER=your_username
PG_PASSWORD=your_password
PG_DATABASE=your_dbname

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=your_account_name
AZURE_STORAGE_KEY=your_account_key
AZURE_CONTAINER_NAME=image-testing

# Local folder to watch
WATCH_FOLDER=./watched_images
WATCH_INTERVAL=30


## Running the Watcher
Automatically uploads any new file in the WATCH_FOLDER to Azure Blob and saves metadata in PostgreSQL.

node watcher.js

## Running the Server
Launch the REST API server:

http://localhost:8000

## API endpoint
| Method | Route     | Description                    |
| ------ | --------- | ------------------------------ |
| GET    | `/`       | Welcome message                |
| GET    | `/images` | Fetch all image metadata       |
| POST   | `/upload` | Manually upload image metadata |


