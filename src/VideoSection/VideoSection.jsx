import React from 'react';
import './VideoSection.css';

function VideoSection() {
  return (
    <div className="video-section">
      <video
        src="./images/tkr.mp4"
        autoPlay
        loop
        muted
        className="video"

      ></video>
    </div>
  );
}

export default VideoSection;