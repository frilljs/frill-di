import {test} from "ava";
import {Container} from "../../src/Container";
import {Inject} from "../../src/index";

class Example {
  value: 1;
}

test.afterEach(() => {
  Container.flush();
});

test('should be able to inject dependency into constructor', (t) => {
  @Inject(Example)
  class Test {
    foo: Example;
    constructor(example: Example) {
      this.foo = example;
    }
  }

  const test = Container.get(Test);
  t.is(Container.has(Test), true);
  t.is(Container.has(Example), true);
  t.true(test instanceof Test);
  t.true(test.foo instanceof Example);
});

test('should be able to inject property dependency', (t) => {
  class Test {
    @Inject(Example)
    example: Example;
  }

  const test = Container.get(Test);
  t.is(Container.has(Test), true);
  t.is(Container.has(Example), true);
  t.true(test instanceof Test);
  t.true(test.example instanceof Example);
});

