import React, { useState } from 'react';
import { X, Key, Check, Copy } from 'lucide-react';

export default function TokenModal({ isOpen, onClose, currentToken, onUpdateToken }) {
  const [tokenInput, setTokenInput] = useState(currentToken || '');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateToken(tokenInput);
        setMsg({ type: 'success', text: 'Api-Token updated in registry.' });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to update token.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error connecting to token endpoint.' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tokenInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="eink-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '24px 28px',
          background: 'var(--paper-card)',
          boxShadow: '8px 8px 0px var(--border-ink)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={18} />
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: 700, margin: 0 }}>
              Portal Api-Token Dispatch
            </h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--ink-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontFamily: 'var(--font-editorial)', fontSize: '0.95rem', color: 'var(--ink-muted)', marginBottom: '16px' }}>
          The <strong style={{ color: 'var(--ink-primary)' }}>Api-Token</strong> authorizes the live dispatch of timetable & attendance records from the CIT portal.
        </p>

        {msg && (
          <div
            className={`badge-eink ${msg.type === 'success' ? 'badge-forest' : 'badge-stamp'}`}
            style={{ width: '100%', padding: '8px 12px', marginBottom: '14px' }}
          >
            {msg.text}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '6px' }}>
            Active Session Token
          </label>
          <textarea
            rows={4}
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--paper-card-alt)',
              border: '1.5px solid var(--border-ink)',
              borderRadius: '2px',
              padding: '12px',
              color: 'var(--ink-primary)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button
            onClick={copyToClipboard}
            className="eink-pill"
            style={{ fontSize: '0.8rem' }}
          >
            {copied ? <Check size={14} style={{ color: 'var(--accent-forest)', marginRight: '4px' }} /> : <Copy size={14} style={{ marginRight: '4px' }} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              className="eink-pill"
              style={{ fontSize: '0.8rem', background: 'transparent' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="eink-pill"
              style={{ fontSize: '0.8rem', background: 'var(--ink-primary)', color: 'var(--paper-card)' }}
            >
              {saving ? 'Saving...' : 'Save Token'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
