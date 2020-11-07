from sentinelhub import SHConfig

import os
import datetime
import numpy as np

import cv2

from sentinelhub import MimeType, CRS, BBox, SentinelHubRequest, SentinelHubDownloadClient, DataCollection, bbox_to_dimensions, DownloadRequest

# In case you put the credentials into the configuration file you can leave this unchanged

CLIENT_ID = 'cc3922e7-5784-476d-8b50-ee50cff215f5'
CLIENT_SECRET = 'FK+ChZ%&3(s&2{j^@Ijnyjv._PNW$&VCc4J/|CvA'

class SateliteProcessor:
    def __init__(self):
        self.config = SHConfig()

        if CLIENT_ID and CLIENT_SECRET:
            self.config.sh_client_id = CLIENT_ID
            self.config.sh_client_secret = CLIENT_SECRET

        if self.config.sh_client_id == '' or self.config.sh_client_secret == '':
            print("Warning! To use Sentinel Hub services, please provide the credentials (client ID and client secret).")

    def get_basic_eval_script(self):
        evalscript_true_color = """
            //VERSION=3

            function setup() {
                return {
                    input: [{
                        bands: ["B02", "B03", "B04"]
                    }],
                    output: {
                        bands: 3
                    }
                };
            }

            function evaluatePixel(sample) {
                return [3.5*sample.B04, 3.5*sample.B03, 3.5*sample.B02];
            }
        """

        return evalscript_true_color

    def get_image(self, coordinates, resolution, date_from, date_to):
        bbox = BBox(bbox=coordinates, crs=CRS.WGS84)
        size = bbox_to_dimensions(bbox, resolution=resolution)


        evalscript_true_color = self.get_basic_eval_script()

        request_true_color = SentinelHubRequest(
            evalscript=evalscript_true_color,
            input_data=[
                SentinelHubRequest.input_data(
                    data_collection=DataCollection.SENTINEL2_L1C,
                    time_interval=(date_from, date_to),
                )
            ],
            responses=[
                SentinelHubRequest.output_response('default', MimeType.PNG)
            ],
            bbox=bbox,
            size=size,
            config=self.config
        )

        true_color_imgs = request_true_color.get_data()

        image = true_color_imgs[0]

        return image
