import React from "react";

import "./Sample.css"; // Import external CSS for styling

const Sample= () => {
  return (
    <div className="faculty-layout">
      {/* Static Image */}
      <div className="image-container">
        <img 
          src="../../public/images/campus.webp" 
          alt="Faculty" 
          className="faculty-image"
        />
      </div>

    
    </div>
  );
};

export default Sample;