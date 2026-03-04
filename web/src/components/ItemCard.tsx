import { useState } from 'react';
import type { BookmarkItem } from '../lib/types';

interface Props {
  item: BookmarkItem;
  spaceName: string;
  onClick: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  link: '🔗',
  text: '📝',
  image: '🖼',
  note: '📌',
};

const SOURCE_COLORS: Record<string, string> = {
  telegram: '#229ed9',
  web: '#00c8ff',
  manual: '#f5a623',
};

export function ItemCard({ item, spaceName, onClick }: Props) {
  const [hovered, setHovered] = useState(false);

  const timeAgo = (() => {
    const diff = Date.now() - new Date(item.createdAt).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 7) return `${d}d ago`;
    if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
  })();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--surface)' : 'var(--layer)',
        border: `1px solid ${hovered ? 'rgba(0,200,255,0.25)' : 'var(--rim)'}`,
        borderRadius: 8,
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: hovered ? '0 0 20px rgba(0,200,255,0.06)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line on hover */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: hovered ? 'linear-gradient(90deg, var(--glow), transparent)' : 'transparent',
        transition: 'background 0.3s',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
          {TYPE_ICONS[item.type] ?? '📌'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 14,
            color: hovered ? '#fff' : 'var(--text)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.2s',
          }}>
            {item.title}
          </div>
          {item.url && (
            <div style={{
              fontSize: 10,
              color: 'var(--text-dim)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: 2,
            }}>
              {(() => {
                try { return new URL(item.url).hostname.replace('www.', ''); }
                catch { return item.url.slice(0, 40); }
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <p style={{
        fontSize: 12,
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        margin: 0,
      }}>
        {item.summary}
      </p>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {item.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: 10,
              padding: '2px 7px',
              background: 'var(--glow-faint)',
              border: '1px solid rgba(0,200,255,0.15)',
              borderRadius: 3,
              color: 'var(--glow)',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-data)',
            }}>
              #{tag}
            </span>
          ))}
          {item.tags.length > 4 && (
            <span style={{ fontSize: 10, color: 'var(--text-dim)', padding: '2px 4px' }}>
              +{item.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingTop: 4,
        borderTop: '1px solid var(--rim)',
      }}>
        <span style={{
          fontSize: 9,
          letterSpacing: '0.1em',
          color: SOURCE_COLORS[item.source] ?? 'var(--text-dim)',
          textTransform: 'uppercase',
        }}>
          {item.source}
        </span>
        <span style={{
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.05em',
        }}>
          {spaceName} · {timeAgo}
        </span>
      </div>
    </div>
  );
}
