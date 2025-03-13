/**
 * Re-export of the Breadcrumb component from navigation
 * This allows importing from 'components/ui/breadcrumb' to maintain consistency with other UI components
 */
import Breadcrumb, { BreadcrumbProps, BreadcrumbItem, BreadcrumbItemProps, BreadcrumbItem as BreadcrumbItemType } from '../navigation/Breadcrumb';

export { 
  Breadcrumb, 
  BreadcrumbItem,
  // Export types
  type BreadcrumbProps, 
  type BreadcrumbItemProps,
  type BreadcrumbItemType
};
export default Breadcrumb; 