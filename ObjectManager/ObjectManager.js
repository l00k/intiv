"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseSymbol = exports.ObjectManagerSymbol = void 0;
const def_1 = require("./def");
const Storage_1 = __importDefault(require("./Storage"));
exports.ObjectManagerSymbol = Symbol('ObjectManager');
// service release symbol
exports.ReleaseSymbol = Symbol('Release');
class ObjectManager {
    /**
     * Global storage
     */
    static get storage() {
        const globalScope = window !== undefined
            ? window
            : global;
        if (!globalScope[exports.ObjectManagerSymbol]) {
            globalScope[exports.ObjectManagerSymbol] = new Storage_1.default();
        }
        return globalScope[exports.ObjectManagerSymbol];
    }
    static getInstance(Klass, ctorArgs = []) {
        if (Klass[def_1.SingletonSymbol]) {
            if (!this.storage.instances[Klass.name]) {
                this.storage.instances[Klass.name] = this.createInstance(Klass, ctorArgs);
            }
            return this.storage.instances[Klass.name];
        }
        return this.createInstance(Klass, ctorArgs);
    }
    static bindInstance(object) {
        if (this.storage.instances[object.name]) {
            throw new Error(`Instance typed as ${object.name} already has been bonded`);
        }
        this.storage.instances[object.name] = object;
    }
    static getService(name) {
        if (!this.storage.instances[name]) {
            throw new Error(`Instance named as ${name} hasn't been bonded yet`);
        }
        return this.storage.instances[name];
    }
    static bindService(service, name) {
        if (this.storage.instances[name]) {
            throw new Error(`Instance named as ${name} already has been bonded`);
        }
        this.storage.instances[name] = service;
    }
    static createInstance(Klass, ctorArgs = []) {
        const object = new Klass(...ctorArgs);
        this.loadDependencies(object, Klass.prototype);
        return object;
    }
    static registerInjection(Target, propertyName, injectionDescription) {
        let targetInjections = this.storage.injections.get(Target);
        if (!targetInjections) {
            targetInjections = {};
            this.storage.injections.set(Target, targetInjections);
        }
        targetInjections[propertyName] = injectionDescription;
    }
    static loadDependencies(object, Type) {
        const targetInjections = this.storage.injections.get(Type);
        if (!targetInjections) {
            return;
        }
        for (const propertyName in targetInjections) {
            const injection = targetInjections[propertyName];
            if (injection.name) {
                object[propertyName] = this.getService(injection.name);
            }
            else {
                object[propertyName] = this.getInstance(injection.type, injection.ctorArgs);
            }
        }
    }
    static releaseAll() {
        for (const instanceName in this.storage.instances) {
            const instance = this.storage.instances[instanceName];
            if (instance[exports.ReleaseSymbol]) {
                instance[exports.ReleaseSymbol]();
            }
        }
    }
}
exports.default = ObjectManager;