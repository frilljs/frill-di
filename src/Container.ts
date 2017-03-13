import MapLike from "./MapLike";

/**
 * I/F and types
 */

export type ConstructorFunction<T> = {
  new (...args: Array<any>): T;
  name?: string;
  [key: string]: any;
}

export interface ClassType<T> {
  name: string;
  type?: ConstructorFunction<T>;
}

export interface DependencyHandler extends ClassType<any> {
  getInstance: () => any;
}

export interface PropertyHandler extends ClassType<any> {
  propertyName: string;
  targetType: ConstructorFunction<any>;
}

export interface SingletonHandler extends ClassType<any> {
  instance: any;
}

/**
 * Key to identify singleton class
 */
const SINGLETON_CLASS = '__SINGLETON_CLASS__';
// const SINGLETON_CLASS = Symbol('__SINGLETON_CLASS__');

/**
 * Key to identify injected property
 */
const INJECTED_PROPERTIES = '__INJECTED_PROPERTIES__';
// const INJECTED_PROPERTY = Symbol('__INJECTED__');

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
      name = typeOrName.name as string || typeOrName.constructor.name as string;
      type = typeOrName;
    }

    if (!name) {
      throw new Error(`Cannot detect the name of the class. Specify a valid a name for "${type}".`);
    }

    return { name, type };
  }

  /**
   * Set a new dependent property
   * @param typeOrName
   * @param propertyName
   * @param targetTypeOrName
   * @private
   */
  private static _setDependentProperty<T>(typeOrName: ConstructorFunction<T> | string, propertyName: string, targetTypeOrName: ConstructorFunction<T> | string) {
    const classType = this._resolveClassType(typeOrName);
    const { type: targetType } = this._resolveClassType(targetTypeOrName);

    if (!this.has(classType.name)) {
      this.set(classType.type as ConstructorFunction<T>);
    }

    // this._setDependentPropertyHandler({
    //   ...classType,
    //   propertyName,
    //   targetType,
    // });
  }

  /**
   * Set a new dependency class
   * @param type
   */
  private static _setDependency<T>(type: ConstructorFunction<T>): void;
  private static _setDependency<T>(name: string, type: ConstructorFunction<T>): void;
  private static _setDependency<T>(typeOrName: ConstructorFunction<T> | string, type?: ConstructorFunction<T>): void {
    const { name, type: Type } = this._resolveClassType(typeOrName, type);

    if (!Type) {
      throw new TypeError(`Cannot find dependency class to instantiate for ${name}`);
    }

    this._setDependencyHandler({
      name,
      type: Type,
      // gets called each time we get() the class
      getInstance: () => new Type(),
    });
  }

  /**
   * Set a new singleton class
   * @param type
   */
  private static _setSingleton<T>(type: ConstructorFunction<T>): void;
  private static _setSingleton<T>(name: string, type: ConstructorFunction<T>): void;
  private static _setSingleton<T>(typeOrName: ConstructorFunction<T> | string, type?: ConstructorFunction<T>): void {
    const { name, type: Type } = this._resolveClassType(typeOrName, type);

    if (!Type) {
      throw new TypeError(`Cannot find singleton class to instantiate for ${name}`);
    }

    // type should be defined as a singleton
    this.defineSingletonClass(Type);

    this._setSingletonHandler({
      name,
      type: Type,
      // singleton instance
      instance: new Type(),
    });
  }

  private static setDependentProperty<T>(typeOrName: ConstructorFunction<T> | string, propertyName: string, targetTypeOrName: ConstructorFunction<T> | string) {
    const { name, type } = this._resolveClassType(typeOrName);
    // const { name: targetName, type: targetType } = this._resolveClassType(targetTypeOrName);

    this._setDependentPropertyHandler({
      name,
      type,
      propertyName,
      target: targetTypeOrName,
    })
  }

  /**
   * Set a dependency/singleton to the container
   * @param type
   */
  static set<T>(type: ConstructorFunction<T>): void;
  static set<T>(name: string, type: ConstructorFunction<T>): void;
  static set<T>(typeOrName: ConstructorFunction<T> | string, type?: ConstructorFunction<T>): void {
    const { name, type: Type } = this._resolveClassType(typeOrName, type);

    if (!Type) {
      throw new TypeError(`Cannot find class to set for ${name}`);
    }

    // TODO: handle dependent properties

    if (this.isSingletonClass(Type)) {
      this._setSingleton(name, Type);
    } else {
      this._setDependency(name, Type);
    }
  }

  /**
   * Check if a given class property is defined as a dependent property
   * @param type
   * @param propertyName
   * @return {any}
   */
  static isDependentProperty<T>(type: ConstructorFunction<T>, propertyName: string) : boolean {
    const dependentProperties = type[INJECTED_PROPERTIES];
    if (!dependentProperties) {
      return false;
    }
    return !!dependentProperties[propertyName];
  }

  /**
   * Check if a class has any dependent properties
   * @param type
   * @return {Boolean}
   */
  static hasDependentProperty<T>(type: ConstructorFunction<T>) : boolean {
    // TODO: check from container
    return Boolean(type[INJECTED_PROPERTIES]);
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
   * Define a dependent property
   * @param type
   * @param propertyName
   * @param targetType
   */
  static defineDependentProperty<T>(type: ConstructorFunction<T>, propertyName: string, targetTypeOrName: ConstructorFunction<T> | string) {
    // Do nothing if property is already defined
    if (!this.isDependentProperty(type, propertyName)) {
      const dependentProperties = type[INJECTED_PROPERTIES] || {};
      dependentProperties[propertyName] = targetTypeOrName;

      Object.defineProperty(type, INJECTED_PROPERTIES, {
        value: dependentProperties,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
  }

  /**
   * Remove the given name/class from the container
   * @param typeOrName
   * @return {boolean}
   */
  static remove<T>(typeOrName: ConstructorFunction<T> | string): boolean {
    const { name } = this._resolveClassType(typeOrName);

    // TODO: remove properties

    if (this.hasSingleton(name)) {
      return this._singletonHandlers.delete(name);
    }

    if (this.hasDependency(name)) {
      return this._dependencyHandlers.delete(name);
    }

    return false;
  }

  // /**
  //  * Flush all the dependency instances/singleton instances/properties
  //  */
  // static flushAll() {
  //   this._dependencyHandlers.clear();
  //   this._singletonHandlers.clear();
  //   this._dependentPropertyHandlers.clear();
  // }

  static dependencyKeys(): Array<string> {
    return this._dependencyHandlers.keys();
  }

  static singletonKeys(): Array<string> {
    return this._singletonHandlers.keys();
  }

  static keys(): Array<string> {
    return [
      ...this.dependencyKeys(),
      ...this.singletonKeys(),
    ];
  }

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
      this.set(name, type as ConstructorFunction<T>);
    }

    if (this.hasSingleton(name)) {
      return (this._singletonHandlers.get(name) as SingletonHandler).instance;
    }

    if (this.hasDependency(name)) {
      return (this._dependencyHandlers.get(name) as DependencyHandler).getInstance();
    }

    throw new TypeError(
      `Cannot get instance for ${name}, you should do Container.get(Class) or Container.get('name', Class)`
    );
  }
}
