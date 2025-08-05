import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponsiveTableProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

interface ResponsiveTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface ResponsiveTableCellProps {
  label?: string;
  children: ReactNode;
  className?: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export function ResponsiveTable({ title, children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`w-full ${className}`}>
      {title && (
        <Card className="mb-4 md:hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
        </Card>
      )}
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {children}
        </table>
      </div>
      
      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {children}
      </div>
    </div>
  );
}

export function ResponsiveTableRow({ children, className = '', onClick }: ResponsiveTableRowProps) {
  return (
    <>
      {/* Desktop Row */}
      <tr 
        className={`hidden md:table-row border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        {children}
      </tr>
      
      {/* Mobile Card */}
      <Card 
        className={`md:hidden ${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            {children}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export function ResponsiveTableCell({ 
  label, 
  children, 
  className = '', 
  mobileOnly = false, 
  desktopOnly = false 
}: ResponsiveTableCellProps) {
  if (mobileOnly) {
    return (
      <div className={`md:hidden ${className}`}>
        {label && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}: </span>}
        {children}
      </div>
    );
  }
  
  if (desktopOnly) {
    return (
      <td className={`hidden md:table-cell px-4 py-3 text-sm ${className}`}>
        {children}
      </td>
    );
  }
  
  return (
    <>
      {/* Desktop Cell */}
      <td className={`hidden md:table-cell px-4 py-3 text-sm ${className}`}>
        {children}
      </td>
      
      {/* Mobile Field */}
      <div className={`md:hidden ${className}`}>
        {label && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}: </span>}
        <span className="text-sm text-gray-900 dark:text-white">{children}</span>
      </div>
    </>
  );
}

export function ResponsiveTableHeader({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <thead className={`hidden md:table-header-group bg-gray-50 dark:bg-gray-700 ${className}`}>
      <tr>
        {children}
      </tr>
    </thead>
  );
}

export function ResponsiveTableHeaderCell({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function ResponsiveTableBody({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <tbody className={`hidden md:table-row-group ${className}`}>
      {children}
    </tbody>
  );
}