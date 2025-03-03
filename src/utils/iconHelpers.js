/**
 * Icon Helper Utilities
 * This file provides standardized icon imports to prevent build issues between
 * different versions of react-icons packages.
 */

// These imports are guaranteed to work with react-icons v5+
import { 
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCreditCard,
  HiOutlinePlusCircle,
  HiOutlineExclamationCircle,
  HiOutlineBanknotes,
  HiOutlineArrowsRightLeft,
  HiOutlineCurrencyDollar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineQuestionMarkCircle,
  HiOutlineUserCircle,
  HiOutlinePaperAirplane,
  HiOutlineDocumentDownload,
  HiOutlineChartPie,
  HiOutlineCash,
  HiOutlineHome
} from './iconMapping';

// Export renamed versions to avoid name collisions
export const IconRefresh = HiOutlineRefresh;
export const IconCreditCard = HiOutlineCreditCard;
export const IconPlusCircle = HiOutlinePlusCircle;
export const IconExclamationCircle = HiOutlineExclamationCircle;
export const IconChevronRight = HiOutlineChevronRight;
export const IconBanknotes = HiOutlineBanknotes;
export const IconArrowsRightLeft = HiOutlineArrowsRightLeft;
export const IconCurrencyDollar = HiOutlineCurrencyDollar;
export const IconCog = HiOutlineCog;
export const IconLogout = HiOutlineLogout;
export const IconBell = HiOutlineBell;
export const IconQuestionMarkCircle = HiOutlineQuestionMarkCircle;
export const IconUserCircle = HiOutlineUserCircle;
export const IconPaperAirplane = HiOutlinePaperAirplane;
export const IconDocumentDownload = HiOutlineDocumentDownload;
export const IconChartPie = HiOutlineChartPie;
export const IconCash = HiOutlineCash;
export const IconHome = HiOutlineHome;

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
    return <IconCash className={`${className} text-red-500`} />;
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
  IconCurrencyDollar,
  IconCog,
  IconLogout,
  IconBell,
  IconQuestionMarkCircle,
  IconUserCircle,
  IconPaperAirplane,
  IconDocumentDownload,
  IconChartPie,
  IconCash,
  IconHome,
  getAccountIcon,
}; 