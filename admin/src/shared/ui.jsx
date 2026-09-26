/* eslint-disable react/prop-types */
/*
Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { forwardRef, isValidElement, cloneElement } from 'react';
import clsx from 'clsx';
import {
  Loader2,
  ChevronDown,
  AlertCircle,
  Inbox,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

/**
 * Utility function to combine class names
 */
function cn(...inputs) {
  return clsx(inputs);
}

/* ==========================================================================
   BUTTON COMPONENT
   ========================================================================== */

const BUTTON_VARIANTS = {
  primary:
    'bg-admin-brand-600 hover:bg-admin-brand-700 text-white shadow-admin-sm shadow-admin-brand-500/20 active:bg-admin-brand-800 focus-visible:ring-admin-brand-500',
  secondary:
    'bg-admin-slate-100 hover:bg-admin-slate-200 text-admin-slate-800 active:bg-admin-slate-300 focus-visible:ring-admin-slate-400',
  outline:
    'border border-admin-slate-300 bg-white hover:bg-admin-slate-50 text-admin-slate-700 active:bg-admin-slate-100 focus-visible:ring-admin-brand-500',
  danger:
    'bg-admin-rose-600 hover:bg-admin-rose-700 text-white shadow-admin-sm shadow-admin-rose-500/20 active:bg-admin-rose-800 focus-visible:ring-admin-rose-500',
  ghost:
    'text-admin-slate-600 hover:bg-admin-slate-100 hover:text-admin-slate-900 active:bg-admin-slate-200 focus-visible:ring-admin-slate-400',
};

const BUTTON_SIZES = {
  sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 h-10 gap-2 rounded-xl',
  lg: 'text-base px-5 py-2.5 h-11 gap-2.5 rounded-xl',
};

export const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      type = 'button',
      className = '',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading ? 'true' : undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
          BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary,
          BUTTON_SIZES[size] || BUTTON_SIZES.md,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        ) : LeftIcon ? (
          <LeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : null}
        <span>{children}</span>
        {!isLoading && RightIcon ? (
          <RightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

/* ==========================================================================
   CARD & CARDHEADER COMPONENTS
   ========================================================================== */

const CARD_PADDINGS = {
  none: '',
  sm: 'p-4',
  default: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = ({
  children,
  className = '',
  padding = 'default',
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={cn(
        'bg-white rounded-xl border border-admin-slate-200/80 shadow-admin-xs overflow-hidden',
        CARD_PADDINGS[padding] || CARD_PADDINGS.default,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 mb-5 border-b border-admin-slate-100',
        className
      )}
      {...props}
    >
      <div>
        {typeof title === 'string' ? (
          <h2 className="text-lg font-bold text-admin-slate-900 tracking-tight">
            {title}
          </h2>
        ) : (
          title
        )}
        {subtitle && (
          <p className="text-sm text-admin-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   FORMFIELD COMPONENT
   ========================================================================== */

export const FormField = ({
  label,
  id,
  required = false,
  hint,
  error,
  className = '',
  children,
}) => {
  const errorId = id ? `${id}-error` : undefined;
  const hintId = id ? `${id}-hint` : undefined;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  let content = children;
  if (isValidElement(children) && id) {
    content = cloneElement(children, {
      id: children.props.id || id,
      error: children.props.error !== undefined ? children.props.error : Boolean(error),
      'aria-describedby': children.props['aria-describedby'] || describedBy,
    });
  }

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-admin-slate-700 mb-1.5 flex items-center justify-between"
        >
          <span>
            {label}
            {required && (
              <span className="text-admin-rose-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </span>
        </label>
      )}
      {content}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-admin-rose-600 mt-1.5 flex items-center gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-admin-slate-500 mt-1.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

/* ==========================================================================
   TEXTINPUT COMPONENT
   ========================================================================== */

export const TextInput = forwardRef(
  (
    {
      id,
      name,
      type = 'text',
      value,
      onChange,
      placeholder,
      error,
      disabled = false,
      className = '',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      ...props
    },
    ref
  ) => {
    const inputElement = (
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-admin-slate-900',
          'placeholder:text-admin-slate-400 transition-colors duration-150',
          'focus:outline-none focus:ring-2',
          error
            ? 'border-admin-rose-400 text-admin-rose-900 focus:border-admin-rose-500 focus:ring-admin-rose-500/20'
            : 'border-admin-slate-300 hover:border-admin-slate-400 focus:border-admin-brand-500 focus:ring-admin-brand-500/20',
          disabled &&
            'bg-admin-slate-50 text-admin-slate-500 cursor-not-allowed border-admin-slate-200 hover:border-admin-slate-200',
          LeftIcon && 'pl-10',
          RightIcon && 'pr-10',
          className
        )}
        {...props}
      />
    );

    if (!LeftIcon && !RightIcon) {
      return inputElement;
    }

    return (
      <div className="relative w-full">
        {LeftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-slate-400">
            <LeftIcon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
        {inputElement}
        {RightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-admin-slate-400">
            <RightIcon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

/* ==========================================================================
   SELECT COMPONENT
   ========================================================================== */

export const Select = forwardRef(
  (
    {
      id,
      name,
      value,
      onChange,
      children,
      options = [],
      placeholder,
      error,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'w-full rounded-xl border bg-white pl-3.5 pr-10 py-2 text-sm text-admin-slate-900',
            'transition-colors duration-150 appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-admin-rose-400 text-admin-rose-900 focus:border-admin-rose-500 focus:ring-admin-rose-500/20'
              : 'border-admin-slate-300 hover:border-admin-slate-400 focus:border-admin-brand-500 focus:ring-admin-brand-500/20',
            disabled &&
              'bg-admin-slate-50 text-admin-slate-500 cursor-not-allowed border-admin-slate-200 hover:border-admin-slate-200',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value ?? opt.label}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-admin-slate-400">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

/* ==========================================================================
   TEXTAREA COMPONENT
   ========================================================================== */

export const Textarea = forwardRef(
  (
    {
      id,
      name,
      value,
      onChange,
      rows = 4,
      placeholder,
      error,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-admin-slate-900',
          'placeholder:text-admin-slate-400 transition-colors duration-150 resize-y',
          'focus:outline-none focus:ring-2',
          error
            ? 'border-admin-rose-400 text-admin-rose-900 focus:border-admin-rose-500 focus:ring-admin-rose-500/20'
            : 'border-admin-slate-300 hover:border-admin-slate-400 focus:border-admin-brand-500 focus:ring-admin-brand-500/20',
          disabled &&
            'bg-admin-slate-50 text-admin-slate-500 cursor-not-allowed border-admin-slate-200 hover:border-admin-slate-200',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

/* ==========================================================================
   BADGE COMPONENT
   ========================================================================== */

const BADGE_TONES = {
  neutral: 'bg-admin-slate-100 text-admin-slate-700 border-admin-slate-200',
  success: 'bg-admin-emerald-50 text-admin-emerald-700 border-admin-emerald-200/80',
  warning: 'bg-admin-amber-50 text-admin-amber-700 border-admin-amber-200/80',
  error: 'bg-admin-rose-50 text-admin-rose-700 border-admin-rose-200/80',
  danger: 'bg-admin-rose-50 text-admin-rose-700 border-admin-rose-200/80',
  info: 'bg-admin-sky-50 text-admin-sky-700 border-admin-sky-200/80',
  brand: 'bg-admin-brand-50 text-admin-brand-700 border-admin-brand-200/80',
};

const BADGE_SIZES = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

const BADGE_ROUNDED = {
  full: 'rounded-full',
  md: 'rounded-md',
  lg: 'rounded-lg',
};

export const Badge = ({
  children,
  tone = 'neutral',
  size = 'md',
  rounded = 'full',
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border select-none',
        BADGE_TONES[tone] || BADGE_TONES.neutral,
        BADGE_SIZES[size] || BADGE_SIZES.md,
        BADGE_ROUNDED[rounded] || BADGE_ROUNDED.full,
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

/* ==========================================================================
   TABLE SYSTEM COMPONENTS
   ========================================================================== */

export const Table = ({ children, className = '', containerClassName = '', ...props }) => {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-admin-slate-200/80 bg-white shadow-admin-xs',
        containerClassName
      )}
    >
      <table
        className={cn('w-full text-left text-sm border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead
      className={cn(
        'bg-admin-slate-50/90 text-xs font-semibold text-admin-slate-600 uppercase tracking-wider border-b border-admin-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody
      className={cn('divide-y divide-admin-slate-100 text-admin-slate-700', className)}
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableFooter = ({ children, className = '', ...props }) => {
  return (
    <tfoot
      className={cn(
        'bg-admin-slate-50/60 font-medium text-admin-slate-600 border-t border-admin-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr
      className={cn(
        'hover:bg-admin-slate-50/80 transition-colors duration-100',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th
      scope="col"
      className={cn(
        'px-5 py-3.5 font-semibold text-admin-slate-600 whitespace-nowrap',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td
      className={cn('px-5 py-4 whitespace-nowrap text-admin-slate-800 text-sm', className)}
      {...props}
    >
      {children}
    </td>
  );
};

/* ==========================================================================
   SKELETON COMPONENTS
   ========================================================================== */

export const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => {
  const rowList = Array.from({ length: rows }, (_, i) => i);
  const colList = Array.from({ length: cols }, (_, i) => i);
  const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5', 'w-3/5'];

  return (
    <div
      role="status"
      aria-label="Loading table data"
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-admin-slate-200/80 bg-white shadow-admin-xs',
        className
      )}
    >
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-admin-slate-50/90 border-b border-admin-slate-200">
          <tr>
            {colList.map((c) => (
              <th key={c} className="px-5 py-3.5">
                <div className="h-3.5 w-20 bg-admin-slate-200 rounded motion-safe:animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-slate-100">
          {rowList.map((r) => (
            <tr key={r}>
              {colList.map((c) => (
                <td key={c} className="px-5 py-4">
                  <div
                    className={cn(
                      'h-4 bg-admin-slate-100 rounded motion-safe:animate-pulse',
                      widths[(r + c) % widths.length]
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading table data...</span>
    </div>
  );
};

export const SkeletonCards = ({ count = 4, className = '' }) => {
  const cards = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      role="status"
      aria-label="Loading cards"
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
        className
      )}
    >
      {cards.map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-admin-slate-200/80 p-5 sm:p-6 shadow-admin-xs motion-safe:animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-3.5 w-24 bg-admin-slate-200 rounded" />
            <div className="h-9 w-9 bg-admin-slate-100 rounded-xl" />
          </div>
          <div className="h-7 w-28 bg-admin-slate-200 rounded mb-2" />
          <div className="h-3 w-36 bg-admin-slate-100 rounded" />
        </div>
      ))}
      <span className="sr-only">Loading card data...</span>
    </div>
  );
};

/* ==========================================================================
   EMPTY STATE COMPONENT
   ========================================================================== */

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'py-12 px-4 text-center flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-admin-slate-100 text-admin-slate-400 flex items-center justify-center mb-3.5 shadow-admin-xs">
        <Icon className="w-6 h-6 shrink-0" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-admin-slate-800 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-admin-slate-500 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

/* ==========================================================================
   STATCARD COMPONENT
   ========================================================================== */

const STAT_ICON_TONES = {
  brand: 'bg-admin-brand-50 text-admin-brand-600',
  emerald: 'bg-admin-emerald-50 text-admin-emerald-600',
  amber: 'bg-admin-amber-50 text-admin-amber-600',
  rose: 'bg-admin-rose-50 text-admin-rose-600',
  sky: 'bg-admin-sky-50 text-admin-sky-600',
};

export const StatCard = ({
  title,
  value,
  description,
  change,
  trend = 'neutral',
  icon: Icon,
  iconTone = 'brand',
  className = '',
}) => {
  return (
    <Card padding="default" className={className}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-admin-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              'p-2.5 rounded-xl shrink-0',
              STAT_ICON_TONES[iconTone] || STAT_ICON_TONES.brand
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-bold text-admin-slate-900 tracking-tight mt-2 mb-1">
        {value}
      </div>

      {(change || description) && (
        <div className="flex items-center gap-1.5 text-xs">
          {change && (
            <>
              {trend === 'up' && (
                <span className="inline-flex items-center font-semibold text-admin-emerald-600 gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{change}</span>
                </span>
              )}
              {trend === 'down' && (
                <span className="inline-flex items-center font-semibold text-admin-rose-600 gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{change}</span>
                </span>
              )}
              {trend === 'neutral' && (
                <span className="inline-flex items-center font-medium text-admin-slate-500">
                  {change}
                </span>
              )}
            </>
          )}
          {description && (
            <span className="text-admin-slate-400">{description}</span>
          )}
        </div>
      )}
    </Card>
  );
};
