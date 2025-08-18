

import React, { useState } from 'react';
import ChevronDownIcon from './ChevronDownIcon.tsx';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen);

  // This function ensures that the children (and their potentially expensive logic)
  // are only mounted after the user interacts with the section for the first time.
  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (e.currentTarget.open) {
      setHasBeenOpened(true);
    }
  };

  return (
    <details 
      open={defaultOpen} 
      onToggle={handleToggle}
      className="bg-surface/50 border border-border/50 rounded-lg shadow-lg group transition-all duration-300 ease-in-out"
    >
      <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
        <div className="flex items-center gap-3">
            {icon && <div className="bg-primary/10 p-2 rounded-full">{icon}</div>}
            <h3 className="text-xl font-bold text-text">{title}</h3>
        </div>
        <ChevronDownIcon className="h-6 w-6 text-text-secondary transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="p-6 border-t border-border/50">
        {/* Only render children if the section has been opened at least once */}
        {hasBeenOpened && children}
      </div>
    </details>
  );
};

export default CollapsibleSection;