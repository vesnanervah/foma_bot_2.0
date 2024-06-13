abstract class BaseSimpleCommandClient {
    protected abstract preludes: Array<string>;

    
    protected getRandomPrelude(): string {
        return this.preludes[Math.floor(this.preludes.length * Math.random())];
    }
}

export { BaseSimpleCommandClient };

