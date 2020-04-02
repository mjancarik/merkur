import { h } from 'preact';

export default function ViewDescription({ name, version }) {
  return (
    <p>
      The widget&apos;s name is{' '}
      <strong>
        {name}@{version}
      </strong>
      .
    </p>
  );
}
