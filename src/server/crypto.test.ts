import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isRealValue } from './crypto';

describe('isRealValue', () => {
  test('returns false for empty or falsy inputs', () => {
    assert.equal(isRealValue(undefined), false);
    assert.equal(isRealValue(''), false);
    assert.equal(isRealValue('   '), false);
  });

  test('returns false for specific placeholder literal strings', () => {
    assert.equal(isRealValue('PLACEHOLDER'), false);
    assert.equal(isRealValue('undefined'), false);
    assert.equal(isRealValue('null'), false);
    assert.equal(isRealValue('  PLACEHOLDER  '), false);
    assert.equal(isRealValue('  undefined  '), false);
    assert.equal(isRealValue('  null  '), false);
  });

  test('returns false for strings containing placeholder hints', () => {
    assert.equal(isRealValue('REPLACE_WITH_YOUR_REAL_KEY'), false);
    assert.equal(isRealValue('some_prefix_REPLACE_WITH_YOUR_REAL_KEY_suffix'), false);
    assert.equal(isRealValue('YOUR_API_KEY'), false);
    assert.equal(isRealValue('prefix_YOUR_API_KEY_suffix'), false);
  });

  test('returns false for sandbox/scrambled values longer than 20 chars containing special symbols', () => {
    // Length > 20 and contains '#'
    assert.equal(isRealValue('this_is_a_very_long_string_with_#_symbol'), false);
    // Length > 20 and contains '!'
    assert.equal(isRealValue('this_is_a_very_long_string_with_!_symbol'), false);
    // Length > 20 and contains '@'
    assert.equal(isRealValue('this_is_a_very_long_string_with_@_symbol'), false);

    // Test boundary condition: length exactly 20 with special symbol should return true
    // "1234567890123456789#" is exactly 20 chars
    assert.equal(isRealValue('1234567890123456789#'), true);
  });

  test('returns true for valid API keys or identifiers', () => {
    assert.equal(isRealValue('sk-1234567890abcdef'), true);
    assert.equal(isRealValue('valid_identifier_123'), true);
    // Length > 20 but no special symbols
    assert.equal(isRealValue('this_is_a_very_long_string_without_symbols'), true);
    // Length < 20 with special symbols
    assert.equal(isRealValue('short_string_#'), true);
    assert.equal(isRealValue('short_string_!'), true);
    assert.equal(isRealValue('short_string_@'), true);
  });
});
