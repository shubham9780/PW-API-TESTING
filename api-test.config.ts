// Determine the target environment from the TEST_ENV environment variable.
const processENV = process.env.TEST_ENV;
const env = processENV ? processENV : 'dev';

// Shared API configuration values used by the test framework.
const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: 'shubhapiuser@test.com',
    userPassword: 'Password@9780',
};

// Override configuration values when the environment is QA.
if (env === 'QA') {
    config.apiUrl = 'https://qa-conduit-api.bondaracademy.com/api';
    config.userEmail = 'shubhapiuser@test.com';
    config.userPassword = 'Password@9780';
}

export { config };
