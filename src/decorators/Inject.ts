import {ConstructorFunction, default as Container} from "../Container";

export default function Inject<T>(targetTypeOrName: ConstructorFunction<T> | string) {
  return (type: any, propertyName: string) => {
    Container.defineDependentProperty(type, propertyName, targetTypeOrName);
  };
}
