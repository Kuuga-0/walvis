import { useState } from 'react';
import type { Space } from '../lib/types';

interface Props {
  space: Space;
  onClick: () => void;
}

export function SpaceCard({ space, onClick }: Props) {
  const [hovered, setHovered] = useState(false);

  const lastUpdated = space.updatedAt
    ? new Date(space.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    : '—';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, var(--walrus-mint-faint) 0%, rgba(151, 240, 229, 0.03) 100%)'
          : 'var(--layer)',
        border: `1px solid ${hovered ? 'var(--walrus-mint-dim)' : 'var(--rim)'}`,
        borderRadius: 12,
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? '0 8px 32px rgba(151, 240, 229, 0.08)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: hovered
          ? 'linear-gradient(90deg, var(--walrus-mint-dim), var(--walrus-mint), var(--walrus-mint-dim))'
          : 'transparent',
        transition: 'background 0.3s',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '-0.02em',
          color: hovered ? 'var(--walrus-mint)' : 'var(--text)',
          margin: 0,
          transition: 'color 0.3s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {space.name}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 6,
          fontSize: 10,
          color: 'var(--text-dim)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          <span style={{
            color: space.walrusBlobId ? 'var(--walrus-mint)' : 'var(--text-dim)',
          }}>
            {space.walrusBlobId ? '● Synced' : '○ Local'}
          </span>
          <span>Updated {lastUpdated}</span>
        </div>
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 28,
        color: hovered ? 'var(--walrus-mint)' : 'var(--text-dim)',
        lineHeight: 1,
        transition: 'color 0.3s',
        flexShrink: 0,
      }}>
        {space.items.length}
      </div>
    </div>
  );
}
