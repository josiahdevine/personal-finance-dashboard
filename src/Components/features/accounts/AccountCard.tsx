import React from 'react';
import Card from "../../common/card_component/Card";
import { TrendIndicator } from './TrendIndicator';
import './AccountCard.css';

interface AccountCardProps {
  accountName: string;
  accountType: string;
  balance: number;
  currency?: string;
  institution?: string;
  institutionLogo?: string;
  lastFour?: string;
  trend?: number;
  trendPeriod?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  accountName,
  accountType,
  balance,
  currency = 'USD',
  institution,
  institutionLogo,
  lastFour,
  trend,
  trendPeriod = '30d',
  onClick,
  isSelected = false,
}) => {
  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit':
        return '💳';
      case 'investment':
        return '📈';
      case 'loan':
        return '💸';
      default:
        return '💵';
    }
  };
  
  const accountIcon = getAccountTypeIcon(accountType);
  
  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };
  
  return (
    <Card 
      elevation={isSelected ? 2 : 1}
      className={`account-card ${isSelected ? 'account-card-selected' : ''}`}
      onClick={onClick}
      isInteractive={!!onClick}
      padding="none"
    >
      <div className="account-card-content">
        <div className="account-card-header">
          <div className="account-card-institution">
            {institutionLogo ? (
              <img 
                src={institutionLogo} 
                alt={institution || 'Bank'} 
                className="account-card-institution-logo" 
              />
            ) : (
              <div className="account-card-institution-icon">
                {accountIcon}
              </div>
            )}
            {institution && <span className="account-card-institution-name">{institution}</span>}
          </div>
          <div className="account-card-type">
            {accountType}
            {lastFour && <span className="account-card-last-four">•••• {lastFour}</span>}
          </div>
        </div>
        
        <div className="account-card-body">
          <h3 className="account-card-name">{accountName}</h3>
          <div className="account-card-balance">
            {formatCurrency(balance, currency)}
          </div>
        </div>
        
        {trend !== undefined && (
          <div className="account-card-footer">
            <TrendIndicator 
              value={trend}
              period={trendPeriod}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default AccountCard; 