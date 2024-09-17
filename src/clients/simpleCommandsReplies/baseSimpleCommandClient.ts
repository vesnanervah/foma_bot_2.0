import { BaseCommandClient } from "../baseCommandClient.js";

abstract class BaseSimpleCommandClient extends BaseCommandClient{
    protected abstract preludes: Array<string>;

    
    protected getRandomPrelude(): string {
        return this.getRandomValueFromArray(this.preludes);
    }
}

export { BaseSimpleCommandClient };

