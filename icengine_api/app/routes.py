from app import app
from flask_httpauth import HTTPTokenAuth
from flask import request, send_file
from PIL import Image
from app.satelite_processor import SateliteProcessor
import urllib.parse
import os
import io
import cv2
import json



@app.route('/')
@app.route('/index')
def index():
    return "Hello!"


@app.route('/get_img')
def get_img():
    coordinates = request.args.get('coord')
    coordinates = [float(c) for c in coordinates.split("|")]

    resolution = request.args.get('res')
    resolution = int(resolution)

    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')

    satelite_processor = SateliteProcessor()
    img = satelite_processor.get_image(coordinates, resolution, date_from, date_to)

    img = Image.fromarray(img.astype('uint8'))
    file_object = io.BytesIO()
    img.save(file_object, 'PNG')
    file_object.seek(0)

    return send_file(file_object, mimetype='image/PNG')

@app.route('/get_snow_data')
def get_snow_data():
    coordinates = request.args.get('coord')
    coordinates = [float(c) for c in coordinates.split("|")]

    resolution = request.args.get('res')
    resolution = int(resolution)

    for_years = request.args.get('for_years')
    for_years = int(for_years)

    satelite_processor = SateliteProcessor()
    data = satelite_processor.driverFunction(coordinates, resolution, for_years)
    # print(data)

    return json.dumps(data)