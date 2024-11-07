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
CREATE DATABASE vitaledge_datalake;
\c vitaledge_datalake
CREATE EXTENSION IF NOT EXISTS timescaledb;

# To troubleshoot postgresql
brew services start postgresql@14
brew services list
lsof -i :5432
brew services restart postgresql@14
brew services stop postgresql@14
# Reinitialize PostgreSQL’s data directory
initdb /usr/local/var/postgresql@14
ls /usr/local/share/postgresql@14/extension/timescaledb.control
