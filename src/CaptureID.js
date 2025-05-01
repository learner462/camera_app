/* CaptureID.js*/

import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import Modal from 'react-modal';
import axios from 'axios';
import './App.css';
import test_copy from './test_copy.jpg';

Modal.setAppElement('#root');

const CaptureID = () => {
  const [idType, setIdType] = useState("National ID");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [scanColor, setScanColor] = useState('red');
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [savingToDB, setSavingToDB] = useState(false);
  const [dbSavedMessage, setDbSavedMessage] = useState('');

  const [structuredData, setStructuredData] = useState(null);
  const [rawText, setRawText] = useState('');

  const overlayBoxRef = useRef(null);
  
  const handleTestImage = async () => {
    setLoading(true);
    const progressMessages = [
      "Running Image segmentation...",
      "Image Straightening...",
      "Text detection...",
      "Extracting text...",
      "Processing done!"
    ];
    
    let msgIndex = 0;
    setProgressMessage(progressMessages[msgIndex]);
    const intervalId = setInterval(() => {
      msgIndex++;
      if (msgIndex < progressMessages.length) {
        setProgressMessage(progressMessages[msgIndex]);
      }
    }, 40000);
    closeModal();
    
    try {
      const res = await axios.post('http://localhost:5000/process', {
        //filename: 'test.png',
        filename: test_copy,
        id_type: 'National ID',
      });
  
      const { structured_data } = res.data;
      setStructuredData(structured_data);
  
      // Show DB saving modal with forced delays
      setSavingToDB(true);
      setDbSavedMessage("Saving to Database...");

      setTimeout(() => {
        setDbSavedMessage("Records saved");
        setTimeout(() => {
          setSavingToDB(false);
          setDbSavedMessage('');
        }, 5000);
      }, 1000); 
  
    } catch (err) {
      console.error("Error:", err);
      setSuccessMessage("Failed to process image. Please try again.");
    } finally {
      clearInterval(intervalId);
      setLoading(false);
      setProgressMessage('');
    }
  };

  const [error, setError] = useState(null);

  // Webcam success callback (if it opens correctly)
  const onUserMedia = () => {
    console.log("Camera is opened successfully.");
  };

  // Webcam error callback (if there is an error)
  const onUserMediaError = (error) => {
    console.error("Error accessing the camera: ", error);
    setError("Failed to access the camera.");
    alert("Error accessing the camera: ", error);
  };
  
  const handleCapture = async () => {
    setLoading(true);
    const rawImage = webcamRef.current.getScreenshot();
    const imageSrc = await cropImageToIDSize(rawImage);
    setCapturedImage(null);
    setStructuredData(null);
    setRawText('');
    
    setSuccessMessage('');
    setLoading(true);
    

    const progressMessages = [
      "Downloading pre-trained models...",
      "Image segmentation...",
      "Text detection...",
      "Extracting text...",
      "Processing done!"
    ];

    let msgIndex = 0;
    setProgressMessage(progressMessages[msgIndex]);
    const intervalId = setInterval(() => {
      msgIndex++;
      if (msgIndex < progressMessages.length) {
        setProgressMessage(progressMessages[msgIndex]);
      }
    }, 30000);
  
    try {
      //const res = await axios.post('https://e07b-89-147-6-105.ngrok-free.app/upload', { 
      const res = await axios.post('http://localhost:5000/upload', {  // change this URLs to your ngrok given URL
        image: imageSrc,
        idType: idType,
      });
      const { filename } = res.data;
  
    //const imageUrl = `https://8c49-102-216-154-25.ngrok-free.app/images/${filename}`;
      const imageUrl = `http://localhost:5000/images/${filename}`; //change this URLs to your ngrok given URL
      setCapturedImage(imageUrl);
      setSuccessMessage("Image uploaded successfully!");
      closeModal();
      //const processRes = await axios.post('https://8c49-102-216-154-25.ngrok-free.app/process', {
      const processRes = await axios.post('http://localhost:5000/process', {     //change this URLs to your ngrok given URL
        filename: filename,
        id_type: idType,
      });

      const { structured_data } = processRes.data;

      //setStructuredData(structured_data);
      //setSavingToDB(true);
      //setDbSavedMessage("Saving to Database...");
      setTimeout(() => {
      //setDbSavedMessage("Records saved");
      setTimeout(() => {
        setSavingToDB(false);
        setDbSavedMessage('');
      }, 2000); 
    }, 4000);
    } catch (err) {
      console.error("Error:", err);
      setSuccessMessage("Failed to process image. Please try again.");
    }
    finally {
      clearInterval(intervalId);
      setLoading(false);
      setProgressMessage('');
    }
  };

  // const handleCapture = async () => {
  //   setLoading(true);
  //   const rawImage = webcamRef.current.getScreenshot();  // Capture the image (Base64 encoded string)
  //   const imageSrc = await cropImageToIDSize(rawImage);  // Optionally crop to a specific size
  //   setCapturedImage(imageSrc);  // Set the captured image for display
    
  //   // Reset other states
  //   setStructuredData(null);
  //   setRawText('');
  //   setSuccessMessage('');
  //   setLoading(true);
  
  //   // Show an alert with the captured image URI (Base64 format)
  //   alert(`Captured Image URI: ${imageSrc}`);
  
  //   const progressMessages = [
  //     "Downloading pre-trained models...",
  //     "Image segmentation...",
  //     "Text detection...",
  //     "Extracting text...",
  //     "Processing done!"
  //   ];
  
  //   let msgIndex = 0;
  //   setProgressMessage(progressMessages[msgIndex]);
  //   const intervalId = setInterval(() => {
  //     msgIndex++;
  //     if (msgIndex < progressMessages.length) {
  //       setProgressMessage(progressMessages[msgIndex]);
  //     }
  //   }, 30000);
  
  //   try {
  //     // Upload the captured image to your server
  //     const res = await axios.post('http://localhost:5000/upload', {
  //       image: imageSrc,
  //       idType: idType,
  //     });
  
  //     // Extract the filename from the server response
  //     const { filename } = res.data;
  //     const imageUrl = `http://localhost:5000/images/${filename}`; // Construct the URL for the uploaded image
  //     setCapturedImage(imageUrl);  // Set the captured image path (URL)
  //     setSuccessMessage("Image uploaded successfully!");
  //     closeModal();
  
  //     // Process the uploaded image
  //     const processRes = await axios.post('http://localhost:5000/process', {
  //       filename: filename,
  //       id_type: idType,
  //     });
  
  //     const { structured_data } = processRes.data;
  
  //     // Set structured data or perform other operations as needed
  //     setTimeout(() => {
  //       setSavingToDB(false);
  //       setDbSavedMessage('');
  //     }, 2000);
  //   } catch (err) {
  //     console.error("Error:", err);
  //     setSuccessMessage("Failed to process image. Please try again.");
  //   } finally {
  //     clearInterval(intervalId);
  //     setLoading(false);
  //     setProgressMessage('');
  //   }
  // };
  
  const openModal = () => {
    setModalIsOpen(true);
    const colorToggleInterval = () => {
      const randomTime = Math.floor(Math.random() * 8) + 1;
      setScanColor((prevColor) => (prevColor === 'red' ? 'green' : 'red')); 

      setTimeout(colorToggleInterval, randomTime * 1000);
    };

    colorToggleInterval();
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const cropImageToIDSize = (base64Image) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Image;
      img.onload = () => {
        const dpi = 96;
        const cmToPx = (cm) => (cm * dpi) / 2.54;

        const targetWidth = cmToPx(8.56); 
        const targetHeight = cmToPx(5.5); 

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        const sx = (img.width - targetWidth) / 2;
        const sy = (img.height - targetHeight) / 2;

        ctx.drawImage(img, sx, sy, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  };

  useEffect(() => {
    if (overlayBoxRef.current) {}
  }, [scanColor]);

  return (
    <div className="capture-container">
      <h1>Welcome to the ID Capture System</h1>

      <p>Select the type of ID to capture:</p>
      <select 
        onChange={(e) => setIdType(e.target.value)} 
        value={idType}
        className="id-select"
      >
        <option value="National ID">National ID</option>
        <option value="Residential ID">Residential ID</option>
        <option value="Driving License">Driving License</option>
        <option value="Vehicle Registration">Vehicle Registration</option>
      </select>

      <p>Please take a picture of the selected ID type.</p>

      <button onClick={openModal} className="capture-button">
        Take ID Photo
      </button>

      {successMessage && (
        <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>
          {successMessage}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '10px', fontStyle: 'italic' }}>{progressMessage}</p>
        </div>
      )}

      {capturedImage && (
        <div>
          <h3>Captured Image:</h3>
          <img src={capturedImage} alt="Captured ID" style={{ maxWidth: "400px", marginTop: "20px" }} />
        </div>
      )}

      {rawText && (
        <div style={{ marginTop: '20px' }}>
          <h3>Raw Text:</h3>
          <pre style={{ background: "#f1f1f1", padding: "10px", borderRadius: "5px" }}>
            {rawText}
          </pre>
        </div>
      )}

      {structuredData && (
        <div style={{ marginTop: '20px' }}>
          <h3>Structured Data:</h3>
          <pre style={{ background: "#e8f5e9", padding: "10px", borderRadius: "5px" }}>
            {JSON.stringify(structuredData, null, 2)}
          </pre>
        </div>
      )}

      {savingToDB && (
        <div className="db-popup">
          <div className="spinner"></div>
          <p>{dbSavedMessage}</p>
        </div>
      )}

      <Modal 
        isOpen={modalIsOpen} 
        onRequestClose={closeModal} 
        contentLabel="Capture ID Modal" 
        className="modal-container"
        overlayClassName="modal-overlay"
        appElement={document.getElementById('root')}
      >
        <h2>Capture Your {idType}</h2>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          playsInline
          videoConstraints={{
            facingMode: "environment",
          }}

          // videoConstraints={{
          //      facingMode: "user",
          //    }}
            
          onUserMedia={onUserMedia} // This is the success callback
          onUserMediaError={onUserMediaError} // This is the error callback
        />
        <div ref={overlayBoxRef} className="overlay-box">
          <div className={`scan-line ${scanColor}`}></div>
        </div>
        <button onClick={handleCapture} className="capture-btn">Capture</button>

        <button onClick={handleTestImage} className="capture-btn1">Test Capture</button>
        {/* <button onClick={{}} className="capture-btn1">Test Capture</button> */}
        <button onClick={closeModal} className="close-modal-btn">Close</button>

      </Modal>
    </div>
  );
};

export default CaptureID;
