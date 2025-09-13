import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Agent Imports
from agents.soil_climate_agent import analyze_soil_and_climate
from agents.recommendation_agent import generate_recommendation
from agents.weather_agent import get_weather_data

# --- App Initialization ---
app = Flask(__name__)
CORS(app)

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Models ---
class Farm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    sensors = db.relationship('Sensor', backref='farm', lazy=True)
    recommendations = db.relationship('Recommendation', backref='farm', lazy=True)

class Sensor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sensor_type = db.Column(db.String(50), nullable=False)
    farm_id = db.Column(db.Integer, db.ForeignKey('farm.id'), nullable=False)
    readings = db.relationship('SensorReading', backref='sensor', lazy=True)

class SensorReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensor.id'), nullable=False)

class Recommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500), nullable=False)
    priority = db.Column(db.String(50), nullable=False, default='medium')
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    farm_id = db.Column(db.Integer, db.ForeignKey('farm.id'), nullable=False)

# --- API Endpoints ---
@app.route('/')
def index():
    return "Hello from the Micro-Farm AI Monitor Backend!"

@app.route('/api/ingest', methods=['POST'])
def ingest_data():
    data = request.get_json()
    if not data or 'sensor_id' not in data or 'value' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    sensor = Sensor.query.get(data['sensor_id'])
    if not sensor:
        return jsonify({'error': 'Sensor not found'}), 404

    reading = SensorReading(sensor_id=sensor.id, value=data['value'])
    db.session.add(reading)
    db.session.commit()

    # --- Trigger Multi-Agent System ---
    # 1. Soil & Climate Agent analyzes the reading
    event = analyze_soil_and_climate(reading, sensor)
    
    # 2. Recommendation Agent generates a recommendation if there's an event
    if event:
        generate_recommendation(event, db, Recommendation)

    return jsonify({'message': 'Data ingested and analyzed'}), 201

@app.route('/api/readings', methods=['GET'])
def get_readings():
    query = db.session.query(
        SensorReading,
        Sensor.sensor_type,
        Farm.name.label('farm_name')
    ).join(Sensor, SensorReading.sensor_id == Sensor.id)     .join(Farm, Sensor.farm_id == Farm.id)

    # Get query parameters
    sensor_type = request.args.get('sensor_type')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    # Apply filters
    if sensor_type:
        query = query.filter(Sensor.sensor_type == sensor_type)
    
    if start_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str)
            query = query.filter(SensorReading.timestamp >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use ISO format.'}), 400

    if end_date_str:
        try:
            end_date = datetime.fromisoformat(end_date_str)
            query = query.filter(SensorReading.timestamp <= end_date)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use ISO format.'}), 400

    readings_data = query.order_by(SensorReading.timestamp.desc()).all()
    
    output = [{
        'id': r.SensorReading.id, 'value': r.SensorReading.value, 'timestamp': r.SensorReading.timestamp.isoformat(),
        'sensor_type': r.sensor_type, 'farm_name': r.farm_name
    } for r in readings_data]
    return jsonify(output)

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    recs = Recommendation.query.order_by(Recommendation.timestamp.desc()).all()
    output = [{
        'id': rec.id, 'message': rec.message, 'priority': rec.priority,
        'timestamp': rec.timestamp.isoformat(), 'farm_id': rec.farm_id
    } for rec in recs]
    return jsonify(output)

@app.route('/api/weather', methods=['GET'])
def get_weather():
    latitude = request.args.get('lat', type=float)
    longitude = request.args.get('lon', type=float)

    if latitude is None or longitude is None:
        return jsonify({'error': 'Latitude and longitude are required.'}), 400

    weather_data = get_weather_data(latitude, longitude)

    if weather_data:
        return jsonify(weather_data)
    else:
        return jsonify({'error': 'Could not retrieve weather data.'}), 500

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not Farm.query.first():
            print("Creating a dummy farm and sensor...")
            dummy_farm = Farm(name='My First Farm')
            db.session.add(dummy_farm)
            db.session.commit()
            temp_sensor = Sensor(sensor_type='temperature', farm_id=dummy_farm.id)
            moisture_sensor = Sensor(sensor_type='soil_moisture', farm_id=dummy_farm.id)
            db.session.add_all([temp_sensor, moisture_sensor])
            db.session.commit()
            print(f"Created Farm ID {dummy_farm.id}, Temp Sensor ID {temp_sensor.id}, Moisture Sensor ID {moisture_sensor.id}")
    app.run(debug=True, port=5001)