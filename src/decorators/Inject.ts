import {Container, ConstructorTypeOrName} from "../Container";

export function Inject<T>(targetType: ConstructorTypeOrName<any>, ...targetTypes: ConstructorTypeOrName<any>[]) {
  return (type: any, propertyName?: string) => {
    if (propertyName !== undefined) {
      // Property Injection
      Container.setPropertyDependency<T>(type, propertyName, targetType);
    } else {
      // Constructor injection
      Container.set<T>(type, {
        inject: [ targetType, ...targetTypes ],
      });
    }
  };
}
