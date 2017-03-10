import {ConstructorFunction, default as Container} from "../Container";

export default function Provide<T>(name?: string) {
  return (type: ConstructorFunction<T>) => {
    if (name !== undefined) {
      Container.set(name, type);
    } else {
      Container.set(type);
    }
  };
}
