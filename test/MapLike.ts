import * as assert from 'power-assert';
import MapLike from "../src/MapLike";

describe('MapLike', function() {
  let map: MapLike<any,any> = new MapLike();
  it('should be able to set a key/value pair, and should return the instance itself', function() {
    const ret1 = map.set('test', { valueKey: 'value' });
    const ret2 = map.set('test2', 'value2');
    assert(ret1 instanceof MapLike);
    assert(ret2 instanceof MapLike);
  });

  it('should be able to get the value set', function() {
    assert.deepEqual(map.get('test'), { valueKey: 'value' });
    assert.deepEqual(map.get('test2'), 'value2');
  });

  it('should be able to check existence of a key', function() {
    assert(map.has('test') === true);
    assert(map.has('test2') === true);
    assert(map.has('key_that_does_not_exist') === false);
  });

  it('should be able to list existing keys', function() {
    const keys = map.keys();
    assert(keys[0] === 'test');
    assert(keys[1] === 'test2');
  });

  it('should be able to list existing values', function() {
    const values = map.values();
    assert.deepEqual(values[0], { valueKey: 'value' });
    assert.deepEqual(values[1], 'value2');
  });

  it('should be able to get the number of entries', function() {
    assert(map.size === 2);
  });

  it('should be able to delete the value by key', function() {
    assert(map.delete('test2') === true);

    // deleted values are set to null
    assert(map.get('test2') === null);
  });

  it('should be able to clear all entries', function() {
    map.clear();

    // when cleared, non-existing value should be undefined instead of null
    assert(map.get('test') === undefined);
  });
});
