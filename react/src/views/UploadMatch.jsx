/* eslint-disable no-unused-vars */
import React from 'react'
import { useState } from "react";
import axiosClient from "../axios";

export default function UploadMatch() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);

  const handleFiles = (e) => setFiles([...e.target.files]);

  const handleSubmit = async () => {
    if (files.length === 0) return;
    const form = new FormData();
    files.forEach(f => form.append('images[]', f));
    const url = `/ocr`;
    try {
      const res = await axiosClient.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      alert('Error procesando OCR');
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFiles} />
      <button onClick={handleSubmit}>Procesar</button>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
