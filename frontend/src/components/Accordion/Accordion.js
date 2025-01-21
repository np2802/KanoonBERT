import React, { useState } from 'react';

const Accordion = ({ data }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleAccordion = (index) => {
    setExpandedItems((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-6 py-4">
      <div className="divide-y divide-slate-200">
        {/* Accordion items */}
        {data.map((d, index) => (
          <div key={index} className="py-2">
            <h2>
              <button
                type="button"
                className="flex items-center justify-between w-full text-left font-semibold py-2"
                onClick={() => toggleAccordion(index)}
                aria-expanded={expandedItems[index]}
                aria-controls={`ds-text-${index}`}
              >
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                  {d.question}
                </a>
                <svg
                  className={`fill-indigo-500 shrink-0 ml-8 transform origin-center transition duration-200 ease-out ${expandedItems[index] ? 'rotate-90' : ''
                    }`}
                  width="16"
                  height="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect y="7" width="16" height="2" rx="1" />
                  <rect y="7" width="16" height="2" rx="1" />
                </svg>
              </button>
            </h2>
            <div
              id={`ds-text-${index}`}
              role="region"
              aria-labelledby={`ds-title-${index}`}
              className={`grid text-sm text-slate-600 overflow-hidden transition-all duration-300 ease-in-out ${expandedItems[index] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
              <div className="overflow-hidden">
                <p className="text-black">
                  {d.summary}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accordion;