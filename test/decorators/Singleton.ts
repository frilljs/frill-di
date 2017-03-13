import * as assert from 'power-assert'
import Container from "../../src/Container";
import Singleton from "../../src/decorators/Singleton";

describe('@Singleton() decorator', function() {
  @Singleton()
  class SingletonClassWithDecorator {}

  @Singleton('NamedSingletonWithDecorator')
  class NamedSingletonClassWithDecorator {}

  it('should be provided as a singleton through the container', function() {
    assert(Container.hasSingleton(SingletonClassWithDecorator) === true);
  });

  it('should be able to provide a named singleton', function() {
    assert(Container.hasSingleton('NamedSingletonWithDecorator') === true);

    // Named singleton cannot be determined by the actual class
    assert(Container.hasSingleton(NamedSingletonClassWithDecorator) === false);
  });

  it('should be singleton', function() {
    assert(Container.get(SingletonClassWithDecorator) === Container.get(SingletonClassWithDecorator));
    assert(Container.get('NamedSingletonWithDecorator') === Container.get('NamedSingletonWithDecorator'));
  });
});
