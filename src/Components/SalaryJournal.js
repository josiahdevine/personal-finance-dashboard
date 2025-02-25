import React, { useState, useEffect, useRef } from 'react';
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
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

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
    MA: {
        flatRate: 0.05
    },
    IL: {
        flatRate: 0.0495
    },
    TX: {
        flatRate: 0 // No state income tax
    },
    FL: {
        flatRate: 0 // No state income tax
    },
    WA: {
        flatRate: 0, // No state income tax
        cities: {
            Seattle: {
                payrollTax: 0.00175 // Seattle Payroll Expense Tax
            }
        }
    },
    DC: {
        brackets: [
            { rate: 0.04, upTo: 10000 },
            { rate: 0.06, upTo: 40000 },
            { rate: 0.065, upTo: 60000 },
            { rate: 0.085, upTo: 350000 },
            { rate: 0.0925, upTo: 1000000 },
            { rate: 0.0975, upTo: Infinity }
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
    PA: {
        flatRate: 0.0307,
        cities: {
            Philadelphia: {
                residentRate: 0.0371,
                nonResidentRate: 0.035
            },
            Pittsburgh: {
                flatRate: 0.01
            }
        }
    }
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
    const [payFrequency, setPayFrequency] = useState('biweekly');
    
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

    useEffect(() => {
        fetchSalaryEntries();
    }, [activeUserId]);

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
    }, [salaryEntries]); // Only depend on salaryEntries

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
    }, [basePay, payType, payFrequency, hoursPerWeek, overtime, bonus, commission, 
        preTaxDeductions, postTaxDeductions, selectedState, selectedCity]);

    const fetchSalaryEntries = async () => {
        setLoading(true);
        try {
            // First try to load from localStorage as a fallback
            const storedEntries = localStorage.getItem(`salary_entries_${activeUserId}`);
            if (storedEntries) {
                const parsedEntries = JSON.parse(storedEntries);
                console.log('Loaded salary entries from localStorage:', parsedEntries);
                setSalaryEntries(parsedEntries);
            }
            
            // Then try the API with proper authentication
            try {
                // Get the current user's token
                const token = await currentUser.getIdToken();
                
                // Build the API URL using the environment variable
                const apiUrl = process.env.REACT_APP_API_URL || 'https://api.trypersonalfinance.com';
                const endpoint = `/api/salary/entries?userProfileId=${activeUserId}`;
                const fullUrl = `${apiUrl}${endpoint}`;
                
                console.log('Fetching salary data from:', endpoint);
                
                const response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.warn(`API error (${response.status}):`, errorData);
                    toast.warning(`Using localStorage data (API returned ${response.status})`);
                    return; // Keep using localStorage data
                }
                
                const data = await response.json();
                console.log('Loaded salary entries from API:', data);
                setSalaryEntries(data);
                
                // Update localStorage with the latest data
                localStorage.setItem(`salary_entries_${activeUserId}`, JSON.stringify(data));
                toast.success('Salary data loaded from database');
            } catch (apiError) {
                console.error('API Error fetching salary entries:', apiError);
                toast.warning('Using locally stored salary data - API connection error');
            }
        } catch (error) {
            console.error('Error in fetchSalaryEntries:', error);
            toast.error('An error occurred while loading salary data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        if (!newUserName.trim()) {
            toast.error('Please enter a name for the user');
            return;
        }

        const newUser = {
            id: `user_${Date.now()}`,
            name: newUserName.trim(),
            isActive: false
        };

        setUsers([...users, newUser]);
        setNewUserName('');
        setShowUserForm(false);
        toast.success(`Added ${newUserName} to your account`);
    };

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
            // Calculate the actual bonus amount based on the type
            const finalBonusAmount = bonusIsPercentage 
                ? (parseFloat(salaryAmount) * parseFloat(bonusAmount) / 100) 
                : parseFloat(bonusAmount) || 0;
                
            // Get current user's token
            const token = await currentUser.getIdToken();
            
            // Prepare data for the API
            const newEntry = {
                company,
                position,
                user_profile_id: activeUserId,
                salary_amount: parseFloat(salaryAmount),
                pay_type: payType,
                pay_frequency: payFrequency,
                hours_per_week: payType === 'hourly' ? parseFloat(hoursPerWeek) : null,
                date_of_change: dateOfChange || new Date().toISOString().split('T')[0],
                notes,
                bonus_amount: finalBonusAmount,
                bonus_is_percentage: bonusIsPercentage,
                commission_amount: parseFloat(commissionAmount) || 0,
                health_insurance: parseFloat(healthInsurance) || 0,
                dental_insurance: parseFloat(dentalInsurance) || 0,
                vision_insurance: parseFloat(visionInsurance) || 0,
                retirement_401k: parseFloat(retirement401k) || 0,
                state: selectedState,
                city: selectedCity
            };

            console.log('Sending data to server:', newEntry);

            // Build the API URL using the environment variable
            const apiUrl = process.env.REACT_APP_API_URL || 'https://api.trypersonalfinance.com';
            const endpoint = '/api/salary';
            const fullUrl = `${apiUrl}${endpoint}`;

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEntry),
            });

            const responseData = await response.json().catch(e => {
                console.error('Error parsing response:', e);
                return null;
            });

            console.log('Server response:', response.status, responseData);

            if (response.ok) {
                toast.success('Salary entry created successfully!');
                resetForm();
                fetchSalaryEntries(); // Refresh the list
            } else {
                console.error('Server error response:', responseData);
                
                // Fall back to local storage if API fails
                const entryWithId = {
                    ...newEntry,
                    id: `local_${Date.now()}`,
                    created_at: new Date().toISOString()
                };
                
                const existingEntries = JSON.parse(localStorage.getItem(`salary_entries_${activeUserId}`) || '[]');
                const updatedEntries = [entryWithId, ...existingEntries];
                localStorage.setItem(`salary_entries_${activeUserId}`, JSON.stringify(updatedEntries));
                
                setSalaryEntries(updatedEntries);
                toast.warning('Saved to local storage (API unavailable)');
                resetForm();
            }
        } catch (error) {
            console.error('Error creating salary entry:', error);
            toast.error('Error creating salary entry: ' + (error.message || 'Unknown error'));
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
        const sortedEntries = [...entries].sort((a, b) => 
            new Date(a.date_of_change) - new Date(b.date_of_change)
        );

        return {
            labels: sortedEntries.map(entry => new Date(entry.date_of_change).toLocaleDateString()),
            datasets: [
                {
                    label: 'Base Salary',
                    data: sortedEntries.map(entry => entry.salary_amount),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1
                },
                {
                    label: 'Total Compensation',
                    data: sortedEntries.map(entry => 
                        entry.salary_amount + 
                        (entry.bonus_amount || 0) + 
                        (entry.commission_amount || 0)
                    ),
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    tension: 0.1
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Compensation History',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const entry = salaryEntries[context.dataIndex];
                        if (context.dataset.label === 'Total Compensation') {
                            return [
                                `Total: ${formatCurrency(context.raw)}`,
                                `Base: ${formatCurrency(entry.salary_amount)}`,
                                `Bonus: ${formatCurrency(entry.bonus_amount)}`,
                                `Commission: ${formatCurrency(entry.commission_amount)}`
                            ];
                        }
                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    const calculateAnnualSalary = () => {
        if (payType === 'annual') {
            return parseFloat(basePay) || 0;
        } else {
            const weeklyPay = (parseFloat(basePay) || 0) * hoursPerWeek;
            return weeklyPay * 52;
        }
    };

    const calculateGrossPay = () => {
        const annualSalary = calculateAnnualSalary();
        const periodsPerYear = PAY_FREQUENCIES[payFrequency].periodsPerYear;
        const baseGrossPay = annualSalary / periodsPerYear;

        // Add overtime if applicable
        let overtimePay = 0;
        if (payType === 'hourly') {
            const hourlyRate = parseFloat(basePay) || 0;
            overtimePay = overtime.hours * hourlyRate * overtime.rate;
        }

        // Add bonus and commission
        const additionalPay = (parseFloat(bonus) || 0) + (parseFloat(commission) || 0);

        return baseGrossPay + overtimePay + additionalPay;
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
        const annualTaxableIncome = taxableIncome * PAY_FREQUENCIES[payFrequency].periodsPerYear;
        let tax = 0;
        let remainingIncome = annualTaxableIncome;

        for (let i = 0; i < TAX_BRACKETS_2024.FEDERAL.length; i++) {
            const bracket = TAX_BRACKETS_2024.FEDERAL[i];
            const prevBracket = i > 0 ? TAX_BRACKETS_2024.FEDERAL[i - 1].upTo : 0;
            const bracketIncome = Math.min(remainingIncome, bracket.upTo - prevBracket);
            
            if (bracketIncome <= 0) break;
            
            tax += bracketIncome * bracket.rate;
            remainingIncome -= bracketIncome;
        }

        return tax / PAY_FREQUENCIES[payFrequency].periodsPerYear;
    };

    const calculateFICA = (taxableIncome) => {
        const annualTaxableIncome = taxableIncome * PAY_FREQUENCIES[payFrequency].periodsPerYear;
        const { socialSecurity, medicare } = TAX_BRACKETS_2024.FICA;

        // Calculate Social Security
        const ssTax = Math.min(annualTaxableIncome, socialSecurity.wageBase) * socialSecurity.rate;

        // Calculate Medicare
        let medicareTax = annualTaxableIncome * medicare.rate;
        if (annualTaxableIncome > medicare.threshold) {
            medicareTax += (annualTaxableIncome - medicare.threshold) * medicare.additionalRate;
        }

        return {
            socialSecurity: ssTax / PAY_FREQUENCIES[payFrequency].periodsPerYear,
            medicare: medicareTax / PAY_FREQUENCIES[payFrequency].periodsPerYear
        };
    };

    const calculateStateTax = (taxableIncome) => {
        if (!selectedState || !STATE_TAX_RATES[selectedState]) {
            return 0;
        }

        const stateTaxRate = STATE_TAX_RATES[selectedState].rate;
        return taxableIncome * stateTaxRate;
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
    const calculateTaxProgressive = (taxableIncome, payFrequency, brackets) => {
        // Convert to annual amount for calculation
        const periodsPerYear = PAY_FREQUENCIES[payFrequency].periodsPerYear;
        const annualizedIncome = taxableIncome * periodsPerYear;
        
        let tax = 0;
        let remainingIncome = annualizedIncome;
        
        for (let i = 0; i < brackets.length; i++) {
            const bracket = brackets[i];
            const nextBracketThreshold = i < brackets.length - 1 ? brackets[i + 1].threshold : Infinity;
            const incomeInBracket = Math.min(remainingIncome, nextBracketThreshold - bracket.threshold);
            
            if (incomeInBracket <= 0) break;
            
            tax += incomeInBracket * bracket.rate;
            remainingIncome -= incomeInBracket;
        }
        
        // Convert back to per-period amount
        return tax / periodsPerYear;
    };

    // Calculate local tax if applicable
    const calculateLocalTax = (taxableIncome) => {
        if (!selectedState || !selectedCity || 
            !STATE_TAX_RATES[selectedState]?.cities?.[selectedCity]) return 0;

        const cityTax = STATE_TAX_RATES[selectedState].cities[selectedCity];
        const annualTaxableIncome = taxableIncome * PAY_FREQUENCIES[payFrequency].periodsPerYear;

        if (cityTax.payrollTax) {
            return (annualTaxableIncome * cityTax.payrollTax) / PAY_FREQUENCIES[payFrequency].periodsPerYear;
        }

        if (cityTax.brackets) {
            let tax = 0;
            let remainingIncome = annualTaxableIncome;

            for (let i = 0; i < cityTax.brackets.length; i++) {
                const bracket = cityTax.brackets[i];
                const prevBracket = i > 0 ? cityTax.brackets[i - 1].upTo : 0;
                const bracketIncome = Math.min(remainingIncome, bracket.upTo - prevBracket);
                
                if (bracketIncome <= 0) break;
                
                tax += bracketIncome * bracket.rate;
                remainingIncome -= bracketIncome;
            }

            return tax / PAY_FREQUENCIES[payFrequency].periodsPerYear;
        }

        return 0;
    };

    const calculatePaycheck = () => {
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
        const paycheck = calculatePaycheck();
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
                const response = await axios.post('/api/salary/save', newEntry);
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

    const prepareIncomeBreakdownData = () => {
        const data = {
            labels: Object.values(INCOME_TYPES),
            datasets: [{
                data: incomeBreakdown.map(income => income.amount),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ]
            }]
        };
        return data;
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
                return 1;
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
        const newFederalTax = calculateTaxProgressive(newTaxableIncome, payFrequency, TAX_BRACKETS_2024.FEDERAL);
        
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
        <div className="container mx-auto p-4">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Salary Journal</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {showForm ? 'Cancel' : 'Add New Entry'}
                </button>
            </div>

            {/* Introduction and Description */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">Track Your Income Growth Over Time</h2>
                <p className="mb-4">Enter your salary information to see how your compensation changes over time. This tool helps you track your career progression and financial growth.</p>
                
                <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Why track your salary history?</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Visualize your career progression and salary growth</li>
                                    <li>Calculate accurate net income after taxes and deductions</li>
                                    <li>Project future earnings with the "What If" calculator</li>
                                    <li>Keep track of bonuses, commissions, and total compensation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Profile Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Manage Household Members</h3>
                    <button
                        onClick={() => setShowUserForm(!showUserForm)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                        {showUserForm ? 'Cancel' : 'Add Member'}
                    </button>
                </div>
                
                {showUserForm && (
                    <div className="bg-blue-50 p-4 rounded mb-4">
                        <div className="flex flex-col md:flex-row gap-2">
                            <input
                                type="text"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="Enter name"
                                className="flex-grow p-2 border rounded"
                            />
                            <button
                                onClick={handleAddUser}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {users.map(user => (
                        <div 
                            key={user.id}
                            className={`p-3 rounded border ${user.isActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'} flex justify-between items-center`}
                        >
                            <span className={user.isActive ? 'font-medium' : ''}>{user.name}</span>
                            <div>
                                {!user.isActive && (
                                    <button
                                        onClick={() => switchActiveUser(user.id)}
                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded mr-2 text-xs hover:bg-blue-200"
                                    >
                                        Switch
                                    </button>
                                )}
                                {user.id !== 'primary' && (
                                    <button
                                        onClick={() => removeUser(user.id)}
                                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Active user indicator */}
            <div className="bg-blue-50 p-3 rounded mb-6 text-sm text-blue-700">
                Currently managing salary information for: <span className="font-semibold">{users.find(u => u.id === activeUserId)?.name || 'Primary User'}</span>
            </div>
            
            {/* Salary Entry Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Gross Pay ({PAY_FREQUENCIES[payFrequency].label})</p>
                                <p className="text-lg font-semibold">{formatCurrency(calculateGrossPay())}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estimated Net Pay ({PAY_FREQUENCIES[payFrequency].label})</p>
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(calculatePaycheck().netPay)}</p>
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
                            {loading ? 'Loading...' : 'Add Entry'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
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
                    <Line data={prepareChartData(salaryEntries)} options={chartOptions} />
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
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {salaryEntries.map((entry, index) => (
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
                            </tr>
                        ))}
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
                            <p className="text-sm text-gray-500">Gross Pay ({PAY_FREQUENCIES[payFrequency].label})</p>
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
                            <p className="text-sm text-gray-500">Net Pay ({PAY_FREQUENCIES[payFrequency].label})</p>
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