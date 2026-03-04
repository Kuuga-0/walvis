import { useState } from 'react';
import type { Space } from '../lib/types';

interface Props {
  space: Space;
  onClick: () => void;
}

export function SpaceCard({ space, onClick }: Props) {
  const [hovered, setHovered] = useState(false);

  const topTags = [...new Set(space.items.flatMap(i => i.tags))].slice(0, 5);
  const lastUpdated = space.updatedAt
    ? new Date(space.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    : '—';

  const fill = Math.min(100, (space.items.length / 50) * 100);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--surface)' : 'var(--layer)',
        border: `1px solid ${hovered ? 'rgba(0,200,255,0.3)' : 'var(--rim)'}`,
        borderRadius: 10,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: hovered ? '0 0 30px rgba(0,200,255,0.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background depth effect */}
      <div style={{
        position: 'absolute',
        bottom: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: hovered
          ? 'radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%)'
          : 'transparent',
        transition: 'background 0.3s',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '-0.01em',
            color: hovered ? 'var(--glow)' : 'var(--text)',
            margin: 0,
            transition: 'color 0.2s',
          }}>
            {space.name}
          </h3>
          {space.description && (
            <p style={{
              margin: '4px 0 0',
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}>
              {space.description}
            </p>
          )}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 28,
          color: hovered ? 'var(--glow)' : 'var(--text-dim)',
          lineHeight: 1,
          transition: 'color 0.2s',
          flexShrink: 0,
        }}>
          {space.items.length}
        </div>
      </div>

      {/* Fill bar */}
      <div style={{
        height: 2,
        background: 'var(--rim)',
        borderRadius: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${fill}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--glow), rgba(0,200,255,0.4))',
          transition: 'width 0.4s ease',
          borderRadius: 1,
        }} />
      </div>

      {/* Tags */}
      {topTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {topTags.map(tag => (
            <span key={tag} style={{
              fontSize: 10,
              padding: '2px 7px',
              background: 'rgba(0,200,255,0.05)',
              border: '1px solid var(--rim)',
              borderRadius: 3,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 9,
        color: 'var(--text-dim)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        <span>{space.walrusBlobId ? '● Synced' : '○ Local'}</span>
        <span>Updated {lastUpdated}</span>
      </div>
    </div>
  );
}
