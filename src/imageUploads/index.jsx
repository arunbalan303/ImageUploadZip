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
  const [uploadURLs, setUploadURLs] = useState([]);

  const uploadPath = 'https://tusd.tusdemo.net/files/';
  const customLandscapeRatio = 864 / 355;

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
          aspectRatio: imageOrientation === 'square'
            ? 1
            : (imageOrientation === 'landscape'
              ? customLandscapeRatio
              : null),
          croppedFileType: 'image/jpeg',
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 1,
          cropBoxResizable: imageOrientation === 'any',
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
          cropSquare: false,
          cropWidescreen: false,
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
  }, [multiple, allowedExtensions, fileSize, imageOrientation, uploadPath, customLandscapeRatio]);

  useEffect(() => {
    const instance = configureUppy();

    let fileUploadPromises = [];

    // Capture URLs after all uploads complete
    instance.on('file-added', (file) => {
      fileUploadPromises.push(
        new Promise((resolve) => {
          instance.on('upload-success', (file, response) => {
            const uploadURL = response.uploadURL;
            resolve(uploadURL);
          });
        })
      );
    });

    instance.on('complete', () => {
      Promise.all(fileUploadPromises)
        .then((urls) => {
          console.log('All files uploaded successfully:', urls);
          setUploadURLs(urls); // Set the URLs when all files are uploaded
        })
        .catch((err) => {
          console.error('Error uploading files:', err);
        });
    });

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
        <label>
          <input
            type="radio"
            value="any"
            checked={imageOrientation === 'any'}
            onChange={handleOrientationChange}
          />
          Any
        </label>
      </div>
      {uppy && (
        <Dashboard
          uppy={uppy}
          plugins={['Webcam', 'ImageEditor']}
          proudlyDisplayPoweredByUppy={false}
          autoOpen={multiple ? false : 'imageEditor'}
        />
      )}
    </div>
  );
}

export default UppyComponent;
