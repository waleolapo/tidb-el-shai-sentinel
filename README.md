# Micro-Farm AI Monitor 🌱

## Empowering Urban Farmers with AI-Driven Insights

![Micro-Farm AI Monitor Dashboard Screenshot (Placeholder)](./docs/dashboard_screenshot.png)
*(Placeholder for a dashboard screenshot)*

## Overview
The Micro-Farm AI Monitor is a low-cost, AI-powered solution designed to assist urban farmers. It integrates affordable IoT sensor data with intelligent AI analytics to monitor crucial environmental factors like soil moisture, temperature, and humidity. The system provides personalized, actionable recommendations to farmers, aiming to boost crop yield, prevent plant stress, and optimize water usage.

## Features
*   **IoT Data Ingestion:** Backend API to receive and store sensor readings (soil moisture, temperature).
*   **AI-Driven Recommendations:** A multi-agent system analyzes sensor data to detect potential issues (e.g., low soil moisture, high temperature) and generates actionable advice.
*   **Interactive Dashboard:** A modern web interface to visualize sensor data over time, display active recommendations, and provide a plant health search.
*   **Plant Health Search:** A local knowledge base allows farmers to search for symptoms or conditions and receive instant recommendations.
*   **Real-time Weather Data:** Integration with the OpenWeather API to display current weather conditions for a specified location.
*   **Automated Setup Script:** A convenient `run_app.sh` script to easily set up and launch both the backend and frontend.

## Technologies Used
*   **Backend:** Python, Flask, Flask-SQLAlchemy (SQLite), Flask-CORS, python-dotenv, Requests
*   **Frontend:** React, TypeScript, Bootstrap, Recharts
*   **Database:** SQLite (for local development/hackathon, easily migratable to TiDB Cloud)
*   **AI/Agents:** Custom Python modules for soil/climate analysis and recommendation generation.
*   **External APIs:** OpenWeatherMap API

## Multi-Agent System Architecture
The application employs a modular multi-agent system to process data and generate insights:
1.  **Ingestion Agent (Backend):** Receives raw sensor data via the `/api/ingest` endpoint.
2.  **Soil & Climate Agent (`soil_climate_agent.py`):** Analyzes sensor readings (e.g., soil moisture, temperature) against predefined thresholds to identify potential issues (events).
3.  **Recommendation Agent (`recommendation_agent.py`):** Takes identified events and generates specific, actionable recommendations for the farmer.
4.  **Notification Agent (Future):** Planned for sending recommendations via SMS/WhatsApp.

## Setup and Installation
To get the Micro-Farm AI Monitor up and running, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:waleolapo/tidb-el-shai-sentinel.git
    cd tidb-el-shai-sentinel
    ```

2.  **OpenWeather API Key:**
    *   Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api).
    *   Create a file named `.env` in the `backend/` directory.
    *   Add your API key to the `.env` file like this:
        ```
        OPENWEATHER_API_KEY='YOUR_OPENWEATHER_API_KEY'
        ```

3.  **Run the Application:**
    Execute the provided setup script from the project root directory:
    ```bash
    ./run_app.sh
    ```
    This script will:
    *   Create Python virtual environments and install dependencies.
    *   Install Node.js dependencies for the frontend.
    *   Start the Flask backend server on `http://127.0.0.1:5001`.
    *   Start the React frontend development server on `http://localhost:3000`.

4.  **Access the Dashboard:**
    Open your web browser and navigate to `http://localhost:3000`.

## Usage
*   **Dashboard:** View real-time sensor data, weather information, and active recommendations.
*   **Plant Health Search:** Use the search bar to query for plant conditions, symptoms, and recommendations from the local knowledge base.
*   **Ingest Sensor Data (Simulation):** You can simulate new sensor readings using `curl`:
    *   **Temperature:**
        ```bash
        curl -X POST http://127.0.0.1:5001/api/ingest \
        -H "Content-Type: application/json" \
        -d '{"sensor_id": 1, "value": 28.0}'
        ```
    *   **Soil Moisture (triggers high priority alert if < 20):**
        ```bash
        curl -X POST http://127.0.0.1:5001/api/ingest \
        -H "Content-Type: application/json" \
        -d '{"sensor_id": 2, "value": 15.0}'
        ```

## API Endpoints
*   `GET /`: Backend welcome message.
*   `POST /api/ingest`: Ingests new sensor readings. Triggers AI analysis.
*   `GET /api/readings`: Retrieves all sensor readings.
*   `GET /api/recommendations`: Retrieves all active recommendations.
*   `GET /api/weather?lat=<latitude>&lon=<longitude>`: Retrieves current weather data for a given location.

## Stopping the Application
To stop both the backend and frontend servers, you will need their Process IDs (PIDs). The `run_app.sh` script prints these PIDs when it starts. You can then use the `kill` command:

```bash
kill <BACKEND_PID> <FRONTEND_PID>
```
(e.g., `kill 12345 67890`)

## Future Enhancements
*   **SMS/WhatsApp Notifications:** Integrate Twilio to send recommendations directly to farmers.
*   **Advanced AI Agents:** Implement the Plant Health Agent (Vision AI) for image-based disease detection.
*   **User Authentication:** Secure the dashboard and API with user login.
*   **Multi-Farm Support:** Allow managing multiple farms and their respective sensors.
*   **Historical Data Analysis:** More sophisticated tools for analyzing long-term trends.
*   **TiDB Cloud Integration:** Migrate from SQLite to TiDB Cloud for a scalable, production-ready database solution.
