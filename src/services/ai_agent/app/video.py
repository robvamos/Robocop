class VideoRelay:
    """Gestisce ingest video dal rover e relay verso app/dashboard.

    MVP: proxy MJPEG dal rover. Evoluzione: WebRTC con aiortc.
    """

    async def mjpeg_stream(self):
        raise NotImplementedError("MJPEG relay da implementare")
