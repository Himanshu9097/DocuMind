import React from 'react';
import '../styles/RagPage.css';

export default function RagLayout({ children }) {
  return (
    <div className="w-full bg-canvas relative">
      {children}
    </div>
  );
}
