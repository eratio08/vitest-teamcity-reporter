import { describe, expect, it } from 'vitest';
import {repeat} from "../utils/repeat";
import {delayPromise} from "../utils/delay-promise";

describe.skip('Example performance async 2 file', () => {
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
