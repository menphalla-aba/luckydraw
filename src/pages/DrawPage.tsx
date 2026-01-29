import React, { useState, useEffect } from 'react';
import WinnerPopup from '../components/WinnerPopup';
import { getParticipants, getWinners, saveWinner, getSettings, saveSettings } from '../utils/storage';


function exportWinnersCSV(winners: any[]) {
  const header = 'N,Name,PickedAt\n';
  const rows = winners.map(w => `${w.n},${w.name},${w.pickedAt}`);
  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'winners.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const DrawPage: React.FC = () => {
  const [participants, setParticipants] = useState(getParticipants());
  const [winners, setWinners] = useState(getWinners());
  const [settings, setSettings] = useState(getSettings());
  const [rolling, setRolling] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [winnerName, setWinnerName] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [firstPrizeMode, setFirstPrizeMode] = useState(false);
  const [revealedName, setRevealedName] = useState('');
  const [questionMarks, setQuestionMarks] = useState('???');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    // Refresh participants from localStorage on mount
    setParticipants(getParticipants());
    setWinners(getWinners());
  }, []);

  const eligible = settings.allowRepeatWinners
    ? participants
    : participants.filter(p => !winners.some(w => w.n === p.n));

  const startRolling = () => {
    if (rolling || eligible.length === 0) return;
    setRolling(true);
    setRevealedName('');
    let i = 0;
    const id = setInterval(() => {
      setCurrent(eligible[Math.floor(Math.random() * eligible.length)]);
      // Animate question marks in first prize mode
      if (firstPrizeMode) {
        const patterns = ['???', '■■■', '•••', '***', '▲▲▲', '◆◆◆'];
        setQuestionMarks(patterns[Math.floor(Math.random() * patterns.length)]);
      }
      i++;
    }, 70);
    setIntervalId(id);
  };

  const stopRolling = () => {
    if (!rolling || !current) return;
    clearInterval(intervalId);
    setIntervalId(null);
    
    // Gradual slowdown effect
    let speed = 70;
    let iterations = 0;
    const maxIterations = 10;
    
    const slowdown = () => {
      iterations++;
      const remaining = maxIterations - iterations;
      setCountdown(remaining);
      
      if (remaining === 0) {
        // Pick final winner at countdown 0
        let winner = eligible[Math.floor(Math.random() * eligible.length)];
        if (!settings.allowRepeatWinners && winners.some(w => w.n === winner.n)) {
          const left = eligible.filter(p => !winners.some(w => w.n === p.n));
          winner = left.length > 0 ? left[Math.floor(Math.random() * left.length)] : winner;
        }
        
        // Hide name in rolling box - show placeholder
        if (firstPrizeMode) {
          setCurrent({ name: '???' });
        } else {
          setCurrent(winner);
        }
        setRolling(false);
        
        // Show popup immediately for first prize mode, or after delay for normal mode
        const popupDelay = firstPrizeMode ? 300 : 800;
        setTimeout(() => {
          setCountdown(null);
          const picked = { ...winner, pickedAt: new Date().toISOString() };
          saveWinner(picked);
          setWinners([picked, ...winners]);
          setWinnerName(winner.name);
          setShowPopup(true);
        }, popupDelay);
      } else {
        // Continue rolling
        setCurrent(eligible[Math.floor(Math.random() * eligible.length)]);
        speed = speed + (iterations * 10);
        setTimeout(slowdown, speed);
      }
    };
    
    slowdown();
  };

  const resetRolling = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setRolling(false);
    setCurrent(null);
  };

  const handleToggleRepeat = () => {
    const newSettings = { ...settings, allowRepeatWinners: !settings.allowRepeatWinners };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleClearWinners = () => {
    setShowClearConfirm(true);
  };

  const confirmClearWinners = () => {
    localStorage.removeItem('winners');
    setWinners([]);
    setShowClearConfirm(false);
  };

  const handleRemoveWinner = (winnerToRemove: any) => {
    if (confirm(`Remove ${winnerToRemove.name} from winners list? They will be eligible to win again.`)) {
      const updatedWinners = winners.filter(w => w.n !== winnerToRemove.n || w.pickedAt !== winnerToRemove.pickedAt);
      localStorage.setItem('winners', JSON.stringify(updatedWinners));
      setWinners(updatedWinners);
    }
  };

  return (
    <div className="draw-page" style={{
      height: isFullscreen ? '100vh' : 'auto',
      display: isFullscreen ? 'flex' : 'block',
      flexDirection: isFullscreen ? 'column' : undefined,
      justifyContent: isFullscreen ? 'center' : undefined,
      padding: isFullscreen ? '1em' : undefined,
      overflow: isFullscreen ? 'hidden' : 'auto'
    }}>
      {!isFullscreen && <h1>Lucky Draw</h1>}
      {!isFullscreen && (
        <div style={{ margin: '1.5em 0' }}>
          <label style={{ fontSize: '1.1em', marginRight: '2em' }}>
            <input type="checkbox" checked={settings.allowRepeatWinners} onChange={handleToggleRepeat} />
            Allow repeat winners
          </label>
          <label style={{ fontSize: '1.1em' }}>
            <input 
              type="checkbox" 
              checked={firstPrizeMode} 
              onChange={(e) => setFirstPrizeMode(e.target.checked)}
              disabled={rolling}
            />
            🏆 First Prize Mode
          </label>
          <div style={{ marginTop: 8, fontSize: '0.9em', color: '#666' }}>
            Eligible: {eligible.length} | Total: {participants.length}
            {firstPrizeMode && <span style={{ color: '#dc2626', fontWeight: 'bold', marginLeft: 8 }}>• Progressive reveal enabled</span>}
          </div>
        </div>
      )}
      {countdown !== null && (
        <div style={{ textAlign: 'center', margin: isFullscreen ? '0.5em 0' : '2em 0' }}>
          {isFullscreen && firstPrizeMode && (
            <div style={{ 
              fontSize: '2em', 
              fontWeight: 'bold', 
              color: '#764ba2',
              marginBottom: '0.2em',
              textShadow: '2px 2px 4px rgba(118,75,162,0.3)'
            }}>
              🏆 First Prize Drawing...
            </div>
          )}
          <div className="countdown-number" style={{
            fontSize: isFullscreen ? '12em' : '5em',
            fontWeight: 'bold',
            color: '#e53e3e',
            textAlign: 'center',
            textShadow: isFullscreen ? '8px 8px 16px rgba(229,62,62,0.5)' : '4px 4px 8px rgba(229,62,62,0.4)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {countdown}
          </div>
        </div>
      )}
      {!(countdown !== null && firstPrizeMode) && (
        <div style={{ 
          fontSize: isFullscreen ? '4em' : '3.5em', 
          height: isFullscreen ? '2.5em' : '3em',
          margin: isFullscreen ? '0.3em 0' : '1em 0', 
          fontWeight: 'bold', 
          letterSpacing: firstPrizeMode && rolling ? 8 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: current ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f7f9fc',
          borderRadius: '16px',
          padding: '0.5em',
          color: current ? '#fff' : '#aaa',
          overflow: 'hidden',
          wordWrap: 'break-word',
          boxShadow: current ? '0 8px 24px rgba(102,126,234,0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          {current ? (firstPrizeMode && rolling ? questionMarks : current.name) : 'Click Start to begin'}
        </div>
      )}
      <div>
        <button 
          onClick={startRolling} 
          disabled={rolling || eligible.length === 0}
          style={{ 
            fontSize: isFullscreen ? '1.5em' : '1em', 
            padding: isFullscreen ? '0.8em 1.5em' : '0.6em 1.2em',
            background: '#2b6cb0',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5em',
            cursor: 'pointer'
          }}
        >
          Start
        </button>
        <button 
          onClick={stopRolling} 
          disabled={!rolling}
          style={{ 
            fontSize: isFullscreen ? '1.5em' : '1em', 
            padding: isFullscreen ? '0.8em 1.5em' : '0.6em 1.2em',
            background: '#2b6cb0',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5em',
            cursor: 'pointer'
          }}
        >
          Stop
        </button>
        {!rolling && !showPopup && (
          <button 
            onClick={resetRolling} 
            disabled={rolling && !intervalId}
            style={{ 
              fontSize: isFullscreen ? '1.5em' : '1em', 
              padding: isFullscreen ? '0.8em 1.5em' : '0.6em 1.2em',
              background: '#2b6cb0',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5em',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        )}
        {!rolling && !showPopup && (
          <button 
            onClick={toggleFullscreen}
            style={{ 
              marginLeft: 16, 
              fontSize: isFullscreen ? '1.5em' : '1em', 
              padding: isFullscreen ? '0.8em 1.5em' : '0.6em 1.2em',
              background: isFullscreen ? '#f59e0b' : '#4299e1',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5em',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
          </button>
        )}
      </div>
      
      {!rolling && !showPopup && !isFullscreen && (
        <div style={{ margin: '2em 0 1em', fontWeight: 'bold' }}>
          Winners ({winners.length})
          <button style={{ marginLeft: 16, fontSize: '1em', background: '#38a169' }} onClick={() => exportWinnersCSV(winners)} disabled={winners.length === 0}>Export winners</button>
          <button style={{ marginLeft: 8, fontSize: '1em', background: '#e53e3e' }} onClick={handleClearWinners} disabled={winners.length === 0}>Clear winners</button>
        </div>
      )}
      {!isFullscreen && (
        <ul style={{ listStyle: 'none', padding: 0, maxHeight: 200, overflow: 'auto', margin: '0 auto', textAlign: 'left' }}>
          {winners.map((w, i) => (
            <li key={i} style={{ margin: '0.5em 0', fontSize: '1.1em', background: '#f0f4f8', borderRadius: 8, padding: '0.5em 1em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>{w.name}</b> <span style={{ color: '#888', fontSize: '0.9em' }}>({new Date(w.pickedAt).toLocaleString()})</span>
              </div>
              <button 
                onClick={() => handleRemoveWinner(w)}
                style={{ 
                  background: '#f59e0b', 
                  fontSize: '0.85em', 
                  padding: '0.4em 0.8em',
                  margin: 0
                }}
                title="Remove from winners (mistake)"
              >
                Undo
              </button>
            </li>
          ))}
        </ul>
      )}
      
      {showPopup && (
        <WinnerPopup 
          name={winnerName} 
          onClose={() => {
            setShowPopup(false);
            setCurrent(null);
          }} 
          firstPrizeMode={firstPrizeMode} 
        />
      )}
      
      {showClearConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '2.5em 3em',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '0.3em' }}>⚠️</div>
            <h2 style={{
              fontSize: '1.8em',
              margin: '0.5em 0',
              color: '#1a202c'
            }}>
              Clear All Winners?
            </h2>
            <p style={{
              fontSize: '1.1em',
              color: '#666',
              margin: '1em 0 1.5em'
            }}>
              This will permanently remove all {winners.length} winner{winners.length !== 1 ? 's' : ''} from the list. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1em', justifyContent: 'center' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  fontSize: '1.1em',
                  padding: '0.7em 2em',
                  background: '#e2e8f0',
                  color: '#1a202c',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmClearWinners}
                style={{
                  fontSize: '1.1em',
                  padding: '0.7em 2em',
                  background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(229, 62, 62, 0.4)'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawPage;
