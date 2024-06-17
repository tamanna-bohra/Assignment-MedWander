import React, { useState,useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const COUNTRY_CODES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  // Add more country codes as needed
];

const App = () => {
  const [formName, setFormName] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].value);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
  const storedData = localStorage.getItem('formData');
if (storedData) {
    const { name, countryCode, phoneNumber } = JSON.parse(storedData);
   setName(name);
       setCountryCode(countryCode);
     setPhoneNumber(phoneNumber);
  }
 }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form fields here
    if (!name || !/^[a-zA-Z]+$/.test(name)) {
      alert('Name is required and should only contain alphabetic characters');
      return;
    }
    if (!countryCode) {
      alert('Country code is required');
      return;
    }
    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) {
      alert('Phone number is required and should only contain numeric characters');
      return;
    }

    // Form is valid, submit the form data to the backend
    try {
      const response = await axios.post('http://localhost:8000/submit', {
        formType: formName === 'Form A' ? 'A' : 'B',
        name,
        countryCode,
        phoneNumber,
      });

      if (response.status === 200) {
        alert('Form data submitted successfully!');
        localStorage.setItem('formData', JSON.stringify({ name, countryCode, phoneNumber }));
        setName('');
        setCountryCode(COUNTRY_CODES[0].value);
        setPhoneNumber('');
      } else {
        alert('Failed to submit form data: ' + response.data.message);
        console.error('Error details:', response.data.error);
      }
    } catch (error) {
      alert('Error submitting form data');
      console.error('Network error:', error);
    }
  };

  // const handleRefresh = async () => {
  //   // Refresh the Excel sheet with new data from the backend
  //   try {
  //     const response = await axios.get('http://localhost:8000/refresh');
  //     if (response.status === 200) {
  //       alert('Excel sheet updated successfully!');
  //     } else {
  //       alert('Failed to update Excel sheet: ' + response.data.message);
  //       console.error('Error details:', response.data.error);
  //     }
  //   } catch (error) {
  //     alert('Error refreshing Excel sheet');
  //     console.error('Network error:', error);
  //   }
  // };
  const handleRefresh = async () => {
    try {
      const response = await axios.get('http://localhost:8000/refresh', {
        responseType: 'arraybuffer',
      });
  
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Form_Data.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error refreshing Excel sheet');
      console.error('Network error:', error);
    }
  };

  return (
    <div className='container'>
      <div className='buttoncontainer'>
      <button className='Btn' onClick={() => setFormName('Form A')}>Form A</button>
      <button className='Btn' onClick={() => setFormName('Form B')}>Form B</button>
      </div>
      <div className='formcont'>
      {formName && (
        <form onSubmit={handleSubmit}>
          <h1>{formName}</h1>
          <div className='fields'>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              pattern="[a-zA-Z]*"
              title="Name should only contain alphabetic characters"
              required
            />
          </label></div>
          <div className='fields'>
          <label>
            Country Code:
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              {COUNTRY_CODES.map((code) => (
                <option key={code.value} value={code.value}>
                  {code.label}
                </option>
              ))}
            </select>
          </label></div>
          <div className='fields'>
          <label>
            Phone Number:
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              pattern="[0-9]*"
              title="Phone number should only contain numeric characters"
              required
            />
          </label></div>
          <button type="submit" className='Btn'>Submit</button>
        </form>
        
      )}
      </div>
      <button onClick={handleRefresh} className='Btn'>Refresh</button>
    </div>
  );
};

export default App;
