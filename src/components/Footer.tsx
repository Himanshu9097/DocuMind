import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-canvas py-10 mt-auto border-t border-hairline-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate text-[14px] font-medium">
          &copy; {new Date().getFullYear()} Personal PDF Assistant. All rights reserved.
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-slate hover:text-ink-deep text-[14px] font-semibold transition-colors">Privacy</a>
          <a href="#" className="text-slate hover:text-ink-deep text-[14px] font-semibold transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
