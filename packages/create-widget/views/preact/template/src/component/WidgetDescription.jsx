import { h } from 'preact'; // eslint-disable-line no-unused-vars

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
