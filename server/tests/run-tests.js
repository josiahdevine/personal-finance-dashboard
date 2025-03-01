const { spawn } = require('child_process');
const path = require('path');
const colors = require('colors/safe');
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Validate required environment variables
const requiredEnvVars = [
    'DATABASE_URL',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE',
    'PGHOST',
    'PGSSLMODE'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(colors.red('\nMissing required environment variables:'));
    missingEnvVars.forEach(varName => console.error(colors.red(`  - ${varName}`)));
    console.error(colors.yellow('\nPlease check your .env.test file\n'));
    process.exit(1);
}

// Test suites to run
const testSuites = [
    {
        name: 'Database Schema Validation',
        command: 'psql',
        args: [
            '--set=sslmode=require',
            '-d', process.env.DATABASE_URL,
            '-f', path.join(__dirname, 'database/schema-validation.test.sql'),
            '-v', 'ON_ERROR_STOP=1'
        ],
        type: 'sql',
        env: {
            PGSSLMODE: 'require',
            PGAPPNAME: 'test_runner'
        }
    },
    {
        name: 'API Integration Tests',
        command: 'mocha',
        args: [
            '--timeout', '10000',
            '--exit',
            '--reporter', 'spec',
            path.join(__dirname, 'api/plaid-integration.test.js')
        ],
        type: 'mocha',
        env: {
            PGSSLMODE: 'require',
            PGAPPNAME: 'test_runner',
            NODE_ENV: 'test'
        }
    }
];

// Run a single test suite
async function runTestSuite(suite) {
    console.log(colors.cyan(`\nRunning ${suite.name}...\n`));

    return new Promise((resolve, reject) => {
        let output = '';
        let errorOutput = '';

        const process = spawn(suite.command, suite.args, {
            env: {
                ...process.env,
                ...suite.env,
                NODE_ENV: 'test'
            }
        });

        process.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            console.log(text);
        });

        process.stderr.on('data', (data) => {
            const text = data.toString();
            errorOutput += text;
            console.error(colors.red(text));
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(colors.green(`\n✓ ${suite.name} passed\n`));
                resolve();
            } else {
                console.error(colors.red(`\n✗ ${suite.name} failed with code ${code}\n`));
                if (errorOutput) {
                    console.error(colors.red('Error output:'));
                    console.error(errorOutput);
                }
                if (output) {
                    console.error(colors.yellow('Standard output:'));
                    console.error(output);
                }
                reject(new Error(`Test suite failed: ${suite.name}`));
            }
        });

        process.on('error', (err) => {
            if (err.code === 'ENOENT') {
                console.error(colors.red(`\n✗ Command not found: ${suite.command}`));
                console.error(colors.yellow(`Please ensure ${suite.command} is installed and available in your PATH\n`));
            } else {
                console.error(colors.red(`\n✗ Error running ${suite.name}: ${err.message}\n`));
            }
            reject(err);
        });
    });
}

// Run all test suites
async function runAllTests() {
    console.log(colors.yellow('\nStarting test execution...\n'));
    console.log(colors.cyan('Using Neon Tech DB:', process.env.PGHOST));

    const results = {
        passed: [],
        failed: []
    };

    for (const suite of testSuites) {
        try {
            await runTestSuite(suite);
            results.passed.push(suite.name);
        } catch (error) {
            results.failed.push(suite.name);
            if (process.env.FAIL_FAST === 'true') {
                break;
            }
        }
    }

    // Print summary
    console.log(colors.yellow('\nTest Execution Summary:\n'));
    
    if (results.passed.length > 0) {
        console.log(colors.green('Passed:'));
        results.passed.forEach(name => console.log(colors.green(`  ✓ ${name}`)));
    }
    
    if (results.failed.length > 0) {
        console.log(colors.red('\nFailed:'));
        results.failed.forEach(name => console.log(colors.red(`  ✗ ${name}`)));
    }

    console.log('\nTotal:', colors.cyan(testSuites.length));
    console.log('Passed:', colors.green(results.passed.length));
    console.log('Failed:', colors.red(results.failed.length));

    // Exit with appropriate code
    process.exit(results.failed.length > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
    console.error(colors.red('\nUnhandled rejection:'), error);
    process.exit(1);
});

// Run tests
runAllTests().catch(error => {
    console.error(colors.red('\nTest execution failed:'), error);
    process.exit(1);
}); 