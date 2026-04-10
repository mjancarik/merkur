import { escHtml } from '../utils';

describe('escHtml', () => {
  it('returns the value unchanged when there is nothing to escape', () => {
    expect(escHtml('hello world')).toBe('hello world');
  });

  it('escapes ampersands', () => {
    expect(escHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than signs', () => {
    expect(escHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes double quotes', () => {
    expect(escHtml('"value"')).toBe('&quot;value&quot;');
  });

  it('escapes single quotes', () => {
    expect(escHtml("it's")).toBe('it&#39;s');
  });

  it('escapes all special characters together', () => {
    expect(escHtml('<a href="x" title=\'y\'>a & b</a>')).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;a &amp; b&lt;/a&gt;',
    );
  });

  it('coerces a number to a string', () => {
    expect(escHtml(42)).toBe('42');
  });

  it('coerces null to string', () => {
    expect(escHtml(null)).toBe('null');
  });

  it('returns an empty string unchanged', () => {
    expect(escHtml('')).toBe('');
  });
});
