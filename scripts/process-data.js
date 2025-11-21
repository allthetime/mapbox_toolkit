export function addInfo(obj) {
    const { Injuries, Deaths } = obj;
    obj.hasDeaths = Deaths > 0;
    obj.hasInjuries = Injuries > 0;
    return obj;
}