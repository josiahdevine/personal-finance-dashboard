const pool = require('../db');

class LoanModel {
    // Calculate loan amortization schedule
    static calculateAmortizationSchedule(principal, annualRate, termMonths, startDate) {
        const monthlyRate = annualRate / 12 / 100;
        const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                              (Math.pow(1 + monthlyRate, termMonths) - 1);
        
        let schedule = [];
        let balance = principal;
        let currentDate = new Date(startDate);

        for (let month = 1; month <= termMonths; month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            balance -= principalPayment;

            schedule.push({
                paymentNumber: month,
                paymentDate: new Date(currentDate),
                paymentAmount: monthlyPayment,
                principalPortion: principalPayment,
                interestPortion: interestPayment,
                remainingBalance: Math.max(0, balance)
            });

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return {
            monthlyPayment,
            schedule
        };
    }

    // Create a new loan
    static async createLoan(manualAccountId, loanData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { principal_amount, interest_rate, loan_term_months, start_date } = loanData;
            const amortization = this.calculateAmortizationSchedule(
                principal_amount,
                interest_rate,
                loan_term_months,
                start_date
            );

            // Insert loan details
            const loanQuery = `
                INSERT INTO loan_details (
                    manual_account_id, principal_amount, interest_rate,
                    loan_term_months, payment_amount, start_date,
                    next_payment_date, remaining_payments
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `;
            const loanValues = [
                manualAccountId,
                principal_amount,
                interest_rate,
                loan_term_months,
                amortization.monthlyPayment,
                start_date,
                amortization.schedule[0].paymentDate,
                loan_term_months
            ];

            const loanResult = await client.query(loanQuery, loanValues);
            const loanId = loanResult.rows[0].id;

            // Insert initial amortization schedule
            const scheduleQuery = `
                INSERT INTO loan_payments (
                    loan_detail_id, payment_date, payment_amount,
                    principal_portion, interest_portion, remaining_balance
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `;

            for (const payment of amortization.schedule) {
                await client.query(scheduleQuery, [
                    loanId,
                    payment.paymentDate,
                    payment.paymentAmount,
                    payment.principalPortion,
                    payment.interestPortion,
                    payment.remainingBalance
                ]);
            }

            await client.query('COMMIT');
            return { loanId, amortization };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Record a loan payment
    static async recordPayment(loanId, paymentData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { payment_date, payment_amount, extra_payment = 0 } = paymentData;

            // Get loan details
            const loanQuery = `
                SELECT * FROM loan_details WHERE id = $1
            `;
            const loanResult = await client.query(loanQuery, [loanId]);
            const loan = loanResult.rows[0];

            if (!loan) {
                throw new Error('Loan not found');
            }

            // Get current balance
            const balanceQuery = `
                SELECT remaining_balance 
                FROM loan_payments 
                WHERE loan_detail_id = $1 
                ORDER BY payment_date DESC 
                LIMIT 1
            `;
            const balanceResult = await client.query(balanceQuery, [loanId]);
            const currentBalance = balanceResult.rows[0]?.remaining_balance || loan.principal_amount;

            // Calculate payment breakdown
            const monthlyRate = loan.interest_rate / 12 / 100;
            const interestPortion = currentBalance * monthlyRate;
            const principalPortion = payment_amount - interestPortion;
            const totalPrincipalPayment = principalPortion + extra_payment;
            const newBalance = Math.max(0, currentBalance - totalPrincipalPayment);

            // Record payment
            const paymentQuery = `
                INSERT INTO loan_payments (
                    loan_detail_id, payment_date, payment_amount,
                    principal_portion, interest_portion, extra_payment,
                    remaining_balance
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const paymentResult = await client.query(paymentQuery, [
                loanId,
                payment_date,
                payment_amount,
                principalPortion,
                interestPortion,
                extra_payment,
                newBalance
            ]);

            // Update loan details
            const updateLoanQuery = `
                UPDATE loan_details
                SET next_payment_date = $1,
                    remaining_payments = remaining_payments - 1
                WHERE id = $2
            `;
            await client.query(updateLoanQuery, [
                new Date(payment_date).setMonth(new Date(payment_date).getMonth() + 1),
                loanId
            ]);

            await client.query('COMMIT');
            return paymentResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Get loan details with payment history
    static async getLoanDetails(loanId) {
        const query = `
            SELECT 
                ld.*,
                json_agg(
                    json_build_object(
                        'payment_date', lp.payment_date,
                        'payment_amount', lp.payment_amount,
                        'principal_portion', lp.principal_portion,
                        'interest_portion', lp.interest_portion,
                        'extra_payment', lp.extra_payment,
                        'remaining_balance', lp.remaining_balance
                    ) ORDER BY lp.payment_date
                ) as payments
            FROM loan_details ld
            LEFT JOIN loan_payments lp ON ld.id = lp.loan_detail_id
            WHERE ld.id = $1
            GROUP BY ld.id
        `;
        const result = await pool.query(query, [loanId]);
        return result.rows[0];
    }

    // Get all loans for a user
    static async getUserLoans(userId) {
        const query = `
            SELECT 
                ld.*,
                ma.name as account_name,
                ma.type as account_type,
                (
                    SELECT remaining_balance
                    FROM loan_payments
                    WHERE loan_detail_id = ld.id
                    ORDER BY payment_date DESC
                    LIMIT 1
                ) as current_balance
            FROM loan_details ld
            JOIN manual_accounts ma ON ld.manual_account_id = ma.id
            WHERE ma.user_id = $1
            ORDER BY ma.name
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }
}

module.exports = LoanModel; 