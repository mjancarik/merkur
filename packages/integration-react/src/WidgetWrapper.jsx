import React from 'react';

export default function WidgetWrapper({ html, className, children }) {
  return html ? (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <div className={className}>{children}</div>
  );
}
