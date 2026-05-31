// Import the Playwright base test fixture so we can extend it.
import {test as base} from '@playwright/test';
// Import the helper that wraps Playwright request handling for API calls.
import { RequestHandler } from './request-handler';
// Import a logger class for recording API interactions and assertion details.
import { APILogger } from './logger';
// Import a helper that hooks into custom expect assertions so they can use the logger.
import { setCustomExpectLogger } from './custom-expect';
// Import shared configuration values such as the API base URL.
import { config } from '../api-test.config';
import { createToken } from '../helpers/createToken';

type TestOptions = {
    // The API fixture provides an instance of RequestHandler to tests.
    api: RequestHandler;
    // The config fixture provides the shared test configuration object.
    config: typeof config;
};

export type workerFixtures = {
    authToken: string;
};


// Extend Playwright's base test fixture with our custom API and config fixtures.
export const test = base.extend<TestOptions, workerFixtures>({

    authToken: [async({}, use) => {
        const authToken= await createToken(config.userEmail, config.userPassword);
        await use(authToken);
    },{scope:'worker'}],

    api: async ({request,authToken}, use) => {
        // Create a new logger for API request events and responses.
        const logger = new APILogger();
        // Configure the custom expect helper to send assertion logs to this logger.
        setCustomExpectLogger(logger);
        // Create a RequestHandler instance that uses Playwright's request object,
        // the configured API base URL, and the logger for tracing requests.
        const requestHandler = new RequestHandler(request, config.apiUrl, logger,authToken);
        // Provide the request handler to the test, then clean up when the test completes.
        await use(requestHandler);
    },
    config: async ({}, use) => {
        // Provide the shared config object to tests as a fixture.
        await use(config);
    }
});