import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm px-3.5 py-2',
    md: 'px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} flex items-center justify-center gap-2 ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={16} />
      )}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  );
};

export default Button;
