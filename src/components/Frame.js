// src/components/Frame.js
import React from 'react';
import './Frame.css';

const Frame = ({ children }) => {
  return (
    <div className="frame">
      {children}
    </div>
  );
};

export default Frame;
