def generate_recommendation(event, db, Recommendation):
    """
    Generates a Recommendation object based on a structured event.
    """
    if not event:
        return

    rec = None
    if event['type'] == 'low_moisture':
        rec = Recommendation(
            farm_id=event['farm_id'],
            message=f"Critical: Soil moisture is very low ({event['value']}%). Immediate watering required.",
            priority='high'
        )
    elif event['type'] == 'high_temperature':
        rec = Recommendation(
            farm_id=event['farm_id'],
            message=f"Warning: Temperature is high ({event['value']}°C). Check for plant stress.",
            priority='medium'
        )
    
    if rec:
        db.session.add(rec)
        db.session.commit()
