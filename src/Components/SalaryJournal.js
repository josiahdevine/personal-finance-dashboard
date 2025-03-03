import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../services/liveApi';
import { useAuth } from '../contexts/AuthContext';
import { log, logError } from '../utils/logger';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Add pay frequency constants
const PAY_FREQUENCIES = {
    WEEKLY: {
        label: 'Weekly',
        periodsPerYear: 52
    },
    BIWEEKLY: {
        label: 'Bi-Weekly',
        periodsPerYear: 26
    },
    SEMIMONTHLY: {
        label: 'Semi-Monthly',
        periodsPerYear: 24
    },
    MONTHLY: {
        label: 'Monthly',
        periodsPerYear: 12
    },
    ANNUAL: {
        label: 'Annual',
        periodsPerYear: 1
    }
};

const TAX_BRACKETS_2024 = {
    FEDERAL: [
        { rate: 0.10, upTo: 11600 },
        { rate: 0.12, upTo: 47150 },
        { rate: 0.22, upTo: 100525 },
        { rate: 0.24, upTo: 191950 },
        { rate: 0.32, upTo: 243725 },
        { rate: 0.35, upTo: 609350 },
        { rate: 0.37, upTo: Infinity }
    ],
    FICA: {
        socialSecurity: { rate: 0.062, wageBase: 168600 },
        medicare: { rate: 0.0145, additionalRate: 0.009, threshold: 200000 }
    }
};

const STATE_TAX_RATES = {
    AL: { flatRate: 0.05 },
    AK: { flatRate: 0 }, // No state income tax
    AZ: {
        brackets: [
            { rate: 0.0259, upTo: 28653 },
            { rate: 0.0334, upTo: 57305 },
            { rate: 0.0417, upTo: Infinity }
        ]
    },
    AR: {
        brackets: [
            { rate: 0.02, upTo: 4999 },
            { rate: 0.04, upTo: 9999 },
            { rate: 0.055, upTo: Infinity }
        ]
    },
    CA: {
        brackets: [
            { rate: 0.01, upTo: 10099 },
            { rate: 0.02, upTo: 23942 },
            { rate: 0.04, upTo: 37788 },
            { rate: 0.06, upTo: 52455 },
            { rate: 0.08, upTo: 66295 },
            { rate: 0.093, upTo: 338639 },
            { rate: 0.103, upTo: 406364 },
            { rate: 0.113, upTo: 677275 },
            { rate: 0.123, upTo: Infinity }
        ],
        cities: {
            'San Francisco': {
                payrollTax: 0.0038 // SF has a payroll expense tax
            }
        }
    },
    CO: { flatRate: 0.044 },
    CT: {
        brackets: [
            { rate: 0.03, upTo: 10000 },
            { rate: 0.05, upTo: 50000 },
            { rate: 0.055, upTo: 100000 },
            { rate: 0.06, upTo: 200000 },
            { rate: 0.065, upTo: 250000 },
            { rate: 0.069, upTo: 500000 },
            { rate: 0.0699, upTo: Infinity }
        ]
    },
    DE: {
        brackets: [
            { rate: 0.022, upTo: 5000 },
            { rate: 0.039, upTo: 10000 },
            { rate: 0.048, upTo: 20000 },
            { rate: 0.052, upTo: 25000 },
            { rate: 0.0555, upTo: 60000 },
            { rate: 0.066, upTo: Infinity }
        ]
    },
    FL: { flatRate: 0 }, // No state income tax
    GA: {
        brackets: [
            { rate: 0.01, upTo: 750 },
            { rate: 0.02, upTo: 2250 },
            { rate: 0.03, upTo: 3750 },
            { rate: 0.04, upTo: 5250 },
            { rate: 0.05, upTo: 7000 },
            { rate: 0.0575, upTo: Infinity }
        ]
    },
    HI: {
        brackets: [
            { rate: 0.014, upTo: 2400 },
            { rate: 0.032, upTo: 4800 },
            { rate: 0.055, upTo: 9600 },
            { rate: 0.064, upTo: 14400 },
            { rate: 0.068, upTo: 19200 },
            { rate: 0.072, upTo: 24000 },
            { rate: 0.076, upTo: 36000 },
            { rate: 0.079, upTo: 48000 },
            { rate: 0.0825, upTo: 150000 },
            { rate: 0.09, upTo: 175000 },
            { rate: 0.1, upTo: 200000 },
            { rate: 0.11, upTo: Infinity }
        ]
    },
    ID: {
        brackets: [
            { rate: 0.01, upTo: 1568 },
            { rate: 0.03, upTo: 3136 },
            { rate: 0.045, upTo: 4704 },
            { rate: 0.06, upTo: Infinity }
        ]
    },
    IL: { flatRate: 0.0495 },
    IN: { flatRate: 0.0323 },
    IA: {
        brackets: [
            { rate: 0.0425, upTo: 6000 },
            { rate: 0.0482, upTo: 30000 },
            { rate: 0.0598, upTo: Infinity }
        ]
    },
    KS: {
        brackets: [
            { rate: 0.031, upTo: 15000 },
            { rate: 0.0525, upTo: 30000 },
            { rate: 0.057, upTo: Infinity }
        ]
    },
    KY: { flatRate: 0.045 },
    LA: {
        brackets: [
            { rate: 0.0185, upTo: 12500 },
            { rate: 0.035, upTo: 50000 },
            { rate: 0.0425, upTo: Infinity }
        ]
    },
    ME: {
        brackets: [
            { rate: 0.058, upTo: 23000 },
            { rate: 0.0675, upTo: 54450 },
            { rate: 0.0715, upTo: Infinity }
        ]
    },
    MD: {
        brackets: [
            { rate: 0.02, upTo: 1000 },
            { rate: 0.03, upTo: 2000 },
            { rate: 0.04, upTo: 3000 },
            { rate: 0.0475, upTo: 100000 },
            { rate: 0.05, upTo: 125000 },
            { rate: 0.0525, upTo: 150000 },
            { rate: 0.055, upTo: 250000 },
            { rate: 0.0575, upTo: Infinity }
        ]
    },
    MA: { flatRate: 0.05 },
    MI: { flatRate: 0.0425 },
    MN: {
        brackets: [
            { rate: 0.0535, upTo: 30070 },
            { rate: 0.068, upTo: 98760 },
            { rate: 0.0785, upTo: 183340 },
            { rate: 0.0985, upTo: Infinity }
        ]
    },
    MS: {
        brackets: [
            { rate: 0.04, upTo: 10000 },
            { rate: 0.05, upTo: Infinity }
        ]
    },
    MO: {
        brackets: [
            { rate: 0.015, upTo: 1088 },
            { rate: 0.02, upTo: 2176 },
            { rate: 0.025, upTo: 3264 },
            { rate: 0.03, upTo: 4352 },
            { rate: 0.035, upTo: 5440 },
            { rate: 0.04, upTo: 6528 },
            { rate: 0.045, upTo: 7616 },
            { rate: 0.05, upTo: 8704 },
            { rate: 0.054, upTo: Infinity }
        ]
    },
    MT: {
        brackets: [
            { rate: 0.01, upTo: 3100 },
            { rate: 0.02, upTo: 5500 },
            { rate: 0.03, upTo: 8400 },
            { rate: 0.04, upTo: 11400 },
            { rate: 0.05, upTo: 14600 },
            { rate: 0.06, upTo: 18800 },
            { rate: 0.068, upTo: Infinity }
        ]
    },
    NE: {
        brackets: [
            { rate: 0.0246, upTo: 3700 },
            { rate: 0.0351, upTo: 22170 },
            { rate: 0.0501, upTo: 35730 },
            { rate: 0.0684, upTo: Infinity }
        ]
    },
    NV: { flatRate: 0 }, // No state income tax
    NH: { flatRate: 0.05, onlyInterestAndDividends: true }, // Only taxes interest and dividend income
    NJ: {
        brackets: [
            { rate: 0.014, upTo: 20000 },
            { rate: 0.0175, upTo: 35000 },
            { rate: 0.035, upTo: 40000 },
            { rate: 0.0553, upTo: 75000 },
            { rate: 0.0637, upTo: 500000 },
            { rate: 0.0897, upTo: 1000000 },
            { rate: 0.1075, upTo: Infinity }
        ]
    },
    NM: {
        brackets: [
            { rate: 0.017, upTo: 5500 },
            { rate: 0.032, upTo: 11000 },
            { rate: 0.047, upTo: 16000 },
            { rate: 0.049, upTo: 210000 },
            { rate: 0.059, upTo: Infinity }
        ]
    },
    NY: {
        brackets: [
            { rate: 0.04, upTo: 8500 },
            { rate: 0.045, upTo: 11700 },
            { rate: 0.0525, upTo: 13900 },
            { rate: 0.059, upTo: 80650 },
            { rate: 0.0597, upTo: 215400 },
            { rate: 0.0633, upTo: 1077550 },
            { rate: 0.0685, upTo: 5000000 },
            { rate: 0.0965, upTo: 25000000 },
            { rate: 0.103, upTo: Infinity }
        ],
        cities: {
            NYC: {
                brackets: [
                    { rate: 0.03078, upTo: 12000 },
                    { rate: 0.03762, upTo: 25000 },
                    { rate: 0.03819, upTo: 50000 },
                    { rate: 0.03876, upTo: Infinity }
                ]
            }
        }
    },
    NC: { flatRate: 0.0475 },
    ND: {
        brackets: [
            { rate: 0.011, upTo: 41775 },
            { rate: 0.0204, upTo: 101050 },
            { rate: 0.0227, upTo: 210825 },
            { rate: 0.0264, upTo: 458350 },
            { rate: 0.029, upTo: Infinity }
        ]
    },
    OH: {
        brackets: [
            { rate: 0.02765, upTo: 26050 },
            { rate: 0.03226, upTo: 46100 },
            { rate: 0.03688, upTo: 92150 },
            { rate: 0.0399, upTo: 115300 },
            { rate: 0.04597, upTo: Infinity }
        ]
    },
    OK: {
        brackets: [
            { rate: 0.0025, upTo: 1000 },
            { rate: 0.0075, upTo: 2500 },
            { rate: 0.0175, upTo: 3750 },
            { rate: 0.0275, upTo: 4900 },
            { rate: 0.0375, upTo: 7200 },
            { rate: 0.0475, upTo: Infinity }
        ]
    },
    OR: {
        brackets: [
            { rate: 0.0475, upTo: 3650 },
            { rate: 0.0675, upTo: 9200 },
            { rate: 0.0875, upTo: 125000 },
            { rate: 0.099, upTo: Infinity }
        ]
    },
    PA: { flatRate: 0.0307 },
    RI: {
        brackets: [
            { rate: 0.0375, upTo: 68200 },
            { rate: 0.0475, upTo: 155050 },
            { rate: 0.0599, upTo: Infinity }
        ]
    },
    SC: {
        brackets: [
            { rate: 0, upTo: 3200 },
            { rate: 0.03, upTo: 6410 },
            { rate: 0.04, upTo: 9620 },
            { rate: 0.05, upTo: 12820 },
            { rate: 0.06, upTo: 16040 },
            { rate: 0.07, upTo: Infinity }
        ]
    },
    SD: { flatRate: 0 }, // No state income tax
    TN: { flatRate: 0 }, // No state income tax
    TX: { flatRate: 0 }, // No state income tax
    UT: { flatRate: 0.0485 },
    VT: {
        brackets: [
            { rate: 0.0335, upTo: 44650 },
            { rate: 0.066, upTo: 108050 },
            { rate: 0.076, upTo: 204000 },
            { rate: 0.0875, upTo: Infinity }
        ]
    },
    VA: {
        brackets: [
            { rate: 0.02, upTo: 3000 },
            { rate: 0.03, upTo: 5000 },
            { rate: 0.05, upTo: 17000 },
            { rate: 0.0575, upTo: Infinity }
        ]
    },
    WA: { flatRate: 0 }, // No state income tax
    WV: {
        brackets: [
            { rate: 0.03, upTo: 10000 },
            { rate: 0.04, upTo: 25000 },
            { rate: 0.045, upTo: 40000 },
            { rate: 0.06, upTo: 60000 },
            { rate: 0.065, upTo: Infinity }
        ]
    },
    WI: {
        brackets: [
            { rate: 0.0354, upTo: 12760 },
            { rate: 0.0465, upTo: 25520 },
            { rate: 0.053, upTo: 280950 },
            { rate: 0.0765, upTo: Infinity }
        ]
    },
    WY: { flatRate: 0 } // No state income tax
};

const INCOME_TYPES = {
    REGULAR: 'Regular Income',
    OVERTIME: 'Overtime',
    BONUS: 'Bonus',
    COMMISSION: 'Commission',
    RSU: 'Restricted Stock Units',
    CARRIED_INTEREST: 'Carried Interest',
    PARTNERSHIP: 'Partnership Income',
    CONSULTING: 'Consulting Income'
};

const SPECIAL_TAX_NOTES = {
    CARRIED_INTEREST: 'Carried interest may be taxed as long-term capital gains (20%) if certain holding periods are met.',
    PARTNERSHIP: 'Partnership income may be subject to self-employment tax and quarterly estimated payments.',
    RSU: 'RSUs are taxed as ordinary income when they vest, with additional capital gains implications upon sale.'
};

const RSU_VESTING_TYPES = {
    TIME_BASED: 'Time-based',
    PERFORMANCE: 'Performance-based',
    HYBRID: 'Hybrid'
};

const RSU_VESTING_SCHEDULES = {
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    ANNUAL: 'Annual',
    CUSTOM: 'Custom'
};

// Helper function to safely access pay frequency data
const getPayFrequencyData = (key, property, defaultValue = '') => {
    if (!key || !PAY_FREQUENCIES[key]) {
        console.warn(`Invalid pay frequency key: ${key}`);
        return defaultValue;
    }
    return PAY_FREQUENCIES[key][property] || defaultValue;
};

const SalaryJournal = ({ onSalaryAdded, onSalaryUpdated, onSalaryDeleted }) => {
    const [salaryEntries, setSalaryEntries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');
    const [salaryAmount, setSalaryAmount] = useState('');
    const [dateOfChange, setDateOfChange] = useState('');
    const [notes, setNotes] = useState('');
    const [bonusAmount, setBonusAmount] = useState('');
    const [commissionAmount, setCommissionAmount] = useState('');
    const { token, userId, currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // User management for multiple salary entries
    const [users, setUsers] = useState([
        { id: 'primary', name: 'Primary User', isActive: true }
    ]);
    const [activeUserId, setActiveUserId] = useState('primary');
    const [showUserForm, setShowUserForm] = useState(false);
    const [newUserName, setNewUserName] = useState('');

    // Additional salary information
    const [payType, setPayType] = useState('annual');
    const [basePay, setBasePay] = useState('');
    const [hoursPerWeek, setHoursPerWeek] = useState(40);
    const [payFrequency, setPayFrequency] = useState('BIWEEKLY');
    
    // Additional income
    const [overtime, setOvertime] = useState({ hours: 0, rate: 1.5 });
    const [bonus, setBonus] = useState(0);
    const [commission, setCommission] = useState(0);

    // Pre-tax deductions
    const [preTaxDeductions, setPreTaxDeductions] = useState([
        { id: 1, name: '401(k)', amount: 0, type: 'percentage' },
        { id: 2, name: 'Health Insurance', amount: 0, type: 'fixed' },
        { id: 3, name: 'HSA', amount: 0, type: 'fixed' },
        { id: 4, name: 'FSA', amount: 0, type: 'fixed' }
    ]);

    // Post-tax deductions
    const [postTaxDeductions, setPostTaxDeductions] = useState([
        { id: 1, name: 'Roth 401(k)', amount: 0, type: 'percentage' },
        { id: 2, name: 'Life Insurance', amount: 0, type: 'fixed' }
    ]);

    // Tax information
    const [taxState, setTaxState] = useState('');
    const [allowances, setAllowances] = useState(1);
    const [additionalWithholding, setAdditionalWithholding] = useState(0);

    // Calculated values
    const [calculations, setCalculations] = useState({
        grossPay: 0,
        preTaxDeductionsTotal: 0,
        taxableIncome: 0,
        federalTax: 0,
        stateTax: 0,
        localTax: 0,
        socialSecurity: 0,
        medicare: 0,
        postTaxDeductionsTotal: 0,
        netPay: 0
    });

    // History tracking
    const [payHistory, setPayHistory] = useState([]);
    const [yearToDate, setYearToDate] = useState({
        grossPay: 0,
        netPay: 0,
        federalTax: 0,
        stateTax: 0,
        socialSecurity: 0,
        medicare: 0
    });

    // Update state variables
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cityTaxRate, setCityTaxRate] = useState(0);
    
    // What If Tool state variables
    const [whatIfScenario, setWhatIfScenario] = useState('salary_increase');
    const [whatIfAdjustmentType, setWhatIfAdjustmentType] = useState('percentage');
    const [whatIfValue, setWhatIfValue] = useState('');
    const [whatIfNewState, setWhatIfNewState] = useState('');
    const [whatIfNewCity, setWhatIfNewCity] = useState('');
    const [whatIfHealthInsurance, setWhatIfHealthInsurance] = useState('');
    const [whatIfDentalInsurance, setWhatIfDentalInsurance] = useState('');
    const [whatIfResult, setWhatIfResult] = useState(null);
    
    const [incomeBreakdown, setIncomeBreakdown] = useState([
        { type: INCOME_TYPES.REGULAR, amount: 0 },
        { type: INCOME_TYPES.OVERTIME, hours: 0, rate: 1.5 },
        { type: INCOME_TYPES.BONUS, amount: 0 },
        { type: INCOME_TYPES.COMMISSION, amount: 0 },
        { type: INCOME_TYPES.RSU, amount: 0, vestingSchedule: [] },
        { type: INCOME_TYPES.CARRIED_INTEREST, amount: 0 },
        { type: INCOME_TYPES.PARTNERSHIP, amount: 0 },
        { type: INCOME_TYPES.CONSULTING, amount: 0 }
    ]);

    const [rsuGrants, setRsuGrants] = useState([]);
    const [selectedRsuGrant, setSelectedRsuGrant] = useState(null);
    const [showRsuForm, setShowRsuForm] = useState(false);
    const [rsuForm, setRsuForm] = useState({
        grantDate: '',
        sharesGranted: 0,
        fairMarketValue: 0,
        vestingType: RSU_VESTING_TYPES.TIME_BASED,
        vestingSchedule: RSU_VESTING_SCHEDULES.ANNUAL,
        vestingPeriodYears: 4,
        cliffPeriodMonths: 12,
        customSchedule: [],
        performanceMetrics: [],
        notes: ''
    });

    const [bonusIsPercentage, setBonusIsPercentage] = useState(false);

    // Add missing state variables for benefits
    const [healthInsurance, setHealthInsurance] = useState('0');
    const [dentalInsurance, setDentalInsurance] = useState('0');
    const [visionInsurance, setVisionInsurance] = useState('0'); 
    const [retirement401k, setRetirement401k] = useState('0');

    const [editingEntryId, setEditingEntryId] = useState(null);

    // Handle salary added callback
    const handleSalaryAdded = (newSalary) => {
        if (onSalaryAdded) {
            try {
                onSalaryAdded(newSalary);
                log('SalaryJournal', 'Salary entry added successfully', { id: newSalary.id });
            } catch (error) {
                logError('SalaryJournal', 'Error in onSalaryAdded callback', error);
                toast.error('Error processing new salary entry');
            }
        }
    };

    // Handle salary updated callback
    const handleSalaryUpdated = (updatedSalary) => {
        if (onSalaryUpdated) {
            try {
                onSalaryUpdated(updatedSalary);
                log('SalaryJournal', 'Salary entry updated successfully', { id: updatedSalary.id });
            } catch (error) {
                logError('SalaryJournal', 'Error in onSalaryUpdated callback', error);
                toast.error('Error updating salary entry');
            }
        }
    };

    // Handle salary deleted callback
    const handleSalaryDeleted = (salaryId) => {
        if (onSalaryDeleted) {
            try {
                onSalaryDeleted(salaryId);
                log('SalaryJournal', 'Salary entry deleted successfully', { id: salaryId });
            } catch (error) {
                logError('SalaryJournal', 'Error in onSalaryDeleted callback', error);
                toast.error('Error deleting salary entry');
            }
        }
    };

    const handleEditEntry = (entry) => {
        // Populate the form with the selected entry data
        setCompany(entry.company || '');
        setPosition(entry.position || '');
        setSalaryAmount(entry.salary_amount ? entry.salary_amount.toString() : '');
        setPayType(entry.pay_type || 'annual');
        setPayFrequency(entry.pay_frequency || 'BIWEEKLY');
        setHoursPerWeek(entry.hours_per_week || 40);
        setDateOfChange(entry.date_of_change || '');
        setNotes(entry.notes || '');
        setBonusAmount(entry.bonus_amount ? entry.bonus_amount.toString() : '');
        setCommissionAmount(entry.commission_amount ? entry.commission_amount.toString() : '');
        setHealthInsurance(entry.health_insurance ? entry.health_insurance.toString() : '');
        setDentalInsurance(entry.dental_insurance ? entry.dental_insurance.toString() : '');
        setVisionInsurance(entry.vision_insurance ? entry.vision_insurance.toString() : '');
        setRetirement401k(entry.retirement_401k ? entry.retirement_401k.toString() : '');
        setSelectedState(entry.state || '');
        setSelectedCity(entry.city || '');
        
        // Set editing mode
        setEditingEntryId(entry.id);
        setShowForm(true);
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        resetForm();
        setEditingEntryId(null);
    };

    // Move calculatePaycheck function definition to before the useEffect hooks
    const calculatePaycheck = useCallback(() => {
        try {
            // Get base values
            let gross = 0;
            const basePayValue = parseFloat(basePay) || 0;
            
            // Calculate gross pay based on pay type and frequency
            if (payType === 'hourly') {
                const hoursValue = parseFloat(hoursPerWeek) || 0;
                const periodsPerYear = PAY_FREQUENCIES[payFrequency]?.periodsPerYear || 52;
                
                // For hourly, calculate based on hours per week and pay frequency
                gross = basePayValue * hoursValue * (52 / periodsPerYear);
                
                // Add overtime if applicable
                if (overtime.hours > 0) {
                    const overtimeRate = basePayValue * (overtime.rate || 1.5);
                    const overtimePay = overtimeRate * overtime.hours * (52 / periodsPerYear);
                    gross += overtimePay;
                }
            } else {
                // For salary (annual), divide by number of pay periods
                const periodsPerYear = PAY_FREQUENCIES[payFrequency]?.periodsPerYear || 12;
                gross = basePayValue / periodsPerYear;
            }
            
            // Add bonus and commission
            const bonusValue = parseFloat(bonus) || 0;
            const commissionValue = parseFloat(commission) || 0;
            gross += bonusValue + commissionValue;
            
            // Calculate pre-tax deductions
            const preTaxTotal = preTaxDeductions.reduce((total, deduction) => {
                const amount = parseFloat(deduction.amount) || 0;
                if (deduction.type === 'percentage') {
                    return total + (gross * amount / 100);
                }
                return total + amount;
            }, 0);
            
            // Calculate taxable income
            const taxableIncome = Math.max(0, gross - preTaxTotal);
            
            // Calculate taxes
            let federalTax = 0;
            let stateTax = 0;
            let localTax = 0;
            
            // Federal tax calculation
            const annualizedIncome = taxableIncome * (PAY_FREQUENCIES[payFrequency]?.periodsPerYear || 12);
            federalTax = calculateFederalTax(annualizedIncome) / (PAY_FREQUENCIES[payFrequency]?.periodsPerYear || 12);
            
            // State tax calculation if state is selected
            if (selectedState && STATE_TAX_RATES[selectedState]) {
                if (STATE_TAX_RATES[selectedState].flatRate !== undefined) {
                    stateTax = taxableIncome * STATE_TAX_RATES[selectedState].flatRate;
                } else if (STATE_TAX_RATES[selectedState].brackets) {
                    stateTax = calculateProgressiveTax(
                        annualizedIncome, 
                        STATE_TAX_RATES[selectedState].brackets
                    ) / (PAY_FREQUENCIES[payFrequency]?.periodsPerYear || 12);
                }
            }
            
            // Local/city tax calculation if applicable
            if (selectedState && selectedCity && 
                STATE_TAX_RATES[selectedState]?.cities?.[selectedCity]) {
                const cityRates = STATE_TAX_RATES[selectedState].cities[selectedCity];
                
                if (cityRates.flatRate !== undefined) {
                    localTax = taxableIncome * cityRates.flatRate;
                } else if (cityRates.brackets) {
                    localTax = calculateProgressiveTax(
                        annualizedIncome, 
                        cityRates.brackets
                    ) / (PAY_FREQUENCIES[payFrequency]?.periodsPerYear || 12);
                } else if (cityRates.residentRate !== undefined) {
                    // For cities with separate resident rates like Philadelphia
                    localTax = taxableIncome * cityRates.residentRate;
                }
            }
            
            // Calculate FICA taxes (Social Security and Medicare)
            const annualizedGross = gross * (PAY_FREQUENCIES[payFrequency]?.periodsPerYear || 12);
            const ssTaxRate = TAX_BRACKETS_2024.FICA.socialSecurity.rate;
            const ssWageBase = TAX_BRACKETS_2024.FICA.socialSecurity.wageBase;
            const medicareTaxRate = TAX_BRACKETS_2024.FICA.medicare.rate;
            
            // Calculate Social Security (subject to wage base limit)
            let socialSecurityTax = taxableIncome * ssTaxRate;
            
            // Adjust for annual wage base limit
            if (annualizedGross > ssWageBase) {
                // Complex calculation to adjust for the wage base within the pay period
                const adjustment = Math.max(0, (annualizedGross - ssWageBase) / annualizedGross);
                socialSecurityTax *= (1 - adjustment);
            }
            
            // Calculate Medicare (no wage base limit)
            let medicareTax = taxableIncome * medicareTaxRate;
            
            // Additional Medicare tax for high earners
            if (annualizedGross > TAX_BRACKETS_2024.FICA.medicare.threshold) {
                const additionalMedicareTaxRate = TAX_BRACKETS_2024.FICA.medicare.additionalRate;
                const additionalMedicareTax = Math.max(0, (annualizedGross - TAX_BRACKETS_2024.FICA.medicare.threshold)) 
                    * additionalMedicareTaxRate / (PAY_FREQUENCIES[payFrequency]?.periodsPerYear || 12);
                medicareTax += additionalMedicareTax;
            }
            
            // Calculate post-tax deductions
            const postTaxTotal = postTaxDeductions.reduce((total, deduction) => {
                const amount = parseFloat(deduction.amount) || 0;
                if (deduction.type === 'percentage') {
                    return total + (gross * amount / 100);
                }
                return total + amount;
            }, 0);
            
            // Calculate net pay
            const totalTax = federalTax + stateTax + localTax + socialSecurityTax + medicareTax;
            const netPay = gross - preTaxTotal - totalTax - postTaxTotal;
            
            return {
                grossPay: gross,
                preTaxDeductionsTotal: preTaxTotal,
                taxableIncome,
                federalTax,
                stateTax,
                localTax,
                socialSecurity: socialSecurityTax,
                medicare: medicareTax,
                totalTax,
                postTaxDeductionsTotal: postTaxTotal,
                netPay
            };
        } catch (error) {
            console.error('Error in calculatePaycheck:', error);
            return {
                grossPay: 0,
                preTaxDeductionsTotal: 0,
                taxableIncome: 0,
                federalTax: 0,
                stateTax: 0, 
                localTax: 0,
                socialSecurity: 0,
                medicare: 0,
                totalTax: 0,
                postTaxDeductionsTotal: 0,
                netPay: 0
            };
        }
    }, [basePay, payType, payFrequency, hoursPerWeek, overtime, bonus, commission, 
        preTaxDeductions, postTaxDeductions, selectedState, selectedCity]);

    const fetchSalaryEntries = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/api/salary-journal', {
                params: {
                    userProfileId: activeUserId
                }
            });
            
            if (response.data) {
                setSalaryEntries(response.data);
                localStorage.setItem(`salary_entries_${activeUserId}`, JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Error fetching salary entries:', error);
            toast.error('Failed to fetch salary entries');
            
            // Try to load from localStorage as fallback
            const storedEntries = localStorage.getItem(`salary_entries_${activeUserId}`);
            if (storedEntries) {
                setSalaryEntries(JSON.parse(storedEntries));
            }
        } finally {
            setLoading(false);
        }
    };

    // Now use the functions in useEffect hooks
    useEffect(() => {
        fetchSalaryEntries();
    }, [fetchSalaryEntries]); 

    useEffect(() => {
        if (salaryEntries.length > 0) {
            // Sort entries by date to get the most recent
            const sortedEntries = [...salaryEntries].sort((a, b) => 
                new Date(b.date_of_change) - new Date(a.date_of_change)
            );
            const mostRecent = sortedEntries[0];

            // Set default values without triggering calculation
            setBasePay(mostRecent.salary_amount.toString());
            setPayType('annual');
            setBonusAmount(mostRecent.bonus_amount?.toString() || '0');
            setCommissionAmount(mostRecent.commission_amount?.toString() || '0');
        }
    }, [salaryEntries]); 

    useEffect(() => {
        const calculateAndSetResults = () => {
            if (basePay) {
                const result = calculatePaycheck();
                setCalculations(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(result)) {
                        // Update year-to-date values
                        setYearToDate(ytd => ({
                            grossPay: ytd.grossPay + result.grossPay,
                            netPay: ytd.netPay + result.netPay,
                            federalTax: ytd.federalTax + result.federalTax,
                            stateTax: ytd.stateTax + result.stateTax,
                            socialSecurity: ytd.socialSecurity + result.socialSecurity,
                            medicare: ytd.medicare + result.medicare
                        }));
                        return result;
                    }
                    return prev;
                });
            }
        };

        calculateAndSetResults();
    }, [calculatePaycheck]); 

    const switchActiveUser = (userId) => {
        setActiveUserId(userId);
        setUsers(users.map(user => ({
            ...user,
            isActive: user.id === userId
        })));
    };

    const removeUser = (userId) => {
        if (userId === 'primary') {
            toast.error('Cannot remove the primary user');
            return;
        }

        if (activeUserId === userId) {
            setActiveUserId('primary');
        }

        setUsers(users.filter(user => user.id !== userId));
        toast.success('User removed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const salaryEntry = {
                company,
                position,
                salary_amount: parseFloat(salaryAmount),
                date_of_change: dateOfChange,
                notes,
                bonus_amount: parseFloat(bonusAmount) || 0,
                commission_amount: parseFloat(commissionAmount) || 0,
                user_profile_id: activeUserId,
                pay_type: payType,
                pay_frequency: payFrequency,
                hours_per_week: parseFloat(hoursPerWeek),
                health_insurance: parseFloat(healthInsurance) || 0,
                dental_insurance: parseFloat(dentalInsurance) || 0,
                vision_insurance: parseFloat(visionInsurance) || 0,
                retirement_401k: parseFloat(retirement401k) || 0,
                state: selectedState,
                city: selectedCity
            };

            let response;
            
            if (editingEntryId) {
                console.log('Updating existing entry:', editingEntryId);
                response = await apiService.put(`/api/salary-journal/${editingEntryId}`, salaryEntry);
                
                if (response.status === 200) {
                    toast.success('Salary entry updated successfully!');
                    
                    // Update the entry in the local state
                    const updatedEntries = salaryEntries.map(entry => 
                        entry.id === editingEntryId ? { ...salaryEntry, id: editingEntryId } : entry
                    );
                    setSalaryEntries(updatedEntries);
                    
                    // Update localStorage
                    localStorage.setItem(`salary_entries_${activeUserId}`, JSON.stringify(updatedEntries));
                    
                    // Call the parent callback if provided
                    if (onSalaryUpdated) onSalaryUpdated(salaryEntry);
                    
                    resetForm();
                    setEditingEntryId(null);
                }
            } else {
                console.log('Creating new salary entry:', salaryEntry);
                response = await apiService.post('/api/salary-journal', salaryEntry);
                
                if (response.status === 200 || response.status === 201) {
                    toast.success('Salary entry created successfully!');
                    
                    // Get the ID from the response
                    const newEntryWithId = response.data.data || { ...salaryEntry, id: `local_${Date.now()}` };
                    
                    // Update the entries list
                    const updatedEntries = [newEntryWithId, ...salaryEntries];
                    setSalaryEntries(updatedEntries);
                    
                    // Update localStorage
                    localStorage.setItem(`salary_entries_${activeUserId}`, JSON.stringify(updatedEntries));
                    
                    // Call the parent callback if provided
                    if (onSalaryAdded) onSalaryAdded(newEntryWithId);
                    
                    resetForm();
                }
            }
            
            fetchSalaryEntries(); // Refresh the list
        } catch (error) {
            console.error('Error submitting salary entry:', error);
            toast.error('Failed to save salary entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCompany('');
        setPosition('');
        setSalaryAmount('');
        setDateOfChange('');
        setNotes('');
        setBonusAmount('');
        setCommissionAmount('');
        setShowForm(false);
    };

    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return '';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const prepareChartData = (entries) => {
        // Sort entries by date
        const sortedEntries = [...entries].sort((a, b) => {
            return new Date(a.date_of_change) - new Date(b.date_of_change);
        });
        
        const labels = sortedEntries.map(entry => {
            const date = new Date(entry.date_of_change);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        
        // Calculate total compensation (salary + bonus + commission)
        const totalCompensationData = sortedEntries.map(entry => {
            const salary = entry.salary_amount || 0;
            const bonus = entry.bonus_amount || 0;
            const commission = entry.commission_amount || 0;
            return salary + bonus + commission;
        });
        
        // Create a simpler data structure with just total compensation
        return {
            labels,
            datasets: [
                {
                    label: 'Total Compensation',
                    data: totalCompensationData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1,
                    fill: false
                }
            ]
        };
    };

    const getChartOptions = (entries) => ({
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    // Format y-axis labels as currency
                    callback: function(value) {
                        return formatCurrency(value);
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        
                        // Get the entry for this data point
                        const sortedEntries = [...entries].sort((a, b) => {
                            return new Date(a.date_of_change) - new Date(b.date_of_change);
                        });
                        const entry = sortedEntries[context.dataIndex];
                        
                        if (entry) {
                            // Build a more detailed tooltip
                            const lines = [];
                            lines.push(`Base Salary: ${formatCurrency(entry.salary_amount || 0)}`);
                            
                            if (entry.bonus_amount > 0) {
                                lines.push(`Bonus: ${formatCurrency(entry.bonus_amount)}`);
                            }
                            
                            if (entry.commission_amount > 0) {
                                lines.push(`Commission: ${formatCurrency(entry.commission_amount)}`);
                            }
                            
                            lines.push(`Total: ${formatCurrency(context.parsed.y)}`);
                            
                            return lines;
                        }
                        
                        return label + formatCurrency(context.parsed.y);
                    }
                }
            },
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Compensation History'
            },
        }
    });

    const calculateAnnualSalary = () => {
        if (payType === 'hourly') {
            return parseFloat(basePay) * hoursPerWeek * 52;
        }
        // If annual, return as is, otherwise convert based on pay frequency
        return payType === 'annual' ? parseFloat(basePay) : parseFloat(basePay) * getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
    };

    const calculateGrossPay = () => {
        const annualSalary = calculateAnnualSalary();
        const periodsPerYear = getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
        
        // Base pay per period
        let grossPay = annualSalary / periodsPerYear;
        
        // Add overtime, if any
        if (overtime.hours > 0) {
            grossPay += (parseFloat(basePay) * overtime.rate * overtime.hours);
        }
        
        return grossPay;
    };

    const calculatePreTaxDeductions = (grossPay) => {
        return preTaxDeductions.reduce((total, deduction) => {
            if (deduction.type === 'percentage') {
                return total + (grossPay * (deduction.amount / 100));
            }
            return total + deduction.amount;
        }, 0);
    };

    const calculatePostTaxDeductions = (grossPay) => {
        return postTaxDeductions.reduce((total, deduction) => {
            if (deduction.type === 'percentage') {
                return total + (grossPay * (deduction.amount / 100));
            }
            return total + deduction.amount;
        }, 0);
    };

    const calculateFederalTax = (taxableIncome) => {
        // Convert to annual for bracket calculation
        const annualTaxableIncome = taxableIncome * getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
        let tax = 0;
        
        for (const bracket of TAX_BRACKETS_2024.FEDERAL) {
            const prevBracket = TAX_BRACKETS_2024.FEDERAL[TAX_BRACKETS_2024.FEDERAL.indexOf(bracket) - 1];
            const bracketStart = prevBracket ? prevBracket.upTo : 0;
            const bracketAmount = Math.min(annualTaxableIncome, bracket.upTo) - bracketStart;
            
            if (bracketAmount > 0) {
                tax += bracketAmount * bracket.rate;
            }
            
            if (annualTaxableIncome <= bracket.upTo) {
                break;
            }
        }
        
        // Convert back to pay period amount
        return tax / getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
    };
    
    const calculateFICA = (taxableIncome) => {
        // Convert to annual for limit calculations
        const annualTaxableIncome = taxableIncome * getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
        const { socialSecurity, medicare } = TAX_BRACKETS_2024.FICA;
        
        // Calculate Social Security (capped at wage base)
        const ssTaxableIncome = Math.min(annualTaxableIncome, socialSecurity.wageBase);
        const ssTax = ssTaxableIncome * socialSecurity.rate;
        
        // Calculate Medicare (additional rate for high earners)
        let medicareTax = annualTaxableIncome * medicare.rate;
        if (annualTaxableIncome > medicare.threshold) {
            medicareTax += (annualTaxableIncome - medicare.threshold) * medicare.additionalRate;
        }
        
        return {
            socialSecurity: ssTax / getPayFrequencyData(payFrequency, 'periodsPerYear', 26),
            medicare: medicareTax / getPayFrequencyData(payFrequency, 'periodsPerYear', 26)
        };
    };

    const calculateStateTax = (taxableIncome) => {
        if (!selectedState || !STATE_TAX_RATES[selectedState]) {
            return 0;
        }

        // Convert to annual for bracket calculation
        const annualTaxableIncome = taxableIncome * getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
        let tax = 0;

        const stateData = STATE_TAX_RATES[selectedState];

        // Handle flat rate states
        if (stateData.flatRate !== undefined) {
            tax = annualTaxableIncome * stateData.flatRate;
        } 
        // Handle bracket states
        else if (stateData.brackets) {
            let previousThreshold = 0;
            
            for (const bracket of stateData.brackets) {
                const taxableInBracket = Math.min(annualTaxableIncome, bracket.upTo) - previousThreshold;
                
                if (taxableInBracket > 0) {
                    tax += taxableInBracket * bracket.rate;
                }
                
                if (annualTaxableIncome <= bracket.upTo) {
                    break;
                }
                
                previousThreshold = bracket.upTo;
            }
        }

        // Convert back to pay period amount
        return tax / getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
    };

    // Calculate city tax based on selected city
    const calculateCityTax = (taxableIncome) => {
        if (!selectedState || !selectedCity || 
            !STATE_TAX_RATES[selectedState] || 
            !STATE_TAX_RATES[selectedState].cities || 
            !STATE_TAX_RATES[selectedState].cities[selectedCity]) {
            return 0;
        }

        const cityTaxRate = STATE_TAX_RATES[selectedState].cities[selectedCity].rate;
        return taxableIncome * cityTaxRate;
    };

    // Helper function to calculate progressive tax based on brackets
    const calculateProgressiveTax = (taxableIncome, brackets) => {
        let tax = 0;
        let previousBracketLimit = 0;
        
        // Sort brackets by income threshold ascending
        const sortedBrackets = [...brackets].sort((a, b) => a.income - b.income);
        
        for (const bracket of sortedBrackets) {
            if (taxableIncome > bracket.income) {
                const taxableAmountInBracket = Math.min(taxableIncome, bracket.income) - previousBracketLimit;
                tax += taxableAmountInBracket * bracket.rate;
                previousBracketLimit = bracket.income;
            } else {
                break;
            }
        }
        
        return tax;
    };
    
    const calculateLocalTax = (taxableIncome) => {
        // Skip if no state or city selected
        if (!selectedState || !selectedCity) return 0;
        
        // Get state tax rates and check if city has tax info
        const stateTax = STATE_TAX_RATES[selectedState];
        if (!stateTax || !stateTax.cities || !stateTax.cities[selectedCity]) return 0;
        
        const cityTax = stateTax.cities[selectedCity];
        const annualTaxableIncome = taxableIncome * getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
        
        if (cityTax) {
            // Some cities have flat rates, others have brackets
            if (cityTax.flatRate) {
                return annualTaxableIncome * cityTax.flatRate / getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
            } else if (cityTax.payrollTax) {
                return (annualTaxableIncome * cityTax.payrollTax) / getPayFrequencyData(payFrequency, 'periodsPerYear', 26);
            } else if (cityTax.brackets) {
                return calculateProgressiveTax(taxableIncome, cityTax.brackets);
            }
        }
        
        return 0;
    };

    // Rename this to avoid duplication with the useCallback version
    const calculateSimplePaycheck = () => {
        const grossPay = calculateGrossPay();
        const preTaxDeductionsTotal = calculatePreTaxDeductions(grossPay);
        const taxableIncome = grossPay - preTaxDeductionsTotal;
        const federalTax = calculateFederalTax(taxableIncome);
        const stateTax = calculateStateTax(taxableIncome);
        const localTax = calculateLocalTax(taxableIncome);
        const fica = calculateFICA(taxableIncome);
        const postTaxDeductionsTotal = calculatePostTaxDeductions(grossPay);

        return {
            grossPay,
            preTaxDeductionsTotal,
            taxableIncome,
            federalTax,
            stateTax,
            localTax,
            socialSecurity: fica.socialSecurity,
            medicare: fica.medicare,
            postTaxDeductionsTotal,
            netPay: taxableIncome - federalTax - stateTax - localTax - 
                    fica.socialSecurity - fica.medicare - postTaxDeductionsTotal
        };
    };

    const handleSave = async () => {
        // Also update reference here
        const paycheck = calculateSimplePaycheck();
        const newEntry = {
            ...paycheck,
            payType,
            basePay,
            payFrequency,
            date: new Date().toISOString(),
            id: Date.now().toString(), // Generate a local ID
            userProfileId: activeUserId
        };
        
        try {
            // Optimistically update UI first
            const updatedEntries = [...salaryEntries, newEntry];
            
            // Save locally first
            localStorage.setItem(`salary_entries_${activeUserId}`, JSON.stringify(updatedEntries));
            
            // Update state
            setSalaryEntries(updatedEntries);
            
            // Notify the parent component if the callback is provided
            if (typeof onSalaryAdded === 'function') {
                onSalaryAdded(newEntry);
            }
            
            // Then try to save to API
            try {
                const response = await apiService.post('/api/salary/save', newEntry);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Paycheck saved successfully');
                    
                    // Update with the server-generated ID if provided
                    if (response.data && response.data.id) {
                        const entriesWithServerIds = updatedEntries.map(entry => 
                            entry.id === newEntry.id ? { ...entry, id: response.data.id } : entry
                        );
                        localStorage.setItem(`salary_entries_${activeUserId}`, JSON.stringify(entriesWithServerIds));
                        setSalaryEntries(entriesWithServerIds);
                    }
                }
            } catch (apiError) {
                console.error('API Error saving paycheck:', apiError);
                toast.warning('Paycheck saved locally. Will sync when connection is restored.');
            }
        } catch (error) {
            console.error('Error in handleSave:', error);
            toast.error('Failed to save paycheck');
        }
    };

    const calculateRsuVestingSchedule = (grant) => {
        const schedule = [];
        const grantDate = new Date(grant.grantDate);
        const sharesPerPeriod = grant.sharesGranted / (grant.vestingPeriodYears * getPeriodsPerYear(grant.vestingSchedule));
        
        if (grant.vestingType === RSU_VESTING_TYPES.TIME_BASED) {
            const cliffDate = new Date(grantDate);
            cliffDate.setMonth(cliffDate.getMonth() + grant.cliffPeriodMonths);
            
            // Calculate cliff vesting
            if (grant.cliffPeriodMonths > 0) {
                schedule.push({
                    date: cliffDate,
                    shares: sharesPerPeriod * (grant.cliffPeriodMonths / 12),
                    type: 'Cliff'
                });
            }

            // Calculate regular vesting periods
            const periodsPerYear = getPeriodsPerYear(grant.vestingSchedule);
            const totalPeriods = grant.vestingPeriodYears * periodsPerYear;
            
            for (let i = 1; i <= totalPeriods; i++) {
                const vestingDate = new Date(grantDate);
                if (grant.vestingSchedule === RSU_VESTING_SCHEDULES.MONTHLY) {
                    vestingDate.setMonth(vestingDate.getMonth() + i);
                } else if (grant.vestingSchedule === RSU_VESTING_SCHEDULES.QUARTERLY) {
                    vestingDate.setMonth(vestingDate.getMonth() + (i * 3));
                } else {
                    vestingDate.setFullYear(vestingDate.getFullYear() + i);
                }

                if (vestingDate > cliffDate) {
                    schedule.push({
                        date: vestingDate,
                        shares: sharesPerPeriod,
                        type: 'Regular'
                    });
                }
            }
        } else if (grant.vestingType === RSU_VESTING_TYPES.CUSTOM) {
            return grant.customSchedule;
        }

        return schedule;
    };

    const getPeriodsPerYear = (schedule) => {
        switch (schedule) {
            case RSU_VESTING_SCHEDULES.MONTHLY:
                return 12;
            case RSU_VESTING_SCHEDULES.QUARTERLY:
                return 4;
            case RSU_VESTING_SCHEDULES.ANNUAL:
                return 1;
            default:
                return 4; // Default to quarterly
        }
    };

    const renderRsuForm = () => (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">RSU Grant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grant Date
                    </label>
                    <input
                        type="date"
                        value={rsuForm.grantDate}
                        onChange={(e) => setRsuForm({ ...rsuForm, grantDate: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shares Granted
                    </label>
                    <input
                        type="number"
                        value={rsuForm.sharesGranted}
                        onChange={(e) => setRsuForm({ ...rsuForm, sharesGranted: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fair Market Value (at grant)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            value={rsuForm.fairMarketValue}
                            onChange={(e) => setRsuForm({ ...rsuForm, fairMarketValue: parseFloat(e.target.value) || 0 })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vesting Type
                    </label>
                    <select
                        value={rsuForm.vestingType}
                        onChange={(e) => setRsuForm({ ...rsuForm, vestingType: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {Object.entries(RSU_VESTING_TYPES).map(([key, value]) => (
                            <option key={key} value={value}>{value}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vesting Schedule
                    </label>
                    <select
                        value={rsuForm.vestingSchedule}
                        onChange={(e) => setRsuForm({ ...rsuForm, vestingSchedule: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {Object.entries(RSU_VESTING_SCHEDULES).map(([key, value]) => (
                            <option key={key} value={value}>{value}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vesting Period (Years)
                    </label>
                    <input
                        type="number"
                        value={rsuForm.vestingPeriodYears}
                        onChange={(e) => setRsuForm({ ...rsuForm, vestingPeriodYears: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cliff Period (Months)
                    </label>
                    <input
                        type="number"
                        value={rsuForm.cliffPeriodMonths}
                        onChange={(e) => setRsuForm({ ...rsuForm, cliffPeriodMonths: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            {rsuForm.vestingType === RSU_VESTING_TYPES.PERFORMANCE && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Performance Metrics
                    </label>
                    <textarea
                        value={rsuForm.performanceMetrics.join('\n')}
                        onChange={(e) => setRsuForm({ ...rsuForm, performanceMetrics: e.target.value.split('\n') })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter performance metrics (one per line)"
                    />
                </div>
            )}

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                </label>
                <textarea
                    value={rsuForm.notes}
                    onChange={(e) => setRsuForm({ ...rsuForm, notes: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                />
            </div>

            <div className="mt-6 flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => setShowRsuForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleRsuSubmit}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Save RSU Grant
                </button>
            </div>
        </div>
    );

    const renderRsuVestingSchedule = () => {
        if (!selectedRsuGrant) return null;

        const schedule = calculateRsuVestingSchedule(selectedRsuGrant);
        const totalValue = selectedRsuGrant.sharesGranted * selectedRsuGrant.fairMarketValue;

        return (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vesting Schedule</h3>
                <div className="mb-4">
                    <p className="text-sm text-gray-500">Total Grant Value</p>
                    <p className="text-lg font-semibold">{formatCurrency(totalValue)}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vesting Date
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Shares
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value at Grant
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schedule.map((period, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(period.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {period.shares.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(period.shares * selectedRsuGrant.fairMarketValue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {period.type}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const handleRsuSubmit = async () => {
        try {
            const newGrant = {
                ...rsuForm,
                vestingSchedule: calculateRsuVestingSchedule(rsuForm)
            };
            
            setRsuGrants([...rsuGrants, newGrant]);
            setSelectedRsuGrant(newGrant);
            setShowRsuForm(false);
            toast.success('RSU grant added successfully');
        } catch (error) {
            console.error('Error adding RSU grant:', error);
            toast.error('Failed to add RSU grant');
        }
    };

    const calculateNetIncome = (entry) => {
        if (entry.payType && entry.basePay) {
            // Use existing paycheck calculation if detailed info exists
            return entry.netPay;
        }
        
        // Calculate estimated net income for entries without detailed breakdown
        const annualSalary = entry.salary_amount;
        const totalCompensation = annualSalary + (entry.bonus_amount || 0) + (entry.commission_amount || 0);
        
        // Calculate federal tax using 2024 brackets
        let federalTax = 0;
        let remainingIncome = totalCompensation;
        
        for (const bracket of TAX_BRACKETS_2024.FEDERAL) {
            const prevBracket = TAX_BRACKETS_2024.FEDERAL.indexOf(bracket) > 0 
                ? TAX_BRACKETS_2024.FEDERAL[TAX_BRACKETS_2024.FEDERAL.indexOf(bracket) - 1].upTo 
                : 0;
            const bracketIncome = Math.min(remainingIncome, bracket.upTo - prevBracket);
            
            if (bracketIncome <= 0) break;
            
            federalTax += bracketIncome * bracket.rate;
            remainingIncome -= bracketIncome;
        }
        
        // Calculate FICA
        const socialSecurity = Math.min(totalCompensation, TAX_BRACKETS_2024.FICA.socialSecurity.wageBase) 
            * TAX_BRACKETS_2024.FICA.socialSecurity.rate;
        
        const medicare = totalCompensation * TAX_BRACKETS_2024.FICA.medicare.rate;
        const additionalMedicare = totalCompensation > TAX_BRACKETS_2024.FICA.medicare.threshold 
            ? (totalCompensation - TAX_BRACKETS_2024.FICA.medicare.threshold) * TAX_BRACKETS_2024.FICA.medicare.additionalRate 
            : 0;
        
        // Calculate net income
        const totalTax = federalTax + socialSecurity + medicare + additionalMedicare;
        return totalCompensation - totalTax;
    };

    // Calculate bonus amount based on whether it's a percentage or flat amount
    const calculateBonusAmount = () => {
        if (bonusIsPercentage) {
            const baseAmount = parseFloat(salaryAmount) || 0;
            const percentage = parseFloat(bonusAmount) || 0;
            return (baseAmount * percentage) / 100;
        } else {
            return parseFloat(bonusAmount) || 0;
        }
    };

    const calculateNetPay = () => {
        // Return calculated net pay
        return calculateGrossPay() - calculateFederalTax() - calculateStateTax() - calculateCityTax() - calculateFICA() - calculatePreTaxDeductions();
    };
    
    // Calculate What If Scenario
    const calculateWhatIfScenario = () => {
        let newGrossPay = calculateGrossPay();
        let newStateTaxRate = selectedState ? STATE_TAX_RATES[selectedState].rate : 0;
        let newCityTaxRate = 0;
        let new401kContribution = preTaxDeductions.find(d => d.name === '401(k)')?.amount || 0;
        let newHealthInsurance = preTaxDeductions.find(d => d.name === 'Health Insurance')?.amount || 0;
        let newDentalInsurance = preTaxDeductions.find(d => d.name === 'Dental Insurance')?.amount || 0;
        
        // Handle different scenario types
        switch(whatIfScenario) {
            case 'salary_increase':
                if (whatIfAdjustmentType === 'percentage') {
                    const percentIncrease = parseFloat(whatIfValue) || 0;
                    newGrossPay = calculateGrossPay() * (1 + percentIncrease / 100);
                } else {
                    const amountIncrease = parseFloat(whatIfValue) || 0;
                    newGrossPay = calculateGrossPay() + amountIncrease;
                }
                break;
                
            case 'salary_decrease':
                if (whatIfAdjustmentType === 'percentage') {
                    const percentDecrease = parseFloat(whatIfValue) || 0;
                    newGrossPay = calculateGrossPay() * (1 - percentDecrease / 100);
                } else {
                    const amountDecrease = parseFloat(whatIfValue) || 0;
                    newGrossPay = calculateGrossPay() - amountDecrease;
                }
                break;
                
            case 'change_401k':
                new401kContribution = parseFloat(whatIfValue) || 0;
                break;
                
            case 'change_state':
                if (whatIfNewState) {
                    newStateTaxRate = STATE_TAX_RATES[whatIfNewState].rate;
                    
                    if (whatIfNewCity && STATE_TAX_RATES[whatIfNewState]?.cities && 
                        STATE_TAX_RATES[whatIfNewState].cities[whatIfNewCity]) {
                        newCityTaxRate = STATE_TAX_RATES[whatIfNewState].cities[whatIfNewCity].rate;
                    }
                }
                break;
                
            case 'change_benefits':
                newHealthInsurance = parseFloat(whatIfHealthInsurance) || 0;
                newDentalInsurance = parseFloat(whatIfDentalInsurance) || 0;
                break;
                
            default:
                break;
        }
        
        // Calculate new pre-tax deductions
        const newPreTaxDeductions = [
            { id: 1, name: '401(k)', amount: new401kContribution, type: 'percentage' },
            { id: 2, name: 'Health Insurance', amount: newHealthInsurance, type: 'fixed' },
            { id: 3, name: 'Dental Insurance', amount: newDentalInsurance, type: 'fixed' },
        ];
        
        // Calculate new pre-tax deductions total
        const newPreTaxDeductionsTotal = newPreTaxDeductions.reduce((total, deduction) => {
            if (deduction.type === 'percentage') {
                return total + (newGrossPay * deduction.amount / 100);
            } else {
                return total + deduction.amount;
            }
        }, 0);
        
        // Calculate taxable income
        const newTaxableIncome = newGrossPay - newPreTaxDeductionsTotal;
        
        // Calculate new federal tax
        const newFederalTax = calculateProgressiveTax(newTaxableIncome, TAX_BRACKETS_2024.FEDERAL);
        
        // Calculate new state tax
        const newStateTax = newStateTaxRate * newTaxableIncome;
        
        // Calculate new city tax
        const newCityTax = newCityTaxRate * newTaxableIncome;
        
        // Calculate new FICA taxes
        const newSocialSecurity = Math.min(newTaxableIncome * 0.062, 160200 / PAY_FREQUENCIES[payFrequency].periodsPerYear * 0.062);
        const newMedicare = newTaxableIncome * 0.0145;
        
        // Calculate new post-tax deductions
        const newPostTaxDeductionsTotal = postTaxDeductions.reduce((total, deduction) => {
            return total + deduction.amount;
        }, 0);
        
        // Calculate new net pay
        const newNetPay = newTaxableIncome - newFederalTax - newStateTax - newCityTax - newSocialSecurity - newMedicare - newPostTaxDeductionsTotal;
        
        // Set result
        setWhatIfResult({
            grossPay: newGrossPay,
            federalTax: newFederalTax,
            stateTax: newStateTax,
            localTax: newCityTax,
            socialSecurity: newSocialSecurity,
            medicare: newMedicare,
            preTaxDeductionsTotal: newPreTaxDeductionsTotal,
            postTaxDeductionsTotal: newPostTaxDeductionsTotal,
            netPay: newNetPay
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Salary Journal</h1>
            
            {/* User selector and add new user button */}
            <div className="flex items-center space-x-2 mb-6">
                <label className="font-medium">User:</label>
                <select
                    className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={activeUserId}
                    onChange={(e) => switchActiveUser(e.target.value)}
                >
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => setShowUserForm(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add User
                </button>
            </div>

            {/* Salary History Chart - Enhanced with better empty state */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Compensation History</h2>
                
                {salaryEntries.length > 0 ? (
                    <Line data={prepareChartData(salaryEntries)} options={getChartOptions(salaryEntries)} />
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="mt-2 text-xl font-medium text-gray-900">Oh no! You haven't entered any salary details yet.</h3>
                        <p className="mt-1 text-gray-500">Use the form above to add your salary information.</p>
                        <button 
                            onClick={() => setShowForm(true)}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Salary Entry
                        </button>
                    </div>
                )}
            </div>

            {/* Add Salary Form Button */}
            <div className="text-right mb-6">
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (editingEntryId && !showForm) {
                            setEditingEntryId(null);
                            resetForm();
                        }
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {showForm ? 'Cancel' : 'Add Salary Entry'}
                </button>
            </div>

            {/* Add Salary Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {/* Form Title */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-700">
                            {editingEntryId ? 'Edit Salary Entry' : 'Add New Salary Entry'}
                        </h3>
                        
                        {editingEntryId && (
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setEditingEntryId(null);
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                    
                    {/* Required Fields */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Required Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salaryAmount">
                                    Salary Amount*
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input 
                                        className="pl-7 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                        id="salaryAmount" 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={salaryAmount} 
                                        onChange={(e) => setSalaryAmount(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payType">
                                    Pay Type*
                                </label>
                                <select
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="payType"
                                    value={payType}
                                    onChange={(e) => setPayType(e.target.value)}
                                    required
                                >
                                    <option value="annual">Annual Salary</option>
                                    <option value="hourly">Hourly Rate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfChange">
                                    Start Date*
                                </label>
                                <input 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id="dateOfChange" 
                                    type="date" 
                                    value={dateOfChange} 
                                    onChange={(e) => setDateOfChange(e.target.value)}
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payFrequency">
                                    Desired Pay Frequency for Net Income*
                                </label>
                                <select
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="payFrequency"
                                    value={payFrequency}
                                    onChange={(e) => setPayFrequency(e.target.value)}
                                    required
                                >
                                    {Object.entries(PAY_FREQUENCIES).map(([key, { label }]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {payType === 'hourly' && (
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hoursPerWeek">
                                        Hours per Week*
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="hoursPerWeek"
                                        type="number"
                                        placeholder="40"
                                        value={hoursPerWeek}
                                        onChange={(e) => setHoursPerWeek(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Additional Information (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                                    Company
                                </label>
                                <input 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id="company" 
                                    type="text" 
                                    placeholder="Company Name" 
                                    value={company} 
                                    onChange={(e) => setCompany(e.target.value)} 
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                                    Position
                                </label>
                                <input 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id="position" 
                                    type="text" 
                                    placeholder="Position Title" 
                                    value={position} 
                                    onChange={(e) => setPosition(e.target.value)} 
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bonusAmount">
                                    Annual Bonus
                                </label>
                                <div className="flex items-center mb-2">
                                    <label className="inline-flex items-center mr-4">
                                        <input 
                                            type="radio" 
                                            name="bonusType" 
                                            value="flat" 
                                            checked={!bonusIsPercentage}
                                            onChange={() => setBonusIsPercentage(false)} 
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Flat Amount</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            name="bonusType" 
                                            value="percentage" 
                                            checked={bonusIsPercentage}
                                            onChange={() => setBonusIsPercentage(true)} 
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Percentage</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">{bonusIsPercentage ? '%' : '$'}</span>
                                    </div>
                                    <input 
                                        className="pl-7 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                        id="bonusAmount" 
                                        type="number" 
                                        placeholder={bonusIsPercentage ? "0" : "0.00"} 
                                        value={bonusAmount} 
                                        onChange={(e) => setBonusAmount(e.target.value)} 
                                    />
                                </div>
                                {bonusIsPercentage && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Estimated bonus: {formatCurrency(calculateBonusAmount())}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                                    Notes
                                </label>
                                <textarea 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id="notes" 
                                    placeholder="Additional notes..." 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location for Tax Calculation */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Location for Tax Calculation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taxState">
                                    State
                                </label>
                                <select
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="taxState"
                                    value={selectedState}
                                    onChange={(e) => {
                                        setSelectedState(e.target.value);
                                        setSelectedCity(''); // Reset city when state changes
                                    }}
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(STATE_TAX_RATES).map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taxCity">
                                    City
                                </label>
                                <select
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="taxCity"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    disabled={!selectedState || !STATE_TAX_RATES[selectedState]?.cities}
                                >
                                    <option value="">Select City</option>
                                    {selectedState && STATE_TAX_RATES[selectedState]?.cities && 
                                        Object.keys(STATE_TAX_RATES[selectedState].cities).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))
                                    }
                                </select>
                                {!selectedState && 
                                    <p className="text-sm text-gray-500 mt-1">Please select a state first</p>
                                }
                                {selectedState && !STATE_TAX_RATES[selectedState]?.cities && 
                                    <p className="text-sm text-gray-500 mt-1">No city-specific taxes in selected state</p>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Preview Net Income */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Net Income Preview</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Gross Pay ({getPayFrequencyData(payFrequency, 'label')})</p>
                                <p className="text-lg font-semibold">{formatCurrency(calculateGrossPay())}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estimated Net Pay ({getPayFrequencyData(payFrequency, 'label')})</p>
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(calculations.netPay)}</p>
                            </div>
                        </div>
                        
                        {/* Detailed Breakdown */}
                        <div className="border-t border-gray-200 pt-4 mt-2">
                            <h4 className="text-md font-medium text-gray-700 mb-2">Detailed Breakdown</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Pre-tax Deductions */}
                                <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-1">Pre-tax Deductions</h5>
                                    {preTaxDeductions.map(deduction => (
                                        <div key={deduction.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{deduction.name}</span>
                                            <span className="text-gray-800">
                                                {deduction.type === 'percentage' 
                                                    ? `${deduction.amount}% (${formatCurrency(calculateGrossPay() * deduction.amount / 100)})`
                                                    : formatCurrency(deduction.amount)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-sm font-medium mt-1">
                                        <span>Total Pre-tax Deductions</span>
                                        <span>{formatCurrency(calculations.preTaxDeductionsTotal)}</span>
                                    </div>
                                </div>
                                
                                {/* Taxes */}
                                <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-1">Estimated Taxes</h5>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Federal Income Tax</span>
                                        <span className="text-gray-800">{formatCurrency(calculations.federalTax)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">State Income Tax</span>
                                        <span className="text-gray-800">{formatCurrency(calculations.stateTax)}</span>
                                    </div>
                                    {calculations.localTax > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Local Income Tax</span>
                                            <span className="text-gray-800">{formatCurrency(calculations.localTax)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Social Security</span>
                                        <span className="text-gray-800">{formatCurrency(calculations.socialSecurity)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Medicare</span>
                                        <span className="text-gray-800">{formatCurrency(calculations.medicare)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium mt-1">
                                        <span>Total Taxes</span>
                                        <span>{formatCurrency(calculations.totalTax)}</span>
                                    </div>
                                </div>
                                
                                {/* Post-tax Deductions */}
                                <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-1">Post-tax Deductions</h5>
                                    {postTaxDeductions.map(deduction => (
                                        <div key={deduction.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{deduction.name}</span>
                                            <span className="text-gray-800">
                                                {deduction.type === 'percentage' 
                                                    ? `${deduction.amount}% (${formatCurrency(calculateGrossPay() * deduction.amount / 100)})`
                                                    : formatCurrency(deduction.amount)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-sm font-medium mt-1">
                                        <span>Total Post-tax Deductions</span>
                                        <span>{formatCurrency(calculations.postTaxDeductionsTotal)}</span>
                                    </div>
                                </div>
                                
                                {/* Benefits */}
                                <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-1">Benefits</h5>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Health Insurance</span>
                                        <span className="text-gray-800">{formatCurrency(parseFloat(healthInsurance) || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Dental Insurance</span>
                                        <span className="text-gray-800">{formatCurrency(parseFloat(dentalInsurance) || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Vision Insurance</span>
                                        <span className="text-gray-800">{formatCurrency(parseFloat(visionInsurance) || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">401(k) Contribution</span>
                                        <span className="text-gray-800">{formatCurrency(parseFloat(retirement401k) || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                        <button 
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : (editingEntryId ? 'Update Entry' : 'Add Entry')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                if (editingEntryId) {
                                    setEditingEntryId(null);
                                    resetForm();
                                }
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Compensation History Chart */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
                {salaryEntries.length > 0 ? (
                    <Line data={prepareChartData(salaryEntries)} options={getChartOptions(salaryEntries)} />
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No salary data available to display
                    </div>
                )}
            </div>

            {/* Update Salary History Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Income</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(salaryEntries) && salaryEntries.length > 0 ? (
                            salaryEntries.map((entry, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.company}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.salary_amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.bonus_amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.commission_amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(calculateNetIncome(entry))}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(entry.date_of_change).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{entry.notes}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button 
                                            onClick={() => handleEditEntry(entry)}
                                            className="text-blue-500 hover:text-blue-700 mr-3"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No salary entries found. Add your first entry above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pay History */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pay History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gross Pay
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Net Pay
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Federal Tax
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    FICA
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payHistory.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(entry.grossPay)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(entry.netPay)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(entry.federalTax)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(entry.socialSecurity + entry.medicare)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Year-to-Date Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Year-to-Date Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">YTD Gross Pay</p>
                        <p className="text-lg font-semibold">{formatCurrency(yearToDate.grossPay)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">YTD Net Pay</p>
                        <p className="text-lg font-semibold">{formatCurrency(yearToDate.netPay)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">YTD Federal Tax</p>
                        <p className="text-lg font-semibold">{formatCurrency(yearToDate.federalTax)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">YTD State Tax</p>
                        <p className="text-lg font-semibold">{formatCurrency(yearToDate.stateTax)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">YTD Social Security</p>
                        <p className="text-lg font-semibold">{formatCurrency(yearToDate.socialSecurity)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">YTD Medicare</p>
                        <p className="text-lg font-semibold">{formatCurrency(yearToDate.medicare)}</p>
                    </div>
                </div>
            </div>

            {/* What If Tool */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h2 className="text-2xl font-bold mb-6">What If Calculator</h2>
                <p className="mb-4 text-gray-600">
                    Explore how changes to your salary, benefits, or location would affect your take-home pay.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Scenario
                        </label>
                        <select
                            value={whatIfScenario}
                            onChange={(e) => setWhatIfScenario(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="salary_increase">Salary Increase</option>
                            <option value="salary_decrease">Salary Decrease</option>
                            <option value="change_401k">Change 401(k) Contribution</option>
                            <option value="change_state">Move to Different State</option>
                            <option value="change_benefits">Adjust Benefits</option>
                        </select>
                    </div>

                    {(whatIfScenario === 'salary_increase' || whatIfScenario === 'salary_decrease') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adjustment Type
                            </label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="percentage"
                                        checked={whatIfAdjustmentType === 'percentage'}
                                        onChange={() => setWhatIfAdjustmentType('percentage')}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Percentage</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="amount"
                                        checked={whatIfAdjustmentType === 'amount'}
                                        onChange={() => setWhatIfAdjustmentType('amount')}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Amount</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dynamic scenario parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {(whatIfScenario === 'salary_increase' || whatIfScenario === 'salary_decrease') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {whatIfAdjustmentType === 'percentage' ? 'Percentage Change' : 'Amount Change'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">
                                        {whatIfAdjustmentType === 'percentage' ? '%' : '$'}
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    value={whatIfValue}
                                    onChange={(e) => setWhatIfValue(e.target.value)}
                                    className="pl-7 w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    )}

                    {whatIfScenario === 'change_401k' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New 401(k) Contribution Percentage
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">%</span>
                                </div>
                                <input
                                    type="number"
                                    value={whatIfValue}
                                    onChange={(e) => setWhatIfValue(e.target.value)}
                                    className="pl-7 w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                    )}

                    {whatIfScenario === 'change_state' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New State
                                </label>
                                <select
                                    value={whatIfNewState}
                                    onChange={(e) => {
                                        setWhatIfNewState(e.target.value);
                                        setWhatIfNewCity('');
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(STATE_TAX_RATES).map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New City
                                </label>
                                <select
                                    value={whatIfNewCity}
                                    onChange={(e) => setWhatIfNewCity(e.target.value)}
                                    disabled={!whatIfNewState || !STATE_TAX_RATES[whatIfNewState]?.cities}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select City</option>
                                    {whatIfNewState && STATE_TAX_RATES[whatIfNewState]?.cities && 
                                        Object.keys(STATE_TAX_RATES[whatIfNewState].cities).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </>
                    )}

                    {whatIfScenario === 'change_benefits' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Health Insurance
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={whatIfHealthInsurance}
                                        onChange={(e) => setWhatIfHealthInsurance(e.target.value)}
                                        className="pl-7 w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dental Insurance
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={whatIfDentalInsurance}
                                        onChange={(e) => setWhatIfDentalInsurance(e.target.value)}
                                        className="pl-7 w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={calculateWhatIfScenario}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Calculate
                    </button>
                </div>

                {/* What-If Comparison Results */}
                {whatIfResult && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Comparison Results</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-sm font-medium text-gray-500"></div>
                            <div className="col-span-1 text-sm font-medium text-blue-600">Current</div>
                            <div className="col-span-1 text-sm font-medium text-green-600">With Changes</div>
                            
                            <div className="col-span-1 text-sm font-medium">Gross Pay</div>
                            <div className="col-span-1 text-sm">{formatCurrency(calculateGrossPay())}</div>
                            <div className="col-span-1 text-sm">{formatCurrency(whatIfResult.grossPay)}</div>
                            
                            <div className="col-span-1 text-sm font-medium">Federal Tax</div>
                            <div className="col-span-1 text-sm">{formatCurrency(calculateFederalTax())}</div>
                            <div className="col-span-1 text-sm">{formatCurrency(whatIfResult.federalTax)}</div>
                            
                            <div className="col-span-1 text-sm font-medium">State Tax</div>
                            <div className="col-span-1 text-sm">{formatCurrency(calculateStateTax())}</div>
                            <div className="col-span-1 text-sm">{formatCurrency(whatIfResult.stateTax)}</div>
                            
                            <div className="col-span-1 text-sm font-medium">Local Tax</div>
                            <div className="col-span-1 text-sm">{formatCurrency(calculateCityTax())}</div>
                            <div className="col-span-1 text-sm">{formatCurrency(whatIfResult.localTax)}</div>
                            
                            <div className="col-span-1 text-sm font-medium">FICA</div>
                            <div className="col-span-1 text-sm">{formatCurrency(calculateFICA())}</div>
                            <div className="col-span-1 text-sm">{formatCurrency(whatIfResult.socialSecurity + whatIfResult.medicare)}</div>
                            
                            <div className="col-span-1 text-sm font-medium">Pre-Tax Deductions</div>
                            <div className="col-span-1 text-sm">{formatCurrency(calculatePreTaxDeductions())}</div>
                            <div className="col-span-1 text-sm">{formatCurrency(whatIfResult.preTaxDeductionsTotal)}</div>
                            
                            <div className="col-span-1 text-sm font-medium">Post-Tax Deductions</div>
                            <div className="col-span-1 text-sm">{formatCurrency(calculatePostTaxDeductions())}</div>
                            <div className="col-span-1 text-sm">{formatCurrency(whatIfResult.postTaxDeductionsTotal)}</div>
                            
                            <div className="col-span-1 text-sm font-medium">Net Pay</div>
                            <div className="col-span-1 text-sm font-bold">{formatCurrency(calculateNetPay())}</div>
                            <div className="col-span-1 text-sm font-bold">{formatCurrency(whatIfResult.netPay)}</div>
                            
                            <div className="col-span-1 text-sm font-medium">Difference</div>
                            <div className="col-span-2 text-sm font-bold">
                                {formatCurrency(whatIfResult.netPay - calculateNetPay())}
                                {" "}
                                <span className={whatIfResult.netPay >= calculateNetPay() ? "text-green-600" : "text-red-600"}>
                                    ({(((whatIfResult.netPay - calculateNetPay()) / calculateNetPay()) * 100).toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Paycheck Calculation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Salary Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base Pay
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                value={basePay}
                                onChange={(e) => setBasePay(e.target.value)}
                                className="pl-7 w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pay Type
                        </label>
                        <select
                            value={payType}
                            onChange={(e) => setPayType(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="annual">Annual Salary</option>
                            <option value="hourly">Hourly Rate</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pay Frequency
                        </label>
                        <select
                            value={payFrequency}
                            onChange={(e) => setPayFrequency(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {Object.entries(PAY_FREQUENCIES).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {payType === 'hourly' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hours per Week
                            </label>
                            <input
                                type="number"
                                value={hoursPerWeek}
                                onChange={(e) => setHoursPerWeek(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
                
                {/* Calculation Results */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Paycheck Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Gross Pay ({getPayFrequencyData(payFrequency, 'label')})</p>
                            <p className="text-lg font-semibold">{formatCurrency(calculateGrossPay())}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Federal Tax</p>
                            <p className="text-lg font-semibold">{formatCurrency(calculateFederalTax())}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">FICA</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(calculateFICA())}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">State Tax</p>
                            <p className="text-lg font-semibold">{formatCurrency(calculateStateTax())}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Net Pay ({getPayFrequencyData(payFrequency, 'label')})</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateNetPay())}</p>
                        </div>
                    </div>
                </div>
            </div>

            {showRsuForm && renderRsuForm()}
            {selectedRsuGrant && renderRsuVestingSchedule()}
        </div>
    );
};

// Set default props
SalaryJournal.defaultProps = {
    onSalaryAdded: () => {},
    onSalaryUpdated: () => {},
    onSalaryDeleted: () => {}
};

export default SalaryJournal;