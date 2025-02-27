// This file is used to test icon imports to diagnose build errors

// Importing from the original Heroicons (hi)
import * as HiIcons from 'react-icons/hi';

// Importing from Heroicons v2 (hi2)
import * as Hi2Icons from 'react-icons/hi2';

console.log('HiIcons available:', Object.keys(HiIcons));
console.log('Hi2Icons available:', Object.keys(Hi2Icons));

// Check specific icon availability
console.log('HiOutlineRefresh in hi package:', 'HiOutlineRefresh' in HiIcons);
console.log('HiOutlineRefresh in hi2 package:', 'HiOutlineRefresh' in Hi2Icons);

// List comparable icons between packages
const findMatchingIcons = () => {
  const hi1Set = new Set(Object.keys(HiIcons));
  const hi2Set = new Set(Object.keys(Hi2Icons));
  
  // Icons in hi1 but not in hi2
  const onlyInHi1 = [...hi1Set].filter(x => !hi2Set.has(x));
  
  // Icons in hi2 but not in hi1
  const onlyInHi2 = [...hi2Set].filter(x => !hi1Set.has(x));
  
  // Common icons
  const common = [...hi1Set].filter(x => hi2Set.has(x));
  
  return {
    onlyInHi1: onlyInHi1.slice(0, 10), // First 10 for brevity
    onlyInHi2: onlyInHi2.slice(0, 10), // First 10 for brevity
    common: common.slice(0, 10), // First 10 for brevity
    totalOnlyInHi1: onlyInHi1.length,
    totalOnlyInHi2: onlyInHi2.length,
    totalCommon: common.length
  };
};

console.log('Icon comparison:', findMatchingIcons());

// Export a dummy component
export const TestIcons = () => {
  return null;
};

export default TestIcons; 