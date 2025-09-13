def analyze_soil_and_climate(reading, sensor):
    """
    Analyzes a sensor reading and returns a structured event if a threshold is crossed.
    """
    if sensor.sensor_type == 'soil_moisture' and reading.value < 20:
        return {
            'type': 'low_moisture',
            'value': reading.value,
            'farm_id': sensor.farm_id
        }
    elif sensor.sensor_type == 'temperature' and reading.value > 35:
        return {
            'type': 'high_temperature',
            'value': reading.value,
            'farm_id': sensor.farm_id
        }
    return None # No event detected
