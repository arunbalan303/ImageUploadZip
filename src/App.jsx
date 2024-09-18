import React from 'react';
import UppyComponent from './videoUpload/index.jsx'; 
function App() {
  const allowedFileTypes = ['video/*']; 
  const maxFileSize = 5 * 1024 * 1024; 
  return (
    <div>
      <h1>File Upload Example</h1>
      <UppyComponent 
        allowedExtensions={allowedFileTypes}
        fileSize={maxFileSize}
      />
    </div>
  );
}

export default App;
