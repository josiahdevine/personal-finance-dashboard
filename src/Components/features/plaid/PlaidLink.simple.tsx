import React from 'react'; 
 
export interface PlaidLinkProps { 
  onSuccess?: () => void; 
  onExit?: () => void; 
  buttonText?: string; 
} 
 
const PlaidLink: React.FC<PlaidLinkProps> = ({ 
  buttonText = 'Connect Bank Account', 
  onSuccess 
}) => { 
  const handleClick = () => { 
    console.log('PlaidLink clicked'); 
    if (onSuccess) onSuccess(); 
  }; 
  
  return ( 
    <button 
      onClick={handleClick} 
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
    > 
      {buttonText} 
    </button> 
  ); 
}; 
 
export default PlaidLink; 
export { PlaidLink }; 
