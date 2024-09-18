import React, { useState, useEffect, useCallback } from 'react';
import Uppy from '@uppy/core';
import Webcam from '@uppy/webcam';
import ImageEditor from '@uppy/image-editor';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import '@uppy/image-editor/dist/style.min.css';

function UppyComponent({
  allowedExtensions = [],
  fileSize,
}) {
  const [multiple, setMultiple] = useState(false); 
  const [imageOrientation, setImageOrientation] = useState('square');
  const [uppy, setUppy] = useState(null);

  const uploadPath = 'https://tusd.tusdemo.net/files/';

  const configureUppy = useCallback(() => {
    const instance = new Uppy({
      restrictions: {
        maxNumberOfFiles: multiple ? null : 1,
        allowedFileTypes: allowedExtensions.length > 0 ? allowedExtensions : null,
        maxFileSize: fileSize,
      }
    })
      .use(Webcam)
      .use(ImageEditor, {
        cropperOptions: {
          aspectRatio: imageOrientation === 'square' ? 1 : (imageOrientation === 'landscape' ? 16 / 9 : null),
          croppedFileType: 'image/jpeg',
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 1,
          cropBoxResizable: false,
          cropBoxMovable: true,
          zoomable: true,
          rotatable: false,
        },
        actions: {
          revert: false,
          rotate: false,
          granularRotate: false,
          flip: false,
          zoomIn: false,
          zoomOut: false,
          cropSquare: imageOrientation === 'square',
          cropWidescreen: imageOrientation === 'landscape',
          cropWidescreenVertical: false,
        },
      })
      .use(Tus, {
        endpoint: uploadPath,
        fieldName: 'file',
        formData: true,
        headers: {
          Authorization: 'Bearer your-token-here',
          Accept: 'application/json',
        },
      });

    return instance;
  }, [multiple, allowedExtensions, fileSize, imageOrientation, uploadPath]);

  useEffect(() => {
    const instance = configureUppy();
    setUppy(instance);

    return () => {
      instance.cancelAll(); // Cancel any ongoing uploads
    };
  }, [configureUppy]);

  const handleOrientationChange = (e) => {
    setImageOrientation(e.target.value);
  };

  const handleMultipleChange = (e) => {
    setMultiple(e.target.checked);
  };

  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={multiple}
            onChange={handleMultipleChange}
          />
          Allow multiple files
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="square"
            checked={imageOrientation === 'square'}
            onChange={handleOrientationChange}
          />
          Square
        </label>
        <label>
          <input
            type="radio"
            value="landscape"
            checked={imageOrientation === 'landscape'}
            onChange={handleOrientationChange}
          />
          Landscape
        </label>
      </div>
      {uppy && (
        <Dashboard 
          uppy={uppy}
          plugins={['Webcam', 'ImageEditor']}
          proudlyDisplayPoweredByUppy={false}
          autoOpen="imageEditor" 
        />
      )}
    </div>
  );
}

export default UppyComponent;
