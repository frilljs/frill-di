import {Container, ConstructorType, DependencyOptions} from "../Container";

export function Provide<T>(options?: string | DependencyOptions) {
  return (type: ConstructorType<T>) => {
    if (typeof options === 'string') {
      options = { name: options };
    }
    Container.set(type, options);
  };
}
