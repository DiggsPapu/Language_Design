import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paper, Typography } from '@mui/material';

function FileDrop() {
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const handleDrop = (files) => {
    setAcceptedFiles(files);
    files.forEach((file) => console.log(file));
    // You can perform additional logic with the files here
  };
  const { getRootProps, getInputProps } = useDropzone({
    accept: '.yal',
    onDrop: handleDrop,
  });
  return (
    <div>
      <Paper elevation={3} {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <Typography variant="h6" gutterBottom>
          Drop yal files here
        </Typography>
      </Paper>
      <div>
        <Typography variant="subtitle1">Uploaded Files:</Typography>
        {acceptedFiles.length === 0 ? (
          <p>Ninguno</p>
        ) : (
          <ul>
            {acceptedFiles.map((file) => (
              <li key={file.path}>{file.path}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FileDrop;
