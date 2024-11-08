# VitalEdge Data Aggregator

The **VitalEdge Data Aggregator** is a Node.js-based microservice that serves as a central data collection and normalization hub for the VitalEdge healthcare ecosystem. It ingests data from multiple sources—including IoT devices, HealthKit, genomics, and clinical data—normalizes it, and stores it in a PostgreSQL-based data lake for further analysis and insights.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Development and Testing](#development-and-testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Data Ingestion**: Ingests real-time data from IoT devices, HealthKit, and document-based clinical data.
- **Data Normalization and Validation**: Uses JOI for schema validation and normalizes data before storage.
- **Caching and Performance Optimization**: Caches frequently accessed data in Redis and uses materialized views in PostgreSQL.
- **Secure API Access**: Implements JWT-based authentication for secure data transfer.
- **Scalability**: Built to support high-frequency data ingestion with efficient storage and access layers.

---

## Architecture

The VitalEdge Data Aggregator is a **Node.js** microservice with the following architecture:

1. **Express API Layer**: Handles API requests and routes them to the appropriate services.
2. **Data Normalization and Validation**: Ensures that data is structured consistently across multiple sources.
3. **Database Layer**: Stores data in PostgreSQL with TimescaleDB for time-series management and caching in Redis for fast data retrieval.
4. **Security Layer**: Manages authentication and access control via JWT tokens.

---

## Technology Stack

- **Node.js + TypeScript**: Server and business logic.
- **Express**: REST API framework.
- **PostgreSQL + TimescaleDB**: Primary database for time-series data.
- **Redis**: Caching layer to improve data retrieval performance.
- **JWT**: Secure access and authentication.

---

## Installation

### Prerequisites

- **Node.js** (v14+)
- **PostgreSQL** with TimescaleDB extension (v14+)
- **Redis**
- **Docker** and **Docker Compose** (optional, for containerized setup)

### Clone the Repository

```bash
git clone https://github.com/vitaledge/data-aggregator.git
cd data-aggregator
```

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
Create a .env file at the root of the project and populate it with your configuration:

```plaintext
# Database Configuration
POSTGRES_URI=postgresql://<username>:<password>@localhost:5432/vitaledge_datalake

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_CACHE_TTL=300

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key

# Node Environment
NODE_ENV=development
PORT=3000
```

### Database Setup
1. **Initialize PostgreSQL with TimescaleDB**:
- Run SQL commands to create the database and necessary tables (see database.sql for schema details).

2. **Initialize Redis**:
- Start the Redis server using Docker or a local installation.

## Usage

## Running the Application
Start the server:

```bash
npm run start
```

The server will start on http://localhost:3000 by default.

### Testing API Endpoints
Use curl or Postman to interact with API endpoints. Example:

```bash
curl -X POST http://localhost:3000/api/iot-data \
-H "Authorization: Bearer <your_jwt_token>" \
-H "Content-Type: application/json" \
-d '{"device_id": "12345", "timestamp": "2023-12-01T10:00:00Z", "metrics": { "heart_rate": 72 }}'
```

## API Endpoints

### IoT Data Ingestion (`/api/iot-data`)
- **Method**: POST
- **Description**: Ingests real-time IoT data (e.g., heart rate, temperature) for a patient.
- **Request Body**:
```json
{
  "device_id": "12345",
  "timestamp": "2023-12-01T10:00:00Z",
  "metrics": {
    "heart_rate": 72,
    "temperature": 98.6
  }
}
```

### Document Data Ingestion (`/api/documents`)
- **Method**: POST
- **Description**: Ingests structured document data, including bloodwork and clinical notes.
- **Request Body**:
```json
{
  "patient_id": "1234",
  "type": "bloodwork",
  "parsedText": "Sample bloodwork text",
  "extractedFields": {
    "rbc_count": "4.5",
    "hemoglobin": "13.8"
  }
}
```

### Genomic Data Ingestion (`/api/genomics`)
- **Method**: POST
- **Description**: Ingests genomic data for personalized health insights.
- **Request Body**:
```json
{
  "patient_id": "1234",
  "snps": [
    { "rsId": "rs1234", "gene": "BRCA1", "impact": "high" }
  ]
}
```

## Development and Testing

### Run Tests
Run unit tests and integration tests:
```bash
npm run test
```

### Docker Setup
To run the aggregator and dependencies with Docker:
```bash
docker-compose up --build
```

### Code Linting
Run ESLint for code quality:
```bash
npm run lint
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository.
2. **Create a branch** for your feature or bug fix.
3. **Commit your changes** with clear messages.
4. **Open a pull request** to the main branch.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any questions or support, please contact samseatt@gmail.com.


