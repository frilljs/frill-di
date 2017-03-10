import MapLike from "./MapLike";

/**
 * I/F and types
 */

export type ConstructorFunction<T> = {
  new (...args: any[]): T,
  // name: string,
};

export interface ClassType<T> {
  name: string;
  type?: ConstructorFunction<T>;
}

export interface DependencyHandler extends ClassType<any> {
  getInstance: () => any,
}

export interface PropertyHandler extends ClassType<any> {
  propertyName: string,
  target: ClassType<any>,
}

export interface SingletonHandler extends ClassType<any> {
  instance: any,
}

/**
 * Key to identify singleton class
 */
const SINGLETON_CLASS = '__SINGLETON_CLASS__';
// const SINGLETON_CLASS = Symbol('__SINGLETON_CLASS__');

/**
 * Container
 *
 * An IoC container.
 */
export default class Container {
  /**
   * Map of dependencies
   * @type {MapLike<string, DependencyHandler>}
   * @private
   */
  private static _dependencyHandlers = new MapLike<string, DependencyHandler>();
  // private static _dependencyHandlers = new Map<string, DependencyHandler>();

  /**
   * Map of properties which has dependencies to resolve
   * The map key is the name of class which the property belongs to
   * @type {MapLike<string, PropertyHandler>}
   * @private
   */
  private static _dependentPropertyHandlers = new MapLike<string, PropertyHandler>();
  // private static _dependentPropertyHandlers = new Map<string, PropertyHandler>();

  /**
   * Map of singletons
   * @type {MapLike<string, SingletonHandler>}
   * @private
   */
  private static _singletonHandlers = new MapLike<string, SingletonHandler>();
  // private static _singletonHandlers = new Map<string, SingletonHandler>();

  /**
   * Set dependency handler
   * @param handler
   * @private
   */
  private static _setDependencyHandler(handler: DependencyHandler) {
    this._dependencyHandlers.set(handler.name, handler);
  }

  /**
   * Set singleton handler
   * @param handler
   * @private
   */
  private static _setSingletonHandler(handler: SingletonHandler) {
    this._singletonHandlers.set(handler.name, handler);
  }

  /**
   * Set the property dependency handler
   * @param handler
   * @private
   */
  private static _setDependentPropertyHandler(handler: PropertyHandler) {
    this._dependentPropertyHandlers.set(handler.name, handler);
  }

  /**
   * Resolve ClassType of a class or name
   * @param typeOrName
   * @param type
   * @return {{name: string, type: ConstructorFunction<T>}}
   * @private
   */
  private static _resolveClassType<T>(typeOrName: ConstructorFunction<T> | string, type?: ConstructorFunction<T>): ClassType<T> | never {
    let name: string;
    if (typeof typeOrName === 'string') {
      name = typeOrName;
    } else {
      name = typeOrName.name;
      type = typeOrName;
    }

    if (!name) {
      throw new Error(`Cannot detect the name of the class. Specify a valid a name for "${type}".`);
    }

    return { name, type };
  }

  /**
   * Set a new dependency class
   * @param type
   */
  private static setDependency<T>(type: ConstructorFunction<T>);
  private static setDependency<T>(name: string, type: ConstructorFunction<T>);
  private static setDependency<T>(typeOrName: ConstructorFunction<T> | string, type?: ConstructorFunction<T>) {
    const classType = this._resolveClassType(typeOrName, type);
    this._setDependencyHandler({
      ...classType,

      // gets called each time we get() the class
      getInstance: () => new type(),
    });
  }

  /**
   * Set a new singleton class
   * @param type
   */
  private static setSingleton<T>(type: ConstructorFunction<T>);
  private static setSingleton<T>(name: string, type: ConstructorFunction<T>);
  private static setSingleton<T>(typeOrName: ConstructorFunction<T> | string, type?: ConstructorFunction<T>) {
    const classType = this._resolveClassType(typeOrName, type);

    // type should be defined as a singleton
    this.defineSingletonClass(classType.type);

    this._setSingletonHandler({
      ...classType,

      // singleton instance
      instance: new type(),
    });
  }

  /**
   * Set a dependency/singleton to the container
   * @param type
   */
  static set<T>(type: ConstructorFunction<T>);
  static set<T>(name: string, type: ConstructorFunction<T>);
  static set<T>(typeOrName: ConstructorFunction<T> | string, type?: ConstructorFunction<T>) {
    const classType = this._resolveClassType(typeOrName, type);
    if (this.isSingletonClass(classType.type)) {
      this.setSingleton(classType.name, classType.type);
    } else {
      this.setDependency(classType.name, classType.type);
    }
  }

  /**
   * Define a property to a class, to identify if the class has to be a singleton
   * @param type
   */
  static defineSingletonClass<T>(type: ConstructorFunction<T>) {
    // Do nothing if the type is already defined as a singleton
    if (!this.isSingletonClass(type)) {
      Object.defineProperty(type, SINGLETON_CLASS, {
        value: true,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
  }

  /**
   * Check if a given class is defined as a singleton class
   * @param type
   * @return {Boolean}
   */
  static isSingletonClass<T>(type: ConstructorFunction<T>) {
    return Boolean(type[SINGLETON_CLASS]);
  }

  /**
   * Check if the given name/class is a singleton managed by the container
   * @param typeOrName
   * @return {boolean}
   */
  static hasSingleton<T>(typeOrName: ConstructorFunction<T> | string): boolean {
    const { name } = this._resolveClassType(typeOrName);
    return this._singletonHandlers.has(name);
  }

  /**
   * Check if the given name/class is a dependency managed by the container
   * @param typeOrName
   * @return {boolean}
   */
  static hasDependency<T>(typeOrName: ConstructorFunction<T> | string): boolean {
    const { name } = this._resolveClassType(typeOrName);
    return this._dependencyHandlers.has(name);
  }

  /**
   * Check if the given name/class is managed by the container
   * @param typeOrName
   */
  static has<T>(typeOrName: ConstructorFunction<T> | string): boolean {
    return this.hasDependency(typeOrName) || this.hasSingleton(typeOrName);
  }

  /**
   * Remove the given name/class from the container
   * @param typeOrName
   * @return {boolean}
   */
  static remove<T>(typeOrName: ConstructorFunction<T> | string): boolean {
    const { name } = this._resolveClassType(typeOrName);

    if (this.hasSingleton(name)) {
      return this._singletonHandlers.delete(name);
    }

    if (this.hasDependency(name)) {
      return this._dependencyHandlers.delete(name);
    }

    // TODO: remove properties
  }

  static defineDependentProperty<T>(type: ConstructorFunction<T>, propertyName: string, targetType: ConstructorFunction<T>) {
    // Set the classes if it doesn't exist in the container
    if (!this.has(type)) this.set(type);
    if (!this.has(targetType)) this.set(targetType);

    const classType = this._resolveClassType(type);
    const targetClassType = this._resolveClassType(targetType);

    this._setDependentPropertyHandler({
      ...classType,
      propertyName,
      target: targetClassType,
    });
  }

  static flushAll() {
    this._dependencyHandlers.clear();
    this._singletonHandlers.clear();
    this._dependentPropertyHandlers.clear();
  }

  // static setPropertyDependency<T>(typeOrName: ConstructorFunction<T> | string, propertyName: string, targetTypeOrName: ConstructorFunction<T> | string) {
  //   const classType = this._resolveClassType(typeOrName);
  //   const targetClassType = this._resolveClassType(targetTypeOrName);
  //
  //   if (!this.has(classType.name)) {
  //     this.set(classType.type);
  //   }
  //
  //   this._setPropertyDependency({
  //     ...classType,
  //     propertyName,
  //     target: targetClassType,
  //   });
  // }


  /**
   * Get the resolved instance of a class
   * @param typeOrName
   * @return {any}
   */
  static get<T>(typeOrName: ConstructorFunction<T> | string): T | never {
    const { name, type } = this._resolveClassType(typeOrName);
    const classExists = this.has(name);

    if (!classExists && type === undefined) {
      throw new TypeError(
        `Cannot get instance for ${name}, you should do Container.get(Class) or Container.get('name', Class)`
      );
    }

    if (!classExists) {
      this.set(name, type);
    }

    if (this.hasSingleton(name)) {
      return this._singletonHandlers.get(name).instance;
    }

    if (this.hasDependency(name)) {
      return this._dependencyHandlers.get(name).getInstance();
    }
  }
}
