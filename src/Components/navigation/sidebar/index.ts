/**
 * @fileoverview This file re-exports the EnhancedSidebar component to make migration
 * from the deprecated Sidebar components easier.
 */

/**
 * This is a re-export file to maintain backward compatibility
 * In the future, components should import directly from '../EnhancedSidebar'
 */

export { EnhancedSidebar as Sidebar } from '../EnhancedSidebar';
export { EnhancedSidebar } from '../EnhancedSidebar';
export type { EnhancedSidebarProps } from '../EnhancedSidebar';
export type { EnhancedSidebarProps as SidebarProps } from '../EnhancedSidebar'; 