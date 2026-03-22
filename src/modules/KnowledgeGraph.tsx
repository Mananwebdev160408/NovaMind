/**
 * Module 7: Knowledge Graph (Stretch Goal)
 */

export function KnowledgeGraph() {
  return (
    <div className="module-container">
      <div className="module-header">
        <h2>🧩 Knowledge Graph</h2>
        <p>Visual map of your notes, documents, and meetings</p>
      </div>

      <div className="module-content">
        <div className="module-empty">
          <h3>Knowledge Graph Coming Soon</h3>
          <p>This module will visualize connections between your notes, documents, and meetings</p>
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Features planned:
          </p>
          <ul style={{ textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <li>Interactive node-based graph visualization</li>
            <li>AI-detected relationships between content</li>
            <li>Topic clusters and knowledge gaps</li>
            <li>Daily insights feed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
