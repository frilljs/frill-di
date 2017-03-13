import * as assert from 'power-assert';
import Container from '../src/Container';

class TestClass {
  name: string = 'default name';
}

class TestSingletonClass {
  name: string = 'default name';
}

class ClassWhichDoesNotExistInContainer {}

describe('Container', function() {
  describe('#defineSingletonClass()', function() {
    it('should be able to define a singleton class', function() {
      assert.doesNotThrow(() => Container.defineSingletonClass(TestSingletonClass));
    });
  });

  describe('#isSingletonClass()', function() {
    it('should be able to determine if a class is singleton', function() {
      assert(Container.isSingletonClass(TestSingletonClass) === true);
    });

    it('should return false when a class is not a singleton', function() {
      assert(Container.isSingletonClass(TestClass) === false);
    });
  });

  describe('#set()', function() {
    it('should be able to set dependency', function() {
      Container.set(TestClass);
      const test = Container.get<TestClass>(TestClass);
      assert(test.name === 'default name');
    });

    it('should be able to set named dependency', function() {
      Container.set('NamedClass', TestClass);
      const test = Container.get<TestClass>('NamedClass');
      assert(test.name === 'default name');
    });

    it('should be able to set a singleton class', function() {
      Container.set(TestSingletonClass);
      const testSingleton = Container.get(TestSingletonClass);
      assert(testSingleton.name === 'default name');
    });

    it('should be able to set a named singleton class', function() {
      Container.set('NamedSingletonClass', TestSingletonClass);
      const testSingleton = Container.get<TestSingletonClass>('NamedSingletonClass');
      assert(testSingleton.name === 'default name');
    });
  });

  describe('#hasDependency()', function() {
    it('should be able to check existence with a class', function() {
      assert(Container.hasDependency(TestClass) === true);
    });

    it('should be able to check existence with a name', function() {
      assert(Container.hasDependency('TestClass') === true);
      assert(Container.hasDependency('NamedClass') === true);
    });

    it('should return false when class or name is a singleton', function() {
      assert(Container.hasDependency(TestSingletonClass) === false);
      assert(Container.hasDependency('TestSingletonClass') === false);
      assert(Container.hasDependency('NamedSingletonClass') === false);
    });

    it('should return false when a class or name doesn\'t exist', function() {
      assert(Container.hasDependency(ClassWhichDoesNotExistInContainer) === false);
      assert(Container.hasDependency('ClassWhichDoesNotExistInContainer') === false);
    });
  });

  describe('#hasSingleton()', function() {
    it('should be able to check existence with a class', function() {
      assert(Container.hasSingleton(TestSingletonClass) === true);
    });

    it('should be able to check existence with a name', function() {
      assert(Container.hasSingleton('TestSingletonClass') === true);
      assert(Container.hasSingleton('NamedSingletonClass') === true);
    });

    it('should return false when a class or name is not singleton', function() {
      assert(Container.hasSingleton(TestClass) === false);
      assert(Container.hasSingleton('TestClass') === false);
      assert(Container.hasSingleton('NamedClass') === false);
    });

    it('should return false when a class or name doesn\'t exist', function() {
      assert(Container.hasSingleton(ClassWhichDoesNotExistInContainer) === false);
      assert(Container.hasSingleton('ClassWhichDoesNotExistInContainer') === false);
    });
  });

  describe('#has()', function() {
    it('should return true when dependency exists', function() {
      assert(Container.has(TestClass) === true);
      assert(Container.has('TestClass') === true);
      assert(Container.has('NamedClass') === true);
    });

    it('should return true when singleton exists', function() {
      assert(Container.has(TestSingletonClass) === true);
      assert(Container.has('TestSingletonClass') === true);
      assert(Container.has('NamedSingletonClass') === true);
    });

    it('should return false when dependency/singleton doesn\'t exist', function() {
      assert(Container.has(ClassWhichDoesNotExistInContainer) === false);
      assert(Container.has('ClassWhichDoesNotExistInContainer') === false);
    });
  });

  describe('#get()', function() {
    it('should be able to get a dependency', function() {
      const test = Container.get(TestClass);
      const test2 = Container.get(TestClass);
      assert(test instanceof TestClass);
      assert(test.name === 'default name');
      assert(test !== test2);
    });

    it('should be able to get a singleton instance', function() {
      const test = Container.get(TestSingletonClass);
      const test2 = Container.get(TestSingletonClass);
      assert(test instanceof TestSingletonClass);
      assert(test.name === 'default name');
      assert(test === test2); // singleton
    });

    it('should throw when trying to get a name which doesn\'t exist', function() {
      assert.throws(
        () => Container.get('ClassWhichDoesNotExistInContainer'),
        /Cannot get instance for ClassWhichDoesNotExistInContainer/
      );
    });

    it('should not throw when trying to get a class which doesn\'t exist', function() {
      const cls = Container.get(ClassWhichDoesNotExistInContainer);
      assert(Container.has(ClassWhichDoesNotExistInContainer) === true);
      assert(cls instanceof ClassWhichDoesNotExistInContainer);
    });
  });

  describe('#remove()', function() {
    it('should be able to remove a dependency by class', function() {
      assert(Container.hasDependency(ClassWhichDoesNotExistInContainer));
      assert(Container.remove(ClassWhichDoesNotExistInContainer) === true);
      assert(Container.has(ClassWhichDoesNotExistInContainer) === false);
      assert(Container.remove(TestClass) === true);
      assert(Container.remove(TestSingletonClass) === true);
    });

    it('should be able to remove a dependency by name', function() {
      assert(Container.remove('NamedClass') === true);
      assert(Container.remove('NamedSingletonClass') === true);
    });
  });

  // describe('#flushAll()', function() {
  //   it('should be able to flush everything in the container', function() {
  //     Container.flushAll();
  //     assert(Container.has(TestClass) === false);
  //     assert(Container.has('TestClass') === false);
  //     assert(Container.has('NamedClass') === false);
  //   });
  // });
});
