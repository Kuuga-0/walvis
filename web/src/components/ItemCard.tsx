import { useState } from 'react';
import type { BookmarkItem } from '../lib/types';

interface Props {
  item: BookmarkItem;
  spaceName: string;
  spaceId?: string;
  onClick: () => void;
  onUpdate?: () => void;
  isLocalMode?: boolean;
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

export function ItemCard({ item, spaceName, spaceId, onClick, onUpdate, isLocalMode }: Props) {
  const [hovered, setHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const timeAgo = (() => {
    const diff = Date.now() - new Date(item.createdAt).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 7) return `${d}d ago`;
    if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
  })();

  const handleEditTags = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocalMode || !spaceId) return;

    const newTags = prompt('Edit tags (comma-separated):', item.tags.join(', '));
    if (newTags === null) return;

    const tags = newTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    try {
      const res = await fetch(`/api/local/spaces/${spaceId}/items/${item.id}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });
      if (res.ok && onUpdate) onUpdate();
    } catch (err) {
      alert('Failed to update tags');
    }
  };

  const handleEditNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocalMode || !spaceId) return;

    const newNote = prompt('Edit note:', item.notes || '');
    if (newNote === null) return;

    try {
      const res = await fetch(`/api/local/spaces/${spaceId}/items/${item.id}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNote }),
      });
      if (res.ok && onUpdate) onUpdate();
    } catch (err) {
      alert('Failed to update note');
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(0,200,255,0.06) 0%, rgba(0,100,255,0.03) 100%)'
          : 'var(--layer)',
        border: `1px solid ${hovered ? 'rgba(0,200,255,0.35)' : 'var(--rim)'}`,
        borderRadius: 10,
        padding: '18px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? '0 4px 20px rgba(0,200,255,0.12), 0 0 0 1px rgba(0,200,255,0.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {/* Top gradient accent */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: hovered ? 'linear-gradient(90deg, var(--glow), #0066ff)' : 'transparent',
        transition: 'background 0.3s',
      }} />

      {/* Local mode actions */}
      {isLocalMode && hovered && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          gap: 4,
          zIndex: 10,
        }}>
          <button
            onClick={handleEditTags}
            style={{
              background: 'rgba(0,200,255,0.1)',
              border: '1px solid rgba(0,200,255,0.3)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 11,
              color: 'var(--glow)',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)',
            }}
            title="Edit tags"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,200,255,0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,200,255,0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🏷
          </button>
          <button
            onClick={handleEditNote}
            style={{
              background: 'rgba(0,200,255,0.1)',
              border: '1px solid rgba(0,200,255,0.3)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 11,
              color: 'var(--glow)',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)',
            }}
            title="Edit note"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,200,255,0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,200,255,0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📝
          </button>
        </div>
      )}

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

      {/* Note indicator */}
      {item.notes && (
        <div style={{
          fontSize: 11,
          color: 'var(--amber)',
          background: 'rgba(245,166,35,0.1)',
          border: '1px solid rgba(245,166,35,0.2)',
          borderRadius: 4,
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span>📌</span>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{item.notes}</span>
        </div>
      )}

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
