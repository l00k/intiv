import { InjectionDescription, ClassConstructor } from '../def';
import ObjectManager from '../ObjectManager';


function Inject(name : string = null, args : any[] = [])
{
    return (Target : Object, propertyName : string) => {
        const Type = Reflect.getMetadata('design:type', Target, propertyName);
        const description = new InjectionDescription(Type, name, args);

        ObjectManager.registerInjection(Target, propertyName, description);
    };
}

export default Inject;

