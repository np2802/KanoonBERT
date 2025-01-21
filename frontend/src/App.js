import React, { useState } from 'react';
import Accordion from './components/Accordion/Accordion';
import SearchBar from './components/SearchBar/SearchBar';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

const App = () => {
  const [showAccordion, setShowAccordion] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleEnterKeyPress = (query) => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/response_query`, { params: { query } })
      .then(response => {
        setData(response.data);
        setShowAccordion(true);
      })
      .catch(error => {
        console.error('Error fetching FAQ data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUploadFile = (formData) => {
    setLoading(true);
    axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        setData(response.data);
        setShowAccordion(true);
      })
      .catch(error => {
        console.error('Error fetching FAQ data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className='container bg-gray-100 w-100'>
      <h1 className="text-4xl font-bold text-indigo-800 mt-3 mb-2 text-center">Indian Legal Semantic Searcher</h1>
      <div className="mx-auto w-3/5 p-4 rounded-lg">
        <SearchBar onEnterKeyPress={handleEnterKeyPress} handleUploadFile={handleUploadFile} />
        {loading ? ( 
          <div className="flex justify-center items-center mt-5">
            <ClipLoader color="#000000" css="margin-top: 20px;" size={50} />
          </div>
        ) : (
          showAccordion && <Accordion data={data} />
        )}
      </div>
    </div>
  );
};

export default App;
