import React, { useState, useEffect } from 'react';
import Confetti from './Confetti';

interface WinnerPopupProps {
  name: string;
  onClose: () => void;
  firstPrizeMode?: boolean;
}

const WinnerPopup: React.FC<WinnerPopupProps> = ({ name, onClose, firstPrizeMode = false }) => {
  const isFullscreen = !!document.fullscreenElement;
  const [displayName, setDisplayName] = useState(firstPrizeMode ? '' : name);
  
  useEffect(() => {
    if (!firstPrizeMode) {
      setDisplayName(name);
      return;
    }
    
    // Progressive reveal animation for first prize mode
    const len = name.length;
    
    // Step 1: Show first character (1500ms)
    setTimeout(() => {
      setDisplayName(name[0] + '?'.repeat(len - 1));
    }, 1500);
    
    // Step 2: Show last character (3500ms)
    setTimeout(() => {
      setDisplayName(name[0] + '?'.repeat(len - 2) + name[len - 1]);
    }, 3500);
    
    // Step 3: Reveal middle characters progressively (1000ms per char)
    const middleChars = len - 2;
    for (let i = 1; i < middleChars + 1; i++) {
      setTimeout(() => {
        let revealed = name.substring(0, i + 1);
        revealed += '?'.repeat(Math.max(0, len - i - 2));
        if (len > 1) revealed += name[len - 1];
        setDisplayName(revealed);
      }, 5500 + (i * 1000));
    }
    
    // Step 4: Show full name
    setTimeout(() => {
      setDisplayName(name);
    }, 5500 + (middleChars * 1000) + 1500);
  }, [name, firstPrizeMode]);
  
  return (
    <div className="winner-popup">
      <Confetti />
      <div className="popup-card" style={{
        minHeight: isFullscreen ? '65vh' : 'auto',
        maxHeight: isFullscreen ? '90vh' : '80vh',
        height: 'auto',
        padding: isFullscreen ? '3em 4em' : '2.5em 3em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.5em',
        overflow: 'visible',
        position: 'relative'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1em 0' }}>
          <div style={{ fontSize: isFullscreen ? '4em' : '3em', marginBottom: '0.3em' }}>🎊</div>
          <h2 style={{ 
            fontSize: isFullscreen ? '3em' : '1.8em',
            margin: 0,
            lineHeight: 1.3,
            marginBottom: '0.5em'
          }}>
            Congratulations
          </h2>
          <div style={{ 
            color: '#dc2626', 
            fontSize: isFullscreen ? '4.5em' : '2.5em',
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textShadow: '3px 3px 6px rgba(220,38,38,0.3)',
            margin: '0.5em 0',
            letterSpacing: firstPrizeMode ? '4px' : 'normal',
            transition: 'all 0.3s ease',
            wordBreak: 'break-word',
            padding: '0 0.2em'
          }}>
            {displayName}
          </div>
        </div>
        <div style={{ paddingTop: '1em' }}>
          <button 
            onClick={onClose}
            style={{ 
              fontSize: isFullscreen ? '1.8em' : '1.2em',
              padding: isFullscreen ? '0.8em 2em' : '0.7em 2.5em',
              border: 'none',
              borderRadius: '0.5em',
              background: '#2b6cb0',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(43, 108, 176, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerPopup;
