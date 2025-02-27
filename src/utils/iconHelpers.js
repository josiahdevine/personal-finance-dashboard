/**
 * Icon Helper Utilities
 * This file provides standardized icon imports to prevent build issues between
 * different versions of react-icons packages.
 */

// These imports are guaranteed to work with react-icons v5+
import { HiOutlineRefresh } from 'react-icons/hi';
import { 
  HiOutlineCreditCard, 
  HiOutlinePlusCircle,
  HiOutlineExclamationCircle,
  HiOutlineChevronRight,
  HiOutlineBanknotes,
  HiOutlineArrowsRightLeft,
  HiOutlineShieldCheck
} from 'react-icons/hi2';

// Export renamed versions to avoid name collisions
export const IconRefresh = HiOutlineRefresh;
export const IconCreditCard = HiOutlineCreditCard;
export const IconPlusCircle = HiOutlinePlusCircle;
export const IconExclamationCircle = HiOutlineExclamationCircle;
export const IconChevronRight = HiOutlineChevronRight;
export const IconBanknotes = HiOutlineBanknotes;
export const IconArrowsRightLeft = HiOutlineArrowsRightLeft;
export const IconShieldCheck = HiOutlineShieldCheck;

/**
 * Returns the appropriate icon component based on account type
 * @param {string} type - Account type
 * @param {string} subtype - Account subtype
 * @returns {JSX.Element} Icon component
 */
export const getAccountIcon = (type, subtype, className = "h-5 w-5") => {
  if (type === 'depository' && (subtype === 'checking' || subtype === 'savings')) {
    return <IconBanknotes className={`${className} text-blue-500`} />;
  } else if (type === 'credit' || subtype === 'credit card') {
    return <IconCreditCard className={`${className} text-purple-500`} />;
  } else if (type === 'investment') {
    return <IconArrowsRightLeft className={`${className} text-green-500`} />;
  } else if (type === 'loan') {
    return <IconShieldCheck className={`${className} text-red-500`} />;
  } else {
    return <IconBanknotes className={`${className} text-gray-500`} />;
  }
};

export default {
  IconRefresh,
  IconCreditCard,
  IconPlusCircle,
  IconExclamationCircle,
  IconChevronRight,
  IconBanknotes,
  IconArrowsRightLeft,
  IconShieldCheck,
  getAccountIcon,
}; 