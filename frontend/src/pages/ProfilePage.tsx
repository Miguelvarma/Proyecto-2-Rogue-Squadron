/**
 * ProfilePage.tsx — Perfil del jugador con edición de username
 */

import { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { playersApi } from '@/api/players';

export default function ProfilePage() {
  const { profile, refresh } = usePlayerStore();
  const { player } = useAuthStore();
  const [editing, setEditing]     = useState(false);
  const [username, setUsername]   = useState(profile?.username ?? player?.username ?? '');
  const [saving, setSaving]       = useState(false);
  const [feedback, setFeedback]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const displayName = profile?.username ?? player?.username ?? '…';
  const initial     = displayName.charAt(0).toUpperCase();

  async function handleSave() {
    if (!username.trim() || username === displayName) { setEditing(false); return; }
    setSaving(true);
    setFeedback(null);
    try {
      await playersApi.updateMe({ username: username.trim() });
      await refresh();
      setFeedback({ type: 'success', msg: 'Nombre actualizado exitosamente' });
      setEditing(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al actualizar el nombre';
      setFeedback({ type: 'error', msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">📜 Mi Pergamino</h1>
        <p className="page-subtitle">Tu historia en el Nexus</p>
      </div>

      <div className="nbv-divider"><span className="nbv-divider-icon">⚜</span></div>

      <div style={{ maxWidth: 600 }}>
        {/* Tarjeta de perfil */}
        <div className="nbv-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--arcane), var(--crimson))',
              border: '3px solid var(--gold-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'var(--gold-light)',
              boxShadow: '0 0 20px rgba(74,21,128,0.4)',
              flexShrink: 0,
            }}>{initial}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--parchment)', letterSpacing: '0.05em' }}>
                {displayName}
              </div>
              <div style={{ marginTop: '0.2rem' }}>
                <span className={`nbv-badge ${player?.role === 'ADMIN' ? 'nbv-badge-gold' : player?.role === 'MODERATOR' ? 'nbv-badge-arcane' : 'nbv-badge-gray'}`}>
                  {player?.role ?? 'PLAYER'}
                </span>
              </div>
            </div>
          </div>

          {/* Edición de username */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
              Nombre del Guerrero
            </label>
            {editing ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="nbv-input"
                  style={{ margin: 0, flex: 1 }}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  maxLength={20}
                  pattern="^[a-zA-Z0-9_]+$"
                />
                <button className="nbv-btn nbv-btn-primary" onClick={handleSave} disabled={saving} style={{ clipPath: 'none' }}>
                  {saving ? '…' : '✓'}
                </button>
                <button className="nbv-btn nbv-btn-ghost" onClick={() => { setEditing(false); setUsername(displayName); }} style={{ clipPath: 'none' }}>
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--parchment)' }}>{displayName}</span>
                <button className="nbv-btn nbv-btn-ghost" onClick={() => setEditing(true)} style={{ fontSize: '0.65rem', padding: '0.25rem 0.7rem', clipPath: 'none' }}>
                  Editar
                </button>
              </div>
            )}
          </div>

          {feedback && (
            <div className={`nbv-notif ${feedback.type === 'success' ? 'nbv-notif-success' : 'nbv-notif-error'}`}>
              <span className="nbv-notif-icon">{feedback.type === 'success' ? '✓' : '✗'}</span>
              <div><div className="nbv-notif-msg">{feedback.msg}</div></div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="nbv-card">
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem', opacity: 0.8 }}>
            Estadísticas del Guerrero
          </div>
          {[
            { label: 'Rango Global',   value: profile?.rank ? `#${profile.rank}` : 'Sin clasificar' },
            { label: 'Monedas de Oro', value: `✦ ${(profile?.gold ?? 0).toLocaleString()}` },
            { label: 'Puntos de XP',   value: (profile?.xp ?? 0).toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(200,134,10,0.08)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--parchment-dim)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)', fontSize: '0.82rem' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
