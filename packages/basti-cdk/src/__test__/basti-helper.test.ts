import { generateShortId } from '../basti-helper';

describe('BastiHelperTest', () => {
  test('generate-short-solutions', () => {
    // We can just calculate the sha1 of the seed and take the first 8 characters.
    const testCases = [
      ['basti', '9098881d'],
      ['basti-cdk', '8e5397d0'],
      ['basti-cdk-lib', '9619cfd1'],
      ['basti-cdk-lib-aws', 'cf1c336d'],
      ['basti-instance', 'cfa6c72d'],
      ['Basti Instance', '49d0ba9c'],
      ['BastiInstance', '9bb9144b'],
      ['BastiInstanceTest', 'cf473375'],
    ];

    for (const testCase of testCases) {
      const seed = testCase[0];
      const expected = testCase[1];
      const actual = generateShortId(seed);
      expect(actual).toEqual(expected);
    }
  });
});
