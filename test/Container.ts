import {Container} from '../src/Container';
import {test} from "ava";

// Simple class
class A {
  name = 'name for A';
}

// Class with one dependency
class B {
  name = 'name for B';
  a: A;
}

// Class with two constructor dependency
class C {
  name = 'name for C';
  a: A;
  b: B;
  constructor(a: A, b: B) {
    this.a = a;
    this.b = b;
  }
}

// Class with circular reference
class D {
  name = 'name for D';
  e: E;
}

// Class with circular reference
class E {
  name = 'name for E';
  d: D;
}

test.afterEach(() => {
  Container.flush();
});

test('should set a dependency', (t) => {
  Container.set(A);
  t.true(Container.has(A));
  t.true(Container.get(A) instanceof A);
  t.is(Container.get(A).name, 'name for A');
});

test('should set the name of the class as a name for the dependency', (t) => {
  Container.set(A);
  t.true(Container.has('A'));
  t.true(Container.get('A') instanceof A);
  t.is(Container.get<A>('A').name, 'name for A');
});

test('should be able to remove a dependency', (t) => {
  Container.set(A);
  t.true(Container.has(A));

  Container.remove(A);
  t.false(Container.has(A));
});

test('should be able to set and remove a named dependency', (t) => {
  Container.set(A, { name: 'test' });
  t.true(Container.has('test'));
  t.false(Container.has('A'));

  Container.remove('test');
  t.false(Container.has('test'));
  t.false(Container.has(A));
});

test('should be able to get a dependency which is not set', (t) => {
  class SomeClass {}
  t.true(Container.get(SomeClass) instanceof SomeClass);
  t.true(Container.has(SomeClass));
});

test('should return a new instance for normal dependencies', (t) => {
  Container.set(A);
  // Shouldn't be a singleton
  t.true(Container.get(A) !== Container.get(A));
});

test('should be able to create a singleton', (t) => {
  class SingletonTest {
    name: string = 'not-modified';
  }

  Container.set(SingletonTest, { singleton: true });

  const singletonTest = Container.get(SingletonTest);

  // Should be identical
  t.true(Container.get(SingletonTest) === singletonTest);

  singletonTest.name = 'modified';
  t.is(Container.get(SingletonTest).name, 'modified');
});

test('should be able to inject into class property', (t) => {
  Container.set(B, { injectProperties: { a: A } });
  Container.set(C, { injectProperties: { a: A, b: B } });

  // A gets resolved at the first get();
  t.false(Container.has(A));

  const b = Container.get(B);

  // A gets resolved at the first get();
  t.true(Container.has(A));

  const c = Container.get(C);
  t.true(b.a instanceof A);
  t.true(c.a instanceof A);
  t.true(c.b instanceof B);
});

test('should be able to add property injection dynamically', (t) => {
  Container.set(C, { injectProperties: { a: A } });

  const c = Container.get(C);
  t.true(c.a instanceof A);
  t.true(c.b === undefined);

  Container.setPropertyDependency(C, 'b', B);

  const c2 = Container.get(C);
  t.true(c2.a instanceof A);
  t.true(c2.b instanceof B);
});

test('should properly handle a injected class property in a singleton', (t) => {
  Container.set(A);
  Container.set(B, { singleton: true });
  Container.setPropertyDependency(B, 'a', A);
  const b = Container.get(B);

  t.true(b.a instanceof A);
  t.is(b, Container.get(B));
  t.is(b.a, Container.get(B).a);
  t.not(b.a, Container.get(A));
});

test('should properly handle singleton injected in a property', (t) => {
  Container.set(B, { singleton: true });
  Container.set(C, { injectProperties: { a: A, b: B } });
  const c = Container.get(C);

  // C is not a singleton
  t.not(c, Container.get(C));
  // B is a singleton
  t.is(c.b, Container.get(C).b);
});

test('should be able to handle constructor injection', (t) => {
  // Same as new C(new A(), new B()), except all dependencies of A, B, C is resolved by the container
  Container.set(C, { inject: [ A, B ] });
  const c = Container.get(C);
  t.true(c.a instanceof A);
  t.true(c.b instanceof B);
});

test.todo('should throw on circular reference of dependencies');


