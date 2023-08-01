import {describe, expect, it} from 'vitest';
import {delayPromise} from "../utils/delay-promise";
import {repeat} from "../utils/repeat";

describe('Example performance async 1 file', () => {
    repeat(20, (index) => {
        describe(`Performance nested suit ${index}`, () => {
            it('should return true', async () => {
                await delayPromise();
                expect(true).toBeTruthy()
            });

            it('should return false', async () => {
                await delayPromise();
                expect(true).toBeTruthy()
            });
        });
    })
});
