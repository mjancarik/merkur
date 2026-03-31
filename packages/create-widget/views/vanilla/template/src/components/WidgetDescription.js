import { escHtml } from '../utils';

export default function ViewDescription(widget) {
  return `<p>The widget's name is <strong>${escHtml(widget.name)}@${escHtml(widget.version)}</strong>.</p>`;
}
