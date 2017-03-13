import * as assert from 'power-assert'
import Container from "../../src/Container";
import Provide from "../../src/decorators/Provide";

describe('@Provide() decorator', function() {
  @Provide()
  class ProvidedClassWithDecorator {}

  @Provide('NamedClassWithDecorator')
  class NamedProvidedClassWithDecorator {}

  it('should be provided as a dependency through the container', function() {
    assert(Container.hasDependency(ProvidedClassWithDecorator) === true);
  });

  it('should be able to provide a named dependency', function() {
    assert(Container.hasDependency('NamedClassWithDecorator') === true);

    // Named dependency cannot be determined by the actual class
    assert(Container.hasDependency(NamedProvidedClassWithDecorator) === false);
  });

  it('should not be singleton', function() {
    assert(Container.get(ProvidedClassWithDecorator) !== Container.get(ProvidedClassWithDecorator));
    assert(Container.get('NamedClassWithDecorator') !== Container.get('NamedClassWithDecorator'));
  });
});
