import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/item/$id')({
  validateSearch: (s: Record<string, unknown>) => ({ spaceId: s.spaceId as string | undefined }),
  component: ItemPage,
});

function ItemPage() {
  const navigate = useNavigate();

  return (
    <div style={{ animation: 'depth-fade 0.4s ease forwards' }}>
      <button
        onClick={() => navigate({ to: '/' })}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: 11, letterSpacing: '0.15em', cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        ← Back
      </button>
      <div style={{
        maxWidth: 700,
        color: 'var(--text-muted)',
        fontSize: 13,
        border: '1px solid var(--rim)',
        borderRadius: 8,
        padding: 24,
        background: 'var(--layer)',
      }}>
        Item detail — load spaces first from the home page.
      </div>
    </div>
  );
}
