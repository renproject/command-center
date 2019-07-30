
export interface Serializable<T> {
    serialize(): string;
    deserialize(str: string): T;
}
