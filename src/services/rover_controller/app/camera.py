class CameraStream:
    """Stream video rover.

    MVP: MJPEG via libcamera/OpenCV. Evoluzione: RTSP/WebRTC tramite AI Agent.
    """

    async def mjpeg(self):
        raise NotImplementedError("MJPEG camera stream da implementare su Raspberry")
