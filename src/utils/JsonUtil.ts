export default class JsonUtil {

    public static cloneJson<T>(value: T): T {
        if (!value) {
            return null;
        }
        let jsonString = JSON.stringify(value);
        return JSON.parse(jsonString);
    }
}