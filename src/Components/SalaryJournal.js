import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Adjust path as needed
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

const SalaryJournal = () => {
    const [salaryEntries, setSalaryEntries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');
    const [salaryAmount, setSalaryAmount] = useState('');
    const [dateOfChange, setDateOfChange] = useState('');
    const [notes, setNotes] = useState('');
    const [bonusAmount, setBonusAmount] = useState('');
    const [commissionAmount, setCommissionAmount] = useState('');
    const { token, userId } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

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

    // Add useEffect to fetch salary entries when component mounts
    useEffect(() => {
        fetchSalaryEntries();
    }, []); // Empty dependency array means this runs once when component mounts

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
            const response = await fetch('/api/salary/salary-entries', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSalaryEntries(data);
                console.log('Fetched salary entries:', data); // Add logging
            } else {
                console.error('Failed to fetch salary entries:', response.status);
                toast.error('Failed to fetch salary entries');
            }
        } catch (error) {
            console.error('Error fetching salary entries:', error);
            toast.error('Error fetching salary entries');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newEntry = {
                company,
                position,
                salary_amount: parseFloat(salaryAmount),
                date_of_change: dateOfChange,
                notes,
                bonus_amount: parseFloat(bonusAmount) || 0,
                commission_amount: parseFloat(commissionAmount) || 0,
            };

            console.log('Sending data to server:', newEntry);

            const response = await fetch('/api/salary/salary-entries', {
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
                toast.error(`Failed to create salary entry: ${responseData?.message || response.statusText}`);
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
        if (!selectedState || !STATE_TAX_RATES[selectedState]) return 0;

        const stateConfig = STATE_TAX_RATES[selectedState];
        const annualTaxableIncome = taxableIncome * PAY_FREQUENCIES[payFrequency].periodsPerYear;

        // Handle flat rate states
        if (stateConfig.flatRate !== undefined) {
            return (annualTaxableIncome * stateConfig.flatRate) / PAY_FREQUENCIES[payFrequency].periodsPerYear;
        }

        // Handle progressive tax brackets
        if (stateConfig.brackets) {
            let tax = 0;
            let remainingIncome = annualTaxableIncome;

            for (let i = 0; i < stateConfig.brackets.length; i++) {
                const bracket = stateConfig.brackets[i];
                const prevBracket = i > 0 ? stateConfig.brackets[i - 1].upTo : 0;
                const bracketIncome = Math.min(remainingIncome, bracket.upTo - prevBracket);
                
                if (bracketIncome <= 0) break;
                
                tax += bracketIncome * bracket.rate;
                remainingIncome -= bracketIncome;
            }

            return tax / PAY_FREQUENCIES[payFrequency].periodsPerYear;
        }

        return 0;
    };

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
        try {
            await axios.post('/api/salary/save', {
                ...paycheck,
                payType,
                basePay,
                payFrequency,
                date: new Date().toISOString()
            });
            toast.success('Paycheck saved successfully');
            fetchSalaryEntries();
        } catch (error) {
            console.error('Error saving paycheck:', error);
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
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input 
                                        className="pl-7 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                        id="bonusAmount" 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={bonusAmount} 
                                        onChange={(e) => setBonusAmount(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfChange">
                                    Start Date
                                </label>
                                <input 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id="dateOfChange" 
                                    type="date" 
                                    value={dateOfChange} 
                                    onChange={(e) => setDateOfChange(e.target.value)} 
                                />
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

            {/* Paycheck Calculation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Salary Calculator</h2>
                
                {/* Pay Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pay Type
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="annual"
                                    checked={payType === 'annual'}
                                    onChange={(e) => setPayType(e.target.value)}
                                    className="form-radio text-blue-600"
                                />
                                <span className="ml-2">Annual Salary</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="hourly"
                                    checked={payType === 'hourly'}
                                    onChange={(e) => setPayType(e.target.value)}
                                    className="form-radio text-blue-600"
                                />
                                <span className="ml-2">Hourly Rate</span>
                            </label>
                        </div>
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
                </div>

                {/* Base Pay Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {payType === 'annual' ? 'Annual Salary' : 'Hourly Rate'}
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                value={basePay}
                                onChange={(e) => setBasePay(e.target.value)}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                placeholder="0.00"
                            />
                        </div>
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
                            <p className="text-lg font-semibold">{formatCurrency(calculations.grossPay)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Federal Tax</p>
                            <p className="text-lg font-semibold">{formatCurrency(calculations.federalTax)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">FICA</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(calculations.socialSecurity + calculations.medicare)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">State Tax</p>
                            <p className="text-lg font-semibold">{formatCurrency(calculations.stateTax)}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Net Pay ({PAY_FREQUENCIES[payFrequency].label})</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(calculations.netPay)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {showRsuForm && renderRsuForm()}
            {selectedRsuGrant && renderRsuVestingSchedule()}
        </div>
    );
};

export default SalaryJournal;