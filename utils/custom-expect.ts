// Import Playwright's base expect so we can extend it with custom matcher behavior.
import { expect as baseExpect } from '@playwright/test';
// Import the API logger type so custom matchers can attach API logs to failures.
import { APILogger } from './logger';
import { validateSchema } from './schema-validator';

// Global variable to hold the API logger instance used by custom expect matchers.
let apiLogger: APILogger;

// Setter used by fixtures to wire the current API logger into custom expect.
export const setCustomExpectLogger = (logger: APILogger) => {
    apiLogger = logger;
};

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            // Custom matcher to compare values with a readable failure message.
            shouldEqual(expected: T): R;
            // Custom matcher intended for less-than-or-equal comparisons.
            shouldBeLessThanOrEqual(expected: T): R;
            shouldMatchSchema(dirName: string, fileName: string, createSchemaFlag?: boolean): Promise<R>;
        }
    }
}

// Extend Playwright's expect with custom matcher implementations.
export const expect = baseExpect.extend({

    async shouldMatchSchema(received: any, dirName:string, fileName:string, createSchemaFlag: boolean = false) {
        let pass: boolean;
        let message: string ='';
        
        try {
            // Use the built-in Playwright matcher to evaluate the expectation.
            await validateSchema(dirName, fileName, received, createSchemaFlag);
            pass = true;
            message= 'Schema validation passed successfully.';
            // If the matcher is used in a negated form, collect API logs for diagnostics.
        } catch (e: any) {
            // If the assertion failed, mark the matcher as failed and capture API logs.
            pass = false;
            const logs = apiLogger.getRecentLogs();
            message = `${e.message}\n\n` +
                `Recent API Logs:\n${logs}`;
        }

        return {
            // Return the custom failure message and the pass/fail status.
            message: () => message,
            pass,
        };
    },

    shouldEqual(received: any, expected: any) {
        let pass: boolean;
        let logs: string = '';

        try {
            // Use the built-in Playwright matcher to evaluate the expectation.
            baseExpect(received).toEqual(expected);
            pass = true;
            // If the matcher is used in a negated form, collect API logs for diagnostics.
            if (this.isNot) {
                logs = apiLogger.getRecentLogs();
            }
        } catch (e: any) {
            // If the assertion failed, mark the matcher as failed and capture API logs.
            pass = false;
            logs = apiLogger.getRecentLogs();
        }

        const hint = this.isNot ? 'not' : '';
        const message =
            this.utils.matcherHint('shouldEqual', undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}\n\n` +
            `Recent API Logs:\n${logs}`;

        return {
            // Return the custom failure message and the pass/fail status.
            message: () => message,
            pass,
        };
    },

    shouldBeLessThanOrEqual(received: any, expected: any) {
        let pass: boolean;
        let logs: string = '';

        try {
            // The matcher currently reuses the built-in equality check.
            // In a future update this could be changed to compare numeric values.
            baseExpect(received).toEqual(expected);
            pass = true;
            if (this.isNot) {
                logs = apiLogger.getRecentLogs();
            }
        } catch (e: any) {
            pass = false;
            logs = apiLogger.getRecentLogs();
        }

        const hint = this.isNot ? 'not' : '';
        const message =
            this.utils.matcherHint('shouldBeLessThanOrEqual', undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}\n\n` +
            `Recent API Logs:\n${logs}`;

        return {
            message: () => message,
            pass,
        };
    },
});