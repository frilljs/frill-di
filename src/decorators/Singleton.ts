import {ConstructorFunction, default as Container} from "../Container";

export default function Singleton<T>(name?: string) {
  return (type: ConstructorFunction<T>) => {
    // Tell the container that this type is a singleton
    Container.defineSingletonClass(type);

    if (name !== undefined) {
      Container.set(name, type);
    } else {
      Container.set(type);
    }
  };
}
