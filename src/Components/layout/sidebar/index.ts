/**
 * @fileoverview This file re-exports the EnhancedSidebar component to make migration
 * from the deprecated Sidebar components easier.
 */

/**
 * This is a re-export file to maintain backward compatibility
 * In the future, components should import directly from '../../navigation/EnhancedSidebar'
 */

export { default as Sidebar } from '../../navigation/EnhancedSidebar';
export { default as EnhancedSidebar } from '../../navigation/EnhancedSidebar';
export type { EnhancedSidebarProps } from '../../navigation/EnhancedSidebar';
export type { EnhancedSidebarProps as SidebarProps } from '../../navigation/EnhancedSidebar'; 