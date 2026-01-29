import React, { useState } from 'react';
import { parseFile } from '../utils/parseFile';
import { saveParticipants, clearParticipants, getParticipants } from '../utils/storage';


const AdminPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<{participants: any[]; errors: any[]}>({ participants: [], errors: [] });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [participants, setParticipants] = useState(getParticipants());
  const [inputKey, setInputKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setShowPreview(false);
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    try {
      const result = await parseFile(f);
      setParseResult(result);
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing file:', error);
      setParseResult({ participants: [], errors: [{ row: 0, message: `Error reading file: ${error}` }] });
      setShowPreview(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    saveParticipants(parseResult.participants);
    setParticipants(parseResult.participants);
    setSaved(true);
  };

  const handleClear = () => {
    clearParticipants();
    setParticipants([]);
    setParseResult({ participants: [], errors: [] });
    setFile(null);
    setSaved(false);
    setShowPreview(false);
    setInputKey(prev => prev + 1);
    setSearchQuery('');
  };

  const filteredParticipants = searchQuery.trim()
    ? parseResult.participants.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.n.toString().includes(searchQuery)
      )
    : parseResult.participants;

  const filteredSavedParticipants = searchQuery.trim()
    ? participants.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.n.toString().includes(searchQuery)
      )
    : participants;

  return (
    <div className="admin-page">
      <h1>Admin: Upload Participants</h1>
      <div style={{ marginBottom: 16 }}>
        <input
          key={inputKey}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFile}
          style={{ padding: '0.5em', fontSize: '1em' }}
        />
        {file && <div style={{ marginTop: 8, color: '#666' }}>Selected: {file.name}</div>}
      </div>
      {loading && <div>Parsing...</div>}
      {showPreview && (
        <div style={{ margin: '1em 0' }}>
          <div style={{ 
            fontSize: '1.3em', 
            fontWeight: 'bold',
            marginBottom: '1em',
            padding: '0.8em',
            borderRadius: '8px',
            background: parseResult.errors.length > 0 ? '#fff3cd' : '#d4edda',
            color: parseResult.errors.length > 0 ? '#856404' : '#155724'
          }}>
            ✓ Valid: {parseResult.participants.length} | 
            {parseResult.errors.length > 0 && ` ⚠️ Errors: ${parseResult.errors.length}`}
          </div>
          {parseResult.participants.length > 0 && (
            <div style={{ margin: '1em 0' }}>
              <input
                type="text"
                placeholder="Search by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7em',
                  fontSize: '1em',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  marginBottom: '1em'
                }}
              />
              {searchQuery && (
                <div style={{ marginBottom: '0.5em', color: '#666', fontSize: '0.9em' }}>
                  Found: {filteredParticipants.length} 
                  {filteredParticipants.length !== parseResult.participants.length && 
                    ` of ${parseResult.participants.length}`}
                </div>
              )}
            </div>
          )}
          {parseResult.participants.length > 0 && (
            <table style={{ margin: '1em auto', fontSize: '1.1em' }}>
              <thead>
                <tr><th>N</th><th>Name</th></tr>
              </thead>
              <tbody>
                {filteredParticipants.slice(0, 20).map((p, i) => (
                  <tr key={i}><td>{p.n}</td><td>{p.name}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          {searchQuery && filteredParticipants.length === 0 && (
            <div style={{ color: '#e53e3e', padding: '1em', background: '#fee', borderRadius: '8px', margin: '1em 0' }}>
              No participants found matching "{searchQuery}"
            </div>
          )}
          {parseResult.errors.length > 0 && (
            <div style={{ color: 'red', marginTop: 8 }}>
              <b>Errors ({parseResult.errors.length}):</b>
              <ul style={{ textAlign: 'left', maxHeight: 120, overflow: 'auto' }}>
                {parseResult.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>Row {e.row}: {e.message}</li>
                ))}
              </ul>
              {parseResult.errors.length > 10 && (
                <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                  ...and {parseResult.errors.length - 10} more errors
                </div>
              )}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <button
              onClick={handleSave}
              disabled={parseResult.participants.length === 0}
            >Save {parseResult.participants.length} valid participants</button>
            <button onClick={handleClear} style={{ background: '#e53e3e' }}>Clear all</button>
            {saved && <span style={{ color: 'green', marginLeft: 12 }}>✓ Saved!</span>}
            {parseResult.errors.length > 0 && !saved && (
              <div style={{ color: '#856404', marginTop: 12, fontSize: '0.95em', background: '#fff3cd', padding: '0.5em', borderRadius: '4px' }}>
                ℹ️ Rows with errors will be skipped. Only valid participants will be saved.
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{ marginTop: 32, borderTop: '2px solid #e2e8f0', paddingTop: 32 }}>
        <div style={{ 
          fontSize: '1.3em', 
          fontWeight: 'bold', 
          marginBottom: '1em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Saved Participants: {participants.length}</span>
          {participants.length > 0 && (
            <button 
              onClick={handleClear} 
              style={{ background: '#e53e3e', fontSize: '0.8em' }}
            >
              Clear all participants
            </button>
          )}
        </div>
        {participants.length > 0 && (
          <>
            <input
              type="text"
              placeholder="Search saved participants by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7em',
                fontSize: '1em',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                marginBottom: '1em'
              }}
            />
            {searchQuery && (
              <div style={{ marginBottom: '0.5em', color: '#666', fontSize: '0.9em' }}>
                Found: {filteredSavedParticipants.length} 
                {filteredSavedParticipants.length !== participants.length && 
                  ` of ${participants.length}`}
              </div>
            )}
            <table style={{ margin: '1em auto', fontSize: '1.1em', width: '100%' }}>
              <thead>
                <tr><th>N</th><th>Name</th></tr>
              </thead>
              <tbody>
                {filteredSavedParticipants.slice(0, 50).map((p, i) => (
                  <tr key={i}><td>{p.n}</td><td>{p.name}</td></tr>
                ))}
              </tbody>
            </table>
            {filteredSavedParticipants.length > 50 && (
              <div style={{ color: '#666', fontSize: '0.9em', marginTop: '0.5em' }}>
                Showing first 50 of {filteredSavedParticipants.length} results
              </div>
            )}
            {searchQuery && filteredSavedParticipants.length === 0 && (
              <div style={{ color: '#e53e3e', padding: '1em', background: '#fee', borderRadius: '8px', margin: '1em 0' }}>
                No participants found matching "{searchQuery}"
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
