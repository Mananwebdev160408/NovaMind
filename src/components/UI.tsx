import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon, 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '9999px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled || loading ? 0.5 : 1,
  };

  const variantStyles = {
    primary: {
      background: 'var(--accent-indigo)',
      color: 'white',
    },
    secondary: {
      background: 'transparent',
      border: '1px solid var(--border-bright)',
      color: 'var(--text-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
    },
    danger: {
      background: '#ef4444',
      color: 'white',
    },
  };

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '12px' },
    md: { padding: '12px 24px', fontSize: '14px' },
    lg: { padding: '16px 32px', fontSize: '16px' },
  };

  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant], ...sizeStyles[size] }}
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {icon && !loading && icon}
      {children}
    </button>
  );
}

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', hoverable = false, onClick, style = {} }: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-ghost)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        cursor: onClick || hoverable ? 'pointer' : 'default',
        transition: 'all 0.3s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = 'var(--border-ghost)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>
            {icon}
          </div>
        )}
        <input
          className={className}
          style={{
            width: '100%',
            background: 'var(--bg-obsidian)',
            border: `1px solid ${error ? '#ef4444' : 'var(--border-thin)'}`,
            padding: icon ? '14px 16px 14px 48px' : '14px 16px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-indigo)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border-thin)')}
          {...props}
        />
      </div>
      {error && (
        <span className="mono" style={{ fontSize: '10px', color: '#ef4444' }}>
          {error}
        </span>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
          {label}
        </label>
      )}
      <textarea
        className={className}
        style={{
          width: '100%',
          background: 'var(--bg-obsidian)',
          border: `1px solid ${error ? '#ef4444' : 'var(--border-thin)'}`,
          padding: '14px 16px',
          color: 'var(--text-primary)',
          fontSize: '14px',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          resize: 'vertical',
          minHeight: '120px',
          fontFamily: 'inherit',
          lineHeight: '1.6',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-indigo)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border-thin)')}
        {...props}
      />
      {error && (
        <span className="mono" style={{ fontSize: '10px', color: '#ef4444' }}>
          {error}
        </span>
      )}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'default', style = {} }: BadgeProps) {
  const colors = {
    default: { bg: 'var(--bg-surface)', color: 'var(--text-muted)' },
    success: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
    warning: { bg: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
    info: { bg: 'var(--accent-glow)', color: 'var(--accent-indigo)' },
  };

  return (
    <span
      className="mono"
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '10px',
        fontWeight: 600,
        ...colors[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
    error: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    info: { border: 'var(--accent-indigo)', bg: 'var(--accent-glow)' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: colors[type].bg,
        border: `1px solid ${colors[type].border}`,
        borderRadius: 'var(--radius-md)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        zIndex: 10000,
        animation: 'slideIn 0.3s ease',
      }}
    >
      <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          padding: '0',
          fontSize: '18px',
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
          {label}
        </label>
      )}
      <select
        className={className}
        style={{
          width: '100%',
          background: 'var(--bg-obsidian)',
          border: '1px solid var(--border-thin)',
          padding: '14px 16px',
          color: 'var(--text-primary)',
          fontSize: '14px',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          cursor: 'pointer',
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { Spinner };
