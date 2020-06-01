import React from 'react';

export default function MerkurIcon() {
  return (
    <div className="merkur__icon">
      <img
        src={`http://localhost:${CONFIG.server.port}/static/merkur-icon.png`}
        alt="Merkur"
      />
    </div>
  );
}
