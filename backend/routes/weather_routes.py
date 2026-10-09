import urllib.request
import urllib.parse
import json
from flask import Blueprint, request, jsonify

weather_bp = Blueprint('weather', __name__)

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

# Pre-defined representative agro-climatic corn regions for quick resolution
AGRICULTURAL_ZONES = [
    {
        "id": "central-zone",
        "name": "Central Zone (Nagpur / Vidarbha Belt)",
        "zone": "Central Zone",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "region": "Maharashtra, India"
    },
    {
        "id": "north-zone",
        "name": "North Zone (Karnal / Indo-Gangetic Plain)",
        "zone": "North Zone",
        "latitude": 29.6857,
        "longitude": 76.9905,
        "region": "Haryana, India"
    },
    {
        "id": "south-zone",
        "name": "South Zone (Davanagere / Deccan Plateau)",
        "zone": "South Zone",
        "latitude": 14.4644,
        "longitude": 75.9218,
        "region": "Karnataka, India"
    },
    {
        "id": "east-zone",
        "name": "East Zone (Purnia / Kosi Corn Belt)",
        "zone": "East Zone",
        "latitude": 25.7771,
        "longitude": 87.4753,
        "region": "Bihar, India"
    },
    {
        "id": "west-zone",
        "name": "West Zone (Chhatrapati Sambhajinagar)",
        "zone": "West Zone",
        "latitude": 19.8762,
        "longitude": 75.3433,
        "region": "Maharashtra, India"
    },
    {
        "id": "us-corn-belt",
        "name": "Corn Belt (Des Moines)",
        "zone": "North Zone",
        "latitude": 41.5868,
        "longitude": -93.6250,
        "region": "Iowa, United States"
    }
]

@weather_bp.route('/api/weather/agro-climate', methods=['GET'])
def get_agro_climatic_data():
    """
    Retrieves real-time agro-climatic weather data from Open-Meteo.
    Includes current 2m temperature, relative humidity, rain accumulation,
    10m wind speed, and modelled topsoil moisture (0-1 cm depth).
    """
    try:
        lat = float(request.args.get('latitude', 21.1458))
        lon = float(request.args.get('longitude', 79.0882))
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid latitude or longitude coordinates provided'}), 400

    query_params = {
        'latitude': f"{lat:.4f}",
        'longitude': f"{lon:.4f}",
        'current': 'temperature_2m,relative_humidity_2m,rain,wind_speed_10m',
        'hourly': 'soil_moisture_0_to_1cm',
        'timezone': 'auto'
    }

    url = f"{OPEN_METEO_FORECAST_URL}?{urllib.parse.urlencode(query_params)}"

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'CornPestAgroClimate/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status != 200:
                return jsonify({'error': f'Open-Meteo API responded with status {response.status}'}), 502
            raw_data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return jsonify({
            'error': f'Failed to contact Open-Meteo service: {str(e)}',
            'is_stale': True
        }), 502

    current = raw_data.get('current', {})
    hourly = raw_data.get('hourly', {})

    # Extract soil moisture matching current hour
    soil_moisture_val = 0.0
    hourly_timestamp = None
    curr_time_str = current.get('time', '')

    if curr_time_str and 'time' in hourly and 'soil_moisture_0_to_1cm' in hourly:
        times_list = hourly.get('time', [])
        values_list = hourly.get('soil_moisture_0_to_1cm', [])
        curr_hour = curr_time_str[:13] + ':00' if len(curr_time_str) >= 13 else curr_time_str

        idx = None
        if curr_hour in times_list:
            idx = times_list.index(curr_hour)
        elif len(times_list) > 0:
            idx = 0

        if idx is not None and idx < len(values_list):
            raw_sm = values_list[idx]
            if raw_sm is not None:
                # Open-Meteo soil moisture unit is m³/m³.
                # Convert volumetric water content to percentage (e.g. 0.285 m³/m³ = 28.5%).
                soil_moisture_val = round(float(raw_sm) * 100.0)
                hourly_timestamp = times_list[idx]

    return jsonify({
        'status': 'success',
        'latitude': raw_data.get('latitude', lat),
        'longitude': raw_data.get('longitude', lon),
        'elevation': round(raw_data.get('elevation')) if raw_data.get('elevation') is not None else None,
        'timezone': raw_data.get('timezone'),
        'timezone_abbreviation': raw_data.get('timezone_abbreviation'),
        'data_source': 'Open-Meteo ECMWF / Numerical Agro-Climatic Models',
        'is_live': True,
        'readings': {
            'temperature': {
                'value': round(current.get('temperature_2m')) if current.get('temperature_2m') is not None else None,
                'unit': '°C',
                'label': 'Ambient Temperature (2m)',
                'variable': 'temperature_2m'
            },
            'humidity': {
                'value': round(current.get('relative_humidity_2m')) if current.get('relative_humidity_2m') is not None else None,
                'unit': '%',
                'label': 'Relative Humidity (2m)',
                'variable': 'relative_humidity_2m'
            },
            'rainfall': {
                'value': round(current.get('rain', 0.0)),
                'unit': 'mm',
                'label': 'Precipitation Accumulation',
                'time_basis': 'Past 1-hour / current measurement interval',
                'variable': 'rain'
            },
            'soil_moisture': {
                'value': round(soil_moisture_val),
                'unit': '%',
                'label': 'Volumetric Soil Moisture',
                'measurement_depth': '0–1 cm topsoil',
                'model_type': 'ECMWF IFS / Land numerical land-surface model',
                'data_nature': 'Hourly modelled numerical reanalysis (Not a physical sensor)',
                'data_timestamp': hourly_timestamp or current.get('time'),
                'variable': 'soil_moisture_0_to_1cm'
            },
            'wind_speed': {
                'value': round(current.get('wind_speed_10m')) if current.get('wind_speed_10m') is not None else None,
                'unit': 'km/h',
                'label': 'Wind Velocity (10m)',
                'variable': 'wind_speed_10m'
            }
        },
        'timestamps': {
            'source_model_time': current.get('time'),
            'interval_seconds': current.get('interval', 900)
        }
    })

@weather_bp.route('/api/weather/zones', methods=['GET'])
def get_agricultural_zones():
    """Returns preset agro-climatic farming zones with latitude/longitude coordinates."""
    return jsonify({
        'zones': AGRICULTURAL_ZONES
    })

@weather_bp.route('/api/weather/search', methods=['GET'])
def search_locations():
    """Proxy for Open-Meteo geocoding search to find farm locations worldwide."""
    query = request.args.get('q', '').strip()
    if not query or len(query) < 2:
        return jsonify({'results': []})

    url = f"{OPEN_METEO_GEOCODING_URL}?{urllib.parse.urlencode({'name': query, 'count': 8, 'language': 'en', 'format': 'json'})}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'CornPestAgroClimate/1.0'})
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode('utf-8'))
            return jsonify({'results': data.get('results', [])})
    except Exception as e:
        return jsonify({'error': str(e), 'results': []}), 502

@weather_bp.route('/api/weather/reverse-geocode', methods=['GET'])
def reverse_geocode():
    """Reverse geocodes coordinates to obtain detailed administrative region and town names."""
    try:
        lat = float(request.args.get('lat', 0.0))
        lon = float(request.args.get('lon', 0.0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid latitude or longitude'}), 400

    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=14&addressdetails=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'CornPestAgroClimate/1.0 (kavin.corn.pest@agritech.org)'})
        with urllib.request.urlopen(req, timeout=6) as response:
            data = json.loads(response.read().decode('utf-8'))
            address = data.get('address', {})
            name_parts = [
                address.get('village') or address.get('town') or address.get('city') or address.get('county') or address.get('suburb'),
                address.get('state_district') or address.get('state'),
                address.get('country')
            ]
            clean_name = ', '.join([p for p in name_parts if p])
            return jsonify({
                'display_name': clean_name or data.get('display_name', f'Coordinates ({lat:.3f}, {lon:.3f})'),
                'address': address,
                'lat': lat,
                'lon': lon
            })
    except Exception:
        return jsonify({
            'display_name': f'Pinned Location ({lat:.3f}°, {lon:.3f}°)',
            'lat': lat,
            'lon': lon
        })

