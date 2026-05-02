import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md', text }) => {
  const sizes = { sm: 16, md: 24, lg: 36, xl: 48 };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 size={sizes[size] || 24} className="animate-spin text-primary-500" />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" text="Loading..." />
  </div>
);

export default Spinner;
