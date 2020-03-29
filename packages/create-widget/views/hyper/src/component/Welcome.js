export default function Welcome(widget) {
  return widget.$dependencies.wire(widget.props, ':welcome')`
    <h1>Welcome to <a href="https://github.com/mjancarik/merkur">MERKUR</a>,<br /> a javascript library for front-end microservices.</h1>
  `;
}
