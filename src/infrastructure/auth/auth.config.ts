function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is missing`);
    }
    return value;
}

export const authConfig = {
    accessSecret: required("ACCESS_SECRET"),
};

export default authConfig;
