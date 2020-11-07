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

    def get_vegetation_eval_script(self):
        evalscript_true_color = """
            //VERSION=3

            function setup() {
                return {
                    input: [{
                        bands: ["B08", "B04"]
                    }],
                    output: {
                        bands: 1
                    }
                };
            }

            function evaluatePixel(sample) {
                return [(sample.B08 - sample.B04)/(sample.B08 + sample.B04)];
            }
        """

        return evalscript_true_color

    def get_moisture_eval_script(self):
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

    def get_snow_eval_script(self):
        evalscript_true_color = """
            //VERSION=3

            function setup() {
                return {
                    input: [{
                        bands: ["B8A", "B11", "B08", "B04", "B03"]
                    }],
                    output: {
                        bands: 1
                    }
                };
            }

            function evaluatePixel(sample) {
                return [(0.4 * ((sample.B8A - sample.B11) / (sample.B8A + sample.B11)) + 0.6 * (1 - ((sample.B08 - sample.B04) / (sample.B08 + sample.B04)))) > 0.3 && sample.B03 > 0.3 ? 255 : 0];
            }
        """

        return evalscript_true_color

    def get_snow_eval_script1(self):
        evalscript_true_color = """
            //VERSION=3

            function setup() {
                return {
                    input: [{
                        bands: ["B03", "B11", "B08", "B04"]
                    }],
                    output: {
                        bands: 1
                    }
                };
            }

            function evaluatePixel(sample) {
                var NDSI = (sample.B03 - sample.B11) / (sample.B03 + sample.B11);
                var NDVI = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
                var gain = 2.5;

                function si(a) {
                    return (a>=0.4) ? 1 : (Math.abs(NDVI - 0.1) <= 0.025 ? 1 : 0);
                }

                function br(a) {
                    return a>0.3;
                }

                var v = si(NDSI) && br(sample.B03);

                return [v==1 ? 255 : 0];
            }
        """

        return evalscript_true_color

    def get_snow_mask_eval_script(self):
        evalscript_true_color = """
            //VERSION=3
            function setup() {
              return {
                input: ["B02", "B03", "B04", "SCL"],
                output: { bands: 1 }
              }
            }

            function evaluatePixel(sample) {
              if (sample.SCL == 11) {
                return [255]
              }
              return [0];
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
                    mosaicking_order='leastCC'
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

    def get_image_with_eval(self, coordinates, resolution, date_from, date_to, eval_mode='basic'):
        bbox = BBox(bbox=coordinates, crs=CRS.WGS84)
        size = bbox_to_dimensions(bbox, resolution=resolution)

        if eval_mode == 'basic':
            evalscript_true_color = self.get_basic_eval_script()

        if eval_mode == 'vegetation':
            evalscript_true_color = self.get_vegetation_eval_script()

        if eval_mode == 'moisture':
            evalscript_true_color = self.get_moisture_eval_script()

        if eval_mode == 'snow':
            evalscript_true_color = self.get_snow_eval_script()
        
        if eval_mode == 'snow1':
            evalscript_true_color = self.get_snow_eval_script1()

        if eval_mode == 'snow_mask':
            evalscript_true_color = self.get_snow_mask_eval_script()

        request_true_color = SentinelHubRequest(
            evalscript=evalscript_true_color,
            input_data=[
                SentinelHubRequest.input_data(
                    data_collection=DataCollection.SENTINEL2_L1C,
                    # data_collection=DataCollection.SENTINEL2_L2A,
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

def get_snow_percent(img):

    snow_pixels = np.count_nonzero(img == 255)

    return snow_pixels / (img.shape[0] * img.shape[1])


if __name__ == '__main__':
    sProcessor = SateliteProcessor()

    # img_b = sProcessor.get_image_with_eval([13.799858,46.358893,13.883886,46.390734], 30, '2020-10-1', '2020-10-30', eval_mode='basic')
    img_b = sProcessor.get_image_with_eval([13.1136347, 45.9360773, 14.4276034, 46.5124713], 80, '2020-2-1', '2020-2-28', eval_mode='basic')
    # img_s = sProcessor.get_image_with_eval([13.1136347, 45.9360773, 14.4276034, 46.5124713], 50, '2020-11-6', '2020-11-7', eval_mode='snow')
    # img_s = sProcessor.get_image_with_eval([13.799858,46.358893,13.883886,46.390734], 30, '2020-10-1', '2020-10-30', eval_mode='snow1')
    img_s = sProcessor.get_image_with_eval([13.1136347, 45.9360773, 14.4276034, 46.5124713], 80, '2020-2-1', '2020-2-28', eval_mode='snow1')
    # img_sm = sProcessor.get_image_with_eval([13.1136347, 45.9360773, 14.4276034, 46.5124713], 50, '2020-11-6', '2020-11-7', eval_mode='snow_mask')

    # img = sProcessor.get_image_with_eval([14.408617, 45.9740637, 14.755332, 46.1459968], 50, '2020-4-1', '2020-4-30', eval_mode='simple')
    # img = sProcessor.get_image_with_eval([14.408617, 45.9740637, 14.755332, 46.1459968], 50, '2020-4-1', '2020-4-30', eval_mode='vegetation')

    cv2.imshow('img', img_b)
    cv2.waitKey(0)

    print(get_snow_percent(img_s))

    cv2.imshow('img', img_s)
    cv2.waitKey(0)
    # cv2.imshow('img', img_sm)
    # cv2.waitKey(0)