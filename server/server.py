from flask import Flask, Response, make_response
from video_stream_handler import stream_handler
import logging
import cv2

# see line 398 of connectionpool.py:
logging.basicConfig(level=logging.DEBUG)

thetav = None

app = Flask(__name__, static_url_path='/public', static_folder='../')


@app.route('/video_feed')
def video_feed():
    cap = cv2.VideoCapture(0)
    # cap.set(3, 3840)
    # cap.set(4, 1920)

    return Response(stream_handler(cap), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(host='0.0.0.0', threaded=True)
