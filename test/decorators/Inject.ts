import * as assert from 'power-assert'
import Container from "../../src/Container";
import Provide from "../../src/decorators/Provide";
import Inject from "../../src/decorators/Inject";
import Singleton from "../../src/decorators/Singleton";

describe('@Inject() decorator', function() {

  class FooService {
    serviceName = 'foo';
  }

  @Singleton()
  class SingletonService {
    name = 'dependency';

    @Inject(FooService)
    foo: FooService;
  }

  @Provide('Bar')
  class BarService {
    serviceName = 'bar';

    @Inject(FooService)
    foo: FooService;
  }

  class BazService {
    @Inject(FooService)
    foo: FooService;

    @Inject(BarService)
    bar: BarService;
  }

  class QuxService {
    singleton: SingletonService;
    baz: BazService;
    constructor(singleton: SingletonService, baz: BazService) {
      this.singleton = singleton;
      this.baz = baz;
    }
  }

  // it('foo', function() {
  //   assert(Container.set(QuxService));
  // });
});
