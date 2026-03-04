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
        background: hovered
          ? 'linear-gradient(135deg, rgba(0,200,255,0.08) 0%, rgba(0,100,255,0.04) 100%)'
          : 'var(--layer)',
        border: `1px solid ${hovered ? 'rgba(0,200,255,0.4)' : 'var(--rim)'}`,
        borderRadius: 12,
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? '0 8px 32px rgba(0,200,255,0.15), 0 0 0 1px rgba(0,200,255,0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: hovered
          ? 'linear-gradient(90deg, var(--glow), #0066ff, var(--glow))'
          : 'transparent',
        transition: 'background 0.3s',
      }} />

      {/* Background glow effect */}
      <div style={{
        position: 'absolute',
        bottom: -60,
        right: -60,
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: hovered
          ? 'radial-gradient(circle, rgba(0,200,255,0.12) 0%, transparent 70%)'
          : 'transparent',
        transition: 'background 0.4s',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '-0.02em',
            background: hovered
              ? 'linear-gradient(135deg, var(--glow), #0066ff)'
              : 'var(--text)',
            WebkitBackgroundClip: hovered ? 'text' : 'unset',
            WebkitTextFillColor: hovered ? 'transparent' : 'unset',
            backgroundClip: hovered ? 'text' : 'unset',
            margin: 0,
            transition: 'all 0.3s',
          }}>
            {space.name}
          </h3>
          {space.description && (
            <p style={{
              margin: '6px 0 0',
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}>
              {space.description}
            </p>
          )}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 32,
          background: hovered
            ? 'linear-gradient(135deg, var(--glow), #0066ff)'
            : 'var(--text-dim)',
          WebkitBackgroundClip: hovered ? 'text' : 'unset',
          WebkitTextFillColor: hovered ? 'transparent' : 'unset',
          backgroundClip: hovered ? 'text' : 'unset',
          lineHeight: 1,
          transition: 'all 0.3s',
          flexShrink: 0,
        }}>
          {space.items.length}
        </div>
      </div>

      {/* Fill bar with gradient */}
      <div style={{
        height: 3,
        background: 'rgba(0,200,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          width: `${fill}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--glow) 0%, #0066ff 100%)',
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 2,
          boxShadow: hovered ? '0 0 8px rgba(0,200,255,0.4)' : 'none',
        }} />
      </div>

      {/* Tags */}
      {topTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, position: 'relative', zIndex: 1 }}>
          {topTags.map(tag => (
            <span key={tag} style={{
              fontSize: 10,
              padding: '3px 8px',
              background: hovered ? 'rgba(0,200,255,0.12)' : 'rgba(0,200,255,0.06)',
              border: `1px solid ${hovered ? 'rgba(0,200,255,0.3)' : 'rgba(0,200,255,0.15)'}`,
              borderRadius: 4,
              color: hovered ? 'var(--glow)' : 'var(--text-muted)',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
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
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{
          color: space.walrusBlobId ? 'var(--glow)' : 'var(--text-dim)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {space.walrusBlobId ? '● Synced' : '○ Local'}
        </span>
        <span>Updated {lastUpdated}</span>
      </div>
    </div>
  );
}
