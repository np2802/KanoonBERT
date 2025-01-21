import React, { useState } from 'react';
import { FaPlus, FaInfoCircle } from 'react-icons/fa'; // Import the plus and info icons

const SearchBar = ({ onEnterKeyPress, handleUploadFile }) => {
  const [query, setQuery] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (event) => {
    setQuery(event.target.value);
    setFileName('')
    adjustTextareaHeight(event.target);
  };

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight + 100) + 'px';
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFileName(selectedFile.name);
    setQuery('');
    const formData = new FormData();
    formData.append('file', selectedFile);
    handleUploadFile(formData);
  };

  const handleSubmit = () => {
    const wordCount = query.trim().split(/\s+/).length;
    if (wordCount < 10) {
      setError('Minimum 10 words required in the query.');
      return;
    }
    else {
      setError('');
    }
    onEnterKeyPress(query);
  };

  return (
    <div className="relative mb-4">
      <div className="relative">
        <div className="absolute bottom-0 left-0 flex items-center mb-4 mr-2">
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="relative w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center ml-2">
              <FaPlus className="text-indigo-500" />
            </div>
            <input
              type="file"
              id="file-input"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <div className="mt-2 ml-2">
            {fileName ? <p>{fileName}</p> : <p>Attach File</p>}
          </div>
        </div>
        <textarea
          placeholder="Enter your legal search query..."
          className="w-full mt-2 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500 resize-none shadow-md"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          style={{ minHeight: '120px' }}
        />
      </div>
      <div className="flex justify-start items-center mt-2">
        <div className="relative" onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)}>
          <div className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center ml-2">
            <FaInfoCircle className="text-gray-500" />
          </div>
        </div>
        {showInfo && (
          <div className="relative left-0 bottom-full ml-2 bg-white border border-gray-300 p-2 rounded shadow-md">
            <p className="text-sm text-gray-500">To ensure optimal results, please provide a detailed query with at least ten words. It enhances result accuracy.</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1 text-center">{error}</p>}
      <div className="flex justify-center items-center mt-2">
        <button
          className="mt-2 px-4 py-2 bg-indigo-500 text-white font-semibold rounded shadow-md flex justify-center items-center"
          onClick={handleSubmit}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
