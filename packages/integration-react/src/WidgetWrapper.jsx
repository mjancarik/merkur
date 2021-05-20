import React from 'react';

export default function WidgetWrapper({ html, className }) {
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
