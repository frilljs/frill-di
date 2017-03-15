import {ConstructorType, Container, DependencyOptions} from "../Container";

export function Singleton<T>(options: string | DependencyOptions = {}) {
  return (type: ConstructorType<T>) => {
    if (typeof options === 'string') {
      options = {name: options};
    }

    // Always singleton if this decorator is used
    options.singleton = true;

    Container.set(type, options);
  };
}
