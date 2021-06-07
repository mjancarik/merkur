export default function Welcome(widget) {
  return widget.$dependencies.wire(widget.props, ':welcome')`
    <div>
      <h1>
        <a href="https://github.com/mjancarik/merkur">MERKUR</a>
      </h1>
      <h2>
        a tiny extensible javascript library for front-end microservices
      </h2>
    </div>
  `;
}
