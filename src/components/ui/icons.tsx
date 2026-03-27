import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const IconPlaceholder: React.FC<IconProps & { name?: string }> = ({ 
  size = 16, 
  className = '',
  name 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    {name && (
      <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" style={{ fontSize: '8px', fontWeight: 'bold' }}>
        {name.charAt(0).toUpperCase()}
      </text>
    )}
  </svg>
);

export const createIcon = (name: string) => {
  const Component = (props: IconProps) => <IconPlaceholder {...props} name={name} />;
  Component.displayName = name;
  return Component;
};

export const Check = createIcon('Check');
export const Calendar = createIcon('Calendar');
export const Search = createIcon('Search');
export const Sparkles = createIcon('Sparkles');
export const X = createIcon('X');
export const Grip = createIcon('Grip');
export const CheckCircle2 = createIcon('CheckCircle2');
export const Circle = createIcon('Circle');
export const AlertCircle = createIcon('AlertCircle');
export const AlertTriangle = createIcon('AlertTriangle');
export const Clock = createIcon('Clock');
export const FileText = createIcon('FileText');
export const Download = createIcon('Download');
export const User = createIcon('User');
export const MapPin = createIcon('MapPin');
export const Lightbulb = createIcon('Lightbulb');
export const Key = createIcon('Key');
export const Bell = createIcon('Bell');
export const Database = createIcon('Database');
export const Palette = createIcon('Palette');
export const LayoutGrid = createIcon('LayoutGrid');
export const Plus = createIcon('Plus');
export const Send = createIcon('Send');
export const Tag = createIcon('Tag');
export const Trash2 = createIcon('Trash2');
export const ChevronDown = createIcon('ChevronDown');
export const ChevronRight = createIcon('ChevronRight');
export const FolderOpen = createIcon('FolderOpen');
export const Menu = createIcon('Menu');

