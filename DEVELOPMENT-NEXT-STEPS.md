
## Current Project Structure

## Development Environment Notes

### Windows PowerShell Command Syntax

When running scripts or commands in the Windows PowerShell environment:

1. **Do not use the `&&` operator to chain commands** - This syntax is valid in Bash/Unix shells but does not work in PowerShell.
2. **Run commands separately** - Execute each command in sequence rather than trying to chain them.
3. **For command chaining in PowerShell** - Use the PowerShell-specific syntax:
   ```powershell
   # Instead of: npx kill-port 3000 && npm start
   
   # Use separate commands:
   npx kill-port 3000
   npm start
   
   # Or use PowerShell syntax:
   npx kill-port 3000; if ($?) { npm start }
   ```
4. **For script creation** - When writing automation scripts, prefer using `.ps1` files for Windows environments.

This ensures compatibility when running commands in a Windows development environment.

```
└── .gitignore
└── babel.config.js
└── craco.config.js
└── db-migration/
    ├── package.json
    ├── README.md
    ├── run_neon_migration.js
    ├── salary_table_migration.sql
└── deploy-with-url-update.ps1
└── deploy.ps1
└── deploy.sh
└── DEVELOPMENT-CHANGELOG.md
└── DEVELOPMENT-NEXT-STEPS.md
└── documentation/
    ├── project-status.md
└── netlify.toml
└── NEXT_STEPS.md
└── package-lock.json
└── package.json
└── patches/
    ├── date-fns+2.29.3.patch
└── PersonalFinanceDashboard-Documentation.md
└── postcss.config.js
└── public/
    ├── favicon.ico
    ├── index.html
    ├── logo192.png
    ├── logo512.png
    ├── manifest.json
    ├── robots.txt
    ├── _redirects
└── README.md
└── run_neon_migration.js
└── salary_table_migration.sql
└── server/
    ├── .gitignore
    ├── config/
    │   ├── database-example.js
    │   ├── database.js
    │   ├── development.js
    │   ├── production.js
    ├── controller/
    │   ├── ManualAccountController.js
    │   ├── PlaidController.js
    │   ├── SalaryJournalController.js
    │   ├── StockController.js
    ├── controllers/
    │   ├── GoalController.js
    │   ├── InvestmentController.js
    │   ├── LoanController.js
    │   ├── PaymentController.js
    │   ├── PlaidController.js
    │   ├── SalaryController.js
    │   ├── TransactionController.js
    ├── database.json
    ├── db/
    │   ├── migrations/
    │   │   ├── 001_create_users_table.sql
    │   │   ├── 002_enhance_manual_accounts.sql
    │   │   ├── migrations.sql
    ├── db.js
    ├── middleware/
    │   ├── auth.js
    ├── migrations/
    │   ├── 001_create_transactions_and_goals.sql
    │   ├── 20231005_create_subscription_tables.sql
    ├── models/
    │   ├── GoalModel.js
    │   ├── InvestmentModel.js
    │   ├── LoanModel.js
    │   ├── ManualAccountModel.js
    │   ├── PlaidModel.js
    │   ├── SalaryEntryModel.js
    │   ├── StockPriceCache.js
    │   ├── TransactionModel.js
    │   ├── UserModel.js
    ├── neon-db-instructions.md
    ├── package-lock.json
    ├── package.json
    ├── plaid.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── goalRoutes.js
    │   ├── investmentRoutes.js
    │   ├── loanRoutes.js
    │   ├── manualAccountRoutes.js
    │   ├── paymentRoutes.js
    │   ├── plaidRoutes.js
    │   ├── salaryRoutes.js
    │   ├── stockRoutes.js
    │   ├── transactionRoutes.js
    ├── scripts/
    │   ├── migrate.js
    ├── server.js
    ├── test-db.js
    ├── test-plaid.js
    ├── test2.js
└── src/
    ├── api-adapters.js
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── Components/
    │   ├── AccountConnections.js
    │   ├── AskAI.js
    │   ├── AskAIButton.js
    │   ├── auth/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   ├── AuthMenu.js
    │   ├── BankAccountForm.js
    │   ├── BillsAnalysis.js
    │   ├── Dashboard.js
    │   ├── demo/
    │   │   ├── UIComponentDemo.js
    │   ├── EditAccountModal.js
    │   ├── ErrorBoundary.js
    │   ├── examples/
    │   │   ├── UIComponentDemo.js
    │   ├── Goals.js
    │   ├── Header.js
    │   ├── HeaderWithAuth.js
    │   ├── layout/
    │   │   ├── DashboardFooter.js
    │   │   ├── DashboardHeader.js
    │   │   ├── DashboardLayout.js
    │   │   ├── DashboardSidebar.js
    │   │   ├── index.js
    │   ├── LinkAccounts.js
    │   ├── Login.js
    │   ├── plaid/
    │   │   ├── AccountList.js
    │   │   ├── index.js
    │   │   ├── PlaidLink.js
    │   │   ├── TransactionSync.js
    │   ├── RealEstateForm.js
    │   ├── Register.js
    │   ├── ResponsiveWrapper.js
    │   ├── SalaryEntry.js
    │   ├── SalaryJournal.js
    │   ├── Sidebar.js
    │   ├── StockAccountForm.js
    │   ├── SubscriptionPlans.js
    │   ├── Transactions.js
    │   ├── ui/
    │   │   └── Badge.js
    │   │   └── Button.js
    │   │   └── Card.js
    │   │   └── Checkbox.js
    │   │   └── index.js
    │   │   └── Input.js
    │   │   └── Modal.js
    │   │   └── Select.js
    │   │   └── Tabs.js
    │   │   └── Toggle.js
    ├── context/
    │   ├── AuthContext.js
    ├── contexts/
    │   ├── AuthContext.js
    │   ├── FinanceDataContext.js
    │   ├── PlaidContext.js
    │   ├── PlaidLinkContext.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── mobile/
    │   ├── AccountConnectionsMobile.js
    │   ├── MobileLayout.js
    │   ├── SubscriptionPlansMobile.js
    ├── pages/
    │   ├── AskAIPage.js
    │   ├── BillsAnalysisPage.js
    │   ├── Dashboard/
    │   │   ├── Overview.js
    │   ├── Dashboard.js
    │   ├── GoalsPage.js
    │   ├── LandingPage.js
    │   ├── LinkAccountsPage.js
    │   ├── SalaryJournalPage.js
    │   ├── TransactionsPage.js
    ├── reportWebVitals.js
    ├── services/
    │   ├── aiService.js
    │   ├── api.js
    │   ├── auth.js
    │   ├── firebase.js
    │   ├── plaidService.js
    │   ├── stripe.js
    ├── setupTests.js
    ├── utils/
    │   └── authUtils.js
    │   └── dateFnsFix.js
    │   └── dateUtils.js
    │   └── deploymentDebug.js
    │   └── deviceDetection.js
    │   └── encryption.js
    │   └── firebaseTest.js
    │   └── importFixer.js
    │   └── logger.js
    │   └── patchedDateFns.js
    │   └── stripeUtils.js
└── standardize-components.js
└── STRIPE_MOBILE_README.md
└── tailwind.config.js
└── TEST-SETUP.md
└── update-directory.js
└── webpack.config.js
```
