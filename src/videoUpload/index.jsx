import React, { useState, useEffect, useCallback } from 'react';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

function UppyVideoComponent({
  allowedExtensions = ['video/*'], // Default to video types
  fileSize,
}) {
  const [multiple, setMultiple] = useState(false);
  const [uppy, setUppy] = useState(null);
  const [uploadURLs, setUploadURLs] = useState([]);

  const uploadPath = 'https://tusd.tusdemo.net/files/';

  const configureUppy = useCallback(() => {
    const instance = new Uppy({
      restrictions: {
        maxNumberOfFiles: multiple ? null : 1,
        allowedFileTypes: allowedExtensions,
        maxFileSize: fileSize,
      }
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
  }, [multiple, allowedExtensions, fileSize, uploadPath]);

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
      {uppy && (
        <Dashboard
          uppy={uppy}
          proudlyDisplayPoweredByUppy={false}
        />
      )}
    </div>
  );
}

export default UppyVideoComponent;
