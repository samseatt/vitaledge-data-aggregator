# Steps to create the node.js typescript project with Express

cd ~/projects/vitaledge/data-aggregator

npm init -y
npm install express cors dotenv redis pg mongodb
npm install -D typescript ts-node @types/node @types/express @types/cors @types/redis @types/mongodb @types/pg
npx tsc --init
less tsconfig.json  # modified this file to fit project needs

# To initially set up project  directories and files
mkdir src src/config src/routes src/controllers src/services src/middleware src/utils
touch src/index.ts src/config/database.ts src/config/redis.ts

brew install redis
brew services start redis
redis-cli ping

# Data Lake deployment ...
brew install postgresql

cd ~
git clone https://github.com/timescale/timescaledb.git
cd timescaledb
git fetch --tags
git checkout 2.5.0
./bootstrap
cd build
make
sudo make install

vi /usr/local/var/postgresql@14/postgresql.conf
# port = 5432
# shared_preload_libraries = 'timescaledb'

brew services start postgresql

# Creating Data Lake Database
psql postgres
> CREATE DATABASE vitaledge_datalake;
> \c vitaledge_datalake
> CREATE EXTENSION IF NOT EXISTS timescaledb;

# To troubleshoot postgresql
brew services start postgresql@14
brew services list
lsof -i :5432
brew services restart postgresql@14
brew services stop postgresql@14
# Reinitialize PostgreSQL’s data directory
initdb /usr/local/var/postgresql@14
ls /usr/local/share/postgresql@14/extension/timescaledb.control

# Running / testing the server
npx ts-node src/index.ts

# Initial testing
curl -X POST http://localhost:3000/api/iot-data -H "Content-Type: application/json" -d '{"deviceId": "123", "timestamp": "2024-11-07T12:34:56Z", "metrics": {"heartRate": 72, "temperature": 98.6}}'
{"message":"IoT data ingested successfully","data":{"deviceId":"123","timestamp":"2024-11-07T12:34:56Z","metrics":{"heartRate":72,"temperature":98.6}}}

curl -X POST http://localhost:3000/api/healthkit -H "Content-Type: application/json" -d '{"userId": "456", "timestamp": "2024-11-07T12:34:56Z", "stepCount": 1000, "caloriesBurned": 200}'
{"message":"HealthKit data ingested successfully","data":{"userId":"456","timestamp":"2024-11-07T12:34:56Z","stepCount":1000,"caloriesBurned":200}}

curl -X POST http://localhost:3000/api/genomics -H "Content-Type: application/json" -d '{"patientId": "789", "snps": [{"rsId": "rs1234", "gene": "BRCA1", "impact": "high"}]}'
{"message":"Genomic data ingested successfully","data":{"patientId":"789","snps":[{"rsId":"rs1234","gene":"BRCA1","impact":"high"}]}}

curl -X POST http://localhost:3000/api/documents -H "Content-Type: application/json" -d '{"documentId": "doc789", "parsedText": "Sample document text", "extractedFields": {"condition": "hypertension"}}'
{"message":"Document data ingested successfully","data":{"documentId":"doc789","parsedText":"Sample document text","extractedFields":{"condition":"hypertension"}}}

# Start and view Redis
redis-cli
>   KEYS *
>   GET iot:123:2024-11-07T12:34:56Z

# PostgresSQL
psql -d vitaledge_datalake
    CREATE TABLE iot_data (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50),
        timestamp TIMESTAMPTZ NOT NULL,
        heart_rate INTEGER,
        temperature FLOAT
    );


    npm install joi @types/joi

CREATE TABLE bloodwork_catalog (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- Unique code for each bloodwork type
    name VARCHAR(100) NOT NULL,       -- Descriptive name for the bloodwork type
    unit VARCHAR(50)                  -- Unit of measurement (e.g., mg/dL, cells/μL)
);

-- Example entries
INSERT INTO bloodwork_catalog (code, name, unit) VALUES 
('RBC', 'Red Blood Cell Count', 'cells/μL'),
('HGB', 'Hemoglobin', 'g/dL'),
('CREA', 'Serum Creatinine', 'mg/dL');

CREATE TABLE bloodwork (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    bloodwork_type_id INT NOT NULL REFERENCES bloodwork_catalog(id),
    value FLOAT NOT NULL               -- Numeric value of the bloodwork result
);


