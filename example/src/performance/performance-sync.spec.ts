import { describe, expect, it } from 'vitest';



describe.skip('Example performance async 1 file', () => {
  '1'.repeat(20).split('1').map((_, index) => {
    describe(`Performance nested suit ${index}`, () => {
      it('should return true', async () => {
        expect(true).toBeTruthy()
      });

      it('should return false', async () => {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            expect(true).toBeTruthy()
            resolve()
          })
        })
      });
    });
  })
});
