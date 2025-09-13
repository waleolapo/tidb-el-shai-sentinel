# AI Architecture: Multi-Agent System

This document outlines the design for the multi-agent AI system that powers the Micro-Farm AI Monitor.

The system is designed as a pipeline of specialized agents, each responsible for a specific task. This modular approach allows for independent development, testing, and upgrading of each component.

## Agent Workflow

`Sensor Data -> Ingestion Agent -> [Plant Health Agent, Soil & Climate Agent] -> Recommendation Agent -> Notification Agent -> Farmer`

---

### 1. Ingestion Agent

*   **Role:** Data Reception & Validation
*   **Responsibilities:**
    *   Receives raw data from IoT devices (JSON payload with sensor readings and an optional image).
    *   Validates data types and format.
    *   Standardizes data (e.g., converting units).
    *   Stores the validated data in the TiDB database.
    *   Triggers the appropriate analysis agents.

### 2. Plant Health Agent (Vision AI)

*   **Role:** Image Analysis
*   **Input:** An image of a plant.
*   **Process:**
    *   Utilizes a computer vision model to analyze the image.
    *   Detects signs of disease, pest infestation, or nutrient deficiencies.
    *   For the hackathon, this can be simulated with a placeholder model that returns pre-defined results based on the input image.
*   **Output:** A JSON object with a health diagnosis (e.g., `{ "status": "disease", "type": "powdery_mildew", "confidence": 0.92 }`).

### 3. Soil & Climate Agent (Analytics AI)

*   **Role:** Environmental Analysis
*   **Input:** Time-series data of soil moisture, pH, temperature, and humidity from TiDB.
*   **Process:**
    *   Analyzes trends in the sensor data.
    *   Compares current conditions to optimal ranges for the specific crop.
    *   Uses predictive models (e.g., simple regression) to forecast near-term conditions like dehydration risk.
*   **Output:** A JSON object with an environmental report (e.g., `{ "soil_moisture": "low", "prediction": "dehydration_risk_high_24h" }`).

### 4. Recommendation Agent (Decision AI)

*   **Role:** Synthesizing Insights & Making Decisions
*   **Input:**
    *   Health diagnosis from the Plant Health Agent.
    *   Environmental report from the Soil & Climate Agent.
    *   Contextual data from TiDB (e.g., crop type, age, historical data).
*   **Process:**
    *   A core decision-making engine (initially rule-based).
    *   It synthesizes all inputs to determine the most critical issue and the best course of action.
    *   Example Rule: `IF soil_moisture IS "low" AND dehydration_risk IS "high" THEN generate_watering_recommendation()`.
*   **Output:** A structured recommendation object (e.g., `{ "action": "water", "details": "Your tomatoes need water. Water for 15 minutes in the next 2 hours.", "priority": "high" }`).

### 5. Notification Agent (Delivery)

*   **Role:** Communication
*   **Input:** The structured recommendation object.
*   **Process:**
    *   Formats the recommendation into a clear, human-readable message.
    *   Handles language translation if needed (future scope).
    *   Integrates with a messaging service (e.g., Twilio) to send the message via WhatsApp or SMS.
*   **Output:** A message sent to the farmer's registered phone number.
