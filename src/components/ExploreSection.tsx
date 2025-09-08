// src/components/ExploreSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import tarot from '../tarot.png';
import harmonyindex from '../harmonyindex.png';
import palm from '../palm.png';
import facescan from '../facescan.png';
import angel from '../vintage.png';

export const ExploreSection: React.FC = () => {
  const navigate = useNavigate();

  const items = [
    {
      title: "Tarot Reading",
      subtitle: "Love tarot reading for singles and couples",
      image: tarot,
      onClick: () => navigate('/card'),
      locked: false,
    },
    {
      title: "Harmony Index",
      subtitle: "Discover your true biological age and vitality",
      image: harmonyindex,
      onClick: () => navigate('/harmony'),
      locked: false,
    },
    {
      title: "Palmistry",
      subtitle: "Unlock insights and energy balance through the wisdom of your palms",
      image: palm,
      onClick: () => navigate('/palm'),
      locked: false,
    },
    // {
    //   title: "Face Scan",
    //   subtitle: "Face Scan for your spiritual journey",
    //   image: facescan,
    //   onClick: null,
    //   locked: true,
    // },
    // {
    //   title: "Angel Cards",
    //   subtitle: "Angel guidance for your spiritual journey",
    //   image: angel,
    //   onClick: null,
    //   locked: true,
    // },
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="mb-0"
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'white',
          }}
        >
          Explore
        </h2>
      </div>

      {/* Cards */}
      <div
        className="d-flex gap-3 overflow-auto pb-3"
        style={{
          scrollbarWidth: 'none',
          paddingBottom: '1rem',
        }}
      >
        <style>{`
          .overflow-auto::-webkit-scrollbar { display: none; }
        `}</style>

        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-4 overflow-hidden flex-shrink-0 position-relative"
            style={{
              width: '800px',
              height: '400px', // Fixed height for consistency
              backgroundColor: '#1e2123',
              cursor: item.onClick ? 'pointer' : 'default',
              transition: 'background-color 0.3s ease',
              position: 'relative',
            }}
            onClick={item.onClick || undefined}
            onMouseEnter={(e) => {
              if (item.onClick) {
                e.currentTarget.style.backgroundColor = '#2a2e30';
              }
            }}
            onMouseLeave={(e) => {
              if (item.onClick) {
                e.currentTarget.style.backgroundColor = '#1e2123';
              }
            }}
          >
            {/* Image */}
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
              }}
            />

            {/* Text Content */}
            <div className="p-3">
              <h3
                className="mb-1"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'white',
                }}
              >
                {item.title}
              </h3>
              <p
                className="mb-0"
                style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                }}
              >
                {item.subtitle}
              </p>
            </div>

            {/* 🔒 Lock Overlay for Locked Cards */}
            {item.locked && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 70%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  padding: '16px',
                  textAlign: 'center',
                  color: 'white',
                  zIndex: 10,
                }}
              >
                <i
                  className="bi bi-lock-fill"
                  style={{
                    fontSize: '2rem',
                    color: '#ccc',
                    marginBottom: '8px',
                  }}
                ></i>
                <p
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  Coming Soon
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreSection;