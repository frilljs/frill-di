/**
 * I/F and types
 */


export type ConstructorType<T> = {
  new (...args: any[]): T;
  [key: string]: any;
}

export type ConstructorTypeOrName<T> = ConstructorType<T> | string;

export interface PropertyDependencyHandlers {
  [propertyName: string]: ConstructorTypeOrName<any>;
}

export interface DependencyOptions {
  name?: string;
  inject?: ConstructorTypeOrName<any>[];
  injectProperties?: PropertyDependencyHandlers;
  singleton?: boolean;
}

export interface DependencyHandler<T> {
  name: string;
  type: ConstructorType<T>;
  inject: ConstructorType<any>[];
  injectProperties: PropertyDependencyHandlers;
  singleton: boolean;
  getInstance: () => T;
}

/**
 * Container
 *
 * An IoC container.
 */
export class Container {
  /**
   * Map of dependencies
   * @type {Map<ConstructorType<any>, DependencyHandler<any>>}
   * @private
   */
  private static _dependencies = new Map<ConstructorType<any>, DependencyHandler<any>>();

  /**
   * Map of singleton instances
   * @type {Map<ConstructorType<any>, any>}
   * @private
   */
  private static _singletonInstances = new Map<ConstructorType<any>, any>();

  /**
   * Resolve the name from the given type
   * @param type
   * @return {string}
   * @private
   */
  private static _resolveName<T>(type: ConstructorType<T>) {
    return type.name || type.constructor.name;
  }

  /**
   * Get the name for the type/name
   * @param typeOrName
   * @return {string}
   * @private
   */
  private static _getName<T>(typeOrName: ConstructorTypeOrName<T>): string {
    if (typeof typeOrName === 'string') {
      return typeOrName;
    }

    if (!this.has(typeOrName)) {
      return this._resolveName<T>(typeOrName);
    }

    const handler = this._getDependencyHandler(typeOrName) as DependencyHandler<T>;
    return handler.name;
  }

  /**
   * Get the type for the type/name
   * @param typeOrName
   * @return {any}
   * @private
   */
  private static _getType<T>(typeOrName: ConstructorTypeOrName<T>): ConstructorType<T> | undefined {
    if (typeof typeOrName !== 'string') {
      return typeOrName;
    }

    const handler = this._getDependencyHandler<T>(typeOrName) as DependencyHandler<T>;
    return handler ? handler.type : undefined;
  }

  /**
   * Get the dependency handler for the type/name
   * @param typeOrName
   * @return {any}
   * @private
   */
  private static _getDependencyHandler<T>(typeOrName: ConstructorTypeOrName<T>): DependencyHandler<T> | undefined {
    let handler: DependencyHandler<T> | undefined;

    if (typeof typeOrName !== 'string') {
      handler = this._dependencies.get(typeOrName);
    } else {
      this._dependencies.forEach((_handler) => {
        if (_handler.name === typeOrName) {
          handler = _handler;
        }
      });
    }

    // if (!handler) {
    //   throw new TypeError('Trying to get a dependency which is not set in container');
    // }

    return handler;
  }

  /**
   * Set the dependency handler for the type
   * @param type
   * @param handler
   * @private
   */
  private static _setDependencyHandler<T>(type: ConstructorType<T>, handler: DependencyHandler<T>): void {
    this._dependencies.set(type, handler);
  }

  /**
   * Set a property dependency for the given type
   * @param type
   * @param propertyName
   * @param targetType
   * @private
   */
  private static _setPropertyDependencyHandler<T>(type: ConstructorType<T>, propertyName: string, targetType: ConstructorTypeOrName<any>): void | never {
    if (!this._dependencies.has(type)) {
      throw new TypeError(`Trying to set a property dependency of ${type} which doesn't exist`);
    }

    const handler = this._dependencies.get(type) as DependencyHandler<T>;
    handler.injectProperties[propertyName] = targetType;
  }

  /**
   * Injects the constructor dependencies to the given type
   * @param type
   * @param params
   * @return {any}
   * @private
   */
  private static _injectConstructor<T>(type: ConstructorType<T>, params: ConstructorTypeOrName<any>[]) {
    return type.bind.apply(type, [type, ...params.map((param) => this.get(param))]);
  }

  /**
   * Injects the property dependency
   * @param type
   * @param propertyName
   * @param targetType
   * @private
   */
  private static _injectProperty<T>(type: T, propertyName: string, targetType: ConstructorTypeOrName<any>) {
    Object.defineProperty(type, propertyName, {
      enumerable: true,
      writable: false,
      configurable: false,
      value: this.get(targetType),
    })
  }

  /**
   * Resolve the dependencies for type, and returns the injected instance
   * @param type
   * @private
   */
  private static _resolve<T>(type: ConstructorType<T>): T {
    const handler = this._getDependencyHandler(type) as DependencyHandler<T>;
    const Type = this._injectConstructor(handler.type, handler.inject);
    const instance = new Type();

    if (Object.keys(handler.injectProperties).length) {
      // Class property injection
      const injectProperties = handler.injectProperties;
      Object.keys(injectProperties).forEach((propertyName) => {
        const value = injectProperties[propertyName];
        this._injectProperty(instance, propertyName, value);
      });
    }

    return instance;
  }

  /**
   * Create the dependency handler
   * @param type
   * @param options
   * @return {DependencyHandler<T>}
   * @private
   */
  private static _createDependencyHandler<T>(type: ConstructorType<T>, options: DependencyOptions): DependencyHandler<T> {
    return Object.assign({
      name: this._getName(type),
      type,
      inject: [],
      injectProperties: {},
      singleton: false,
      getInstance: () => this._resolve<T>(type)
    }, options);
  }

  /**
   * Get the singleton instance for type
   * @param type
   * @return {any}
   * @private
   */
  private static _getSingletonInstance<T>(type: ConstructorType<T>): T | undefined {
    if (!this.has(type)) {
      return;
    }

    const handler = this._getDependencyHandler(type) as DependencyHandler<T>;
    if (!handler.singleton) {
      return;
    }

    if (!this._singletonInstances.has(handler.type)) {
      const instance = handler.getInstance();
      this._singletonInstances.set(handler.type, instance);
      return instance;
    }
    return this._singletonInstances.get(handler.type) as T;
  }

  /**
   * Check if the given name/class is managed by the container
   * @param typeOrName
   */
  public static has<T>(typeOrName: ConstructorTypeOrName<T>): boolean {
    let type: ConstructorType<T> | undefined;

    if (typeof typeOrName === 'string') {
      type = this._getType<T>(typeOrName);
    } else {
      type = typeOrName;
    }

    if (type === undefined) {
      return false;
    }

    return this._dependencies.has(type);
  }

  // public static isSingleton<T>(typeOrName: ConstructorTypeOrName<T>): boolean {}

  /**
   * Set a property dependency for type
   * @param type
   * @param propertyName
   * @param targetType
   */
  public static setPropertyDependency<T>(type: ConstructorType<T>, propertyName: string, targetType: ConstructorTypeOrName<any>): void {
    this._setPropertyDependencyHandler<T>(type, propertyName, targetType);
  }

  /**
   * Set a dependency/singleton to the container
   * @param type
   * @param params
   */
  public static set<T>(type: ConstructorType<T>, dependencyOptions: DependencyOptions = {}): void {
    if (this.has(type)) {
      return;
    }

    const handler = this._createDependencyHandler(type, dependencyOptions);
    this._setDependencyHandler(type, handler);
  }

  /**
   * Get the resolved instance of a class
   * @param typeOrName
   * @return {any}
   */
  public static get<T>(typeOrName: ConstructorTypeOrName<T>): T | never {
    if (!this.has(typeOrName)) {
      if (typeof typeOrName === 'function') {
        this.set<T>(typeOrName, {});
      } else {
        throw new TypeError(`Trying to get a named dependency "${typeOrName}", which is not in the container`);
      }
    }

    const handler = this._getDependencyHandler(typeOrName) as DependencyHandler<T>;
    const instance: T = handler.getInstance();

    if (handler.singleton) {
      return this._getSingletonInstance(handler.type) as T;
    }

    return instance;
  }

  /**
   * Remove the given name/class from the container
   * @param typeOrName
   * @return {boolean}
   */
  public static remove<T>(typeOrName: ConstructorTypeOrName<T>): boolean {
    const type = this._getType(typeOrName);
    if (!type) return false;
    return this._dependencies.delete(type);
  }

  /**
   * Flush everything inside the container
   */
  public static flush(): void {
    this._dependencies.clear();
    this._singletonInstances.clear();
  }
}
