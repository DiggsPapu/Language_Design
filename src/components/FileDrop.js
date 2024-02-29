import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paper, Typography } from '@mui/material';
import { YalexAnalyzer } from '../YalexAnalyzer';

function FileDrop() {
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [combinedContent, setCombinedContent] = useState('');

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  };

  const handleDrop = async (files) => {
    const filesWithContent = [];
    let content = '';

    for (const file of files) {
      const fileContent = await readFileContent(file);
      filesWithContent.push({ ...file, content: fileContent });
      content += fileContent + '\n';  // Concatenate file contents
    }

    setAcceptedFiles(filesWithContent);
    setCombinedContent(content);
    let yalex = new YalexAnalyzer(content);
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
      <div>
        <Typography variant="subtitle1">Combined Content:</Typography>
        {combinedContent ? (
          <pre>{combinedContent}</pre>
        ) : (
          <p>No content yet</p>
        )}
      </div>
    </div>
  );
}

export default FileDrop;
