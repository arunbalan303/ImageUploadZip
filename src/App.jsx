import React from 'react';
import UppyComponent from './imageUploads/index'; 
import UppyVideoComponent from './videoUpload';
function App() {
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp']; 
  const allowedVideoTypes=['video/*'];
  const maxImageSize = 5 * 1024 * 1024; 
  const maxVideoSize = 100 * 1024 * 1024; 
  return (
    <div>
      <h1> Image Upload </h1>
      <UppyComponent 
        allowedExtensions={allowedFileTypes}
        fileSize={maxImageSize}
      />
       

      <h1> Video Upload </h1>
      <UppyVideoComponent
        allowedExtensions={allowedVideoTypes}
        fileSize={maxVideoSize}
      />

    </div>
  );
}

export default App;
