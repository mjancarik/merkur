import { h } from 'preact'; // eslint-disable-line no-unused-vars

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
