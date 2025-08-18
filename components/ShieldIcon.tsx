import React from 'react';

const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.352c4.81-1.21 8.244-5.518 8.244-10.59V6.138a.91.91 0 00-.547-.832l-7.32-3.66a.91.91 0 00-.754 0l-7.32 3.66a.91.91 0 00-.547.832v4.624c0 5.072 3.433 9.38 8.244 10.59z" />
    </svg>
);

export default ShieldIcon;
