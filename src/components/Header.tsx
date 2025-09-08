// src/components/Header.tsx
import React from 'react';
import headerBg from '../header-bg.png';

export const Header: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        backgroundImage: `url(${headerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Background Overlay for better text readability */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1
        }}
      />

      {/* Content Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 2,
          textAlign: 'center'
        }}
      >
        {/* Main Title */}
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '700',
            background: 'linear-gradient(90deg, #AAE127 0%, #00A2FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0',
            lineHeight: '1',
            letterSpacing: '-0.02em',
            textShadow: '0 0 20px rgba(170, 225, 39, 0.3)'
          }}
        >
          Eternal
        </h1>

        {/* How it works Button */}
        <button
          style={{
            backgroundColor: '#00b8f8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '24px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 184, 248, 0.3)',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0099d9';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 184, 248, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#00b8f8';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 184, 248, 0.3)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
        >
          How it works
        </button>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: '400',
            margin: '0'
          }}
        >
          Get started with
        </div>
      </div>

      {/* Additional gradient overlay for atmospheric effect */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'linear-gradient(180deg, rgba(0, 26, 60, 0.3) 0%, rgba(5, 5, 5, 0.6) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default Header;