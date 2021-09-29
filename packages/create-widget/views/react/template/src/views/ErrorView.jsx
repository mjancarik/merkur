export default function ErrorView({ error }) {
  return (
    <div className='merkur__error'>
      <h1>Status: {error.status}</h1>
      <h2>Message: {error.message}</h2>
      <pre>{error.stack}</pre>
    </div>
  );
}
