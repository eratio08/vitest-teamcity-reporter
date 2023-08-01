export abstract class Message {
    public constructor(
        protected id: string,
        protected name: string,
    ) {
    }

    protected abstract generate(type: string, parameters: object): string;
}

const generateParameters = (parameters: object): string =>
    Object.entries(parameters).map(([key, value]) => `${key}='${value || ''}'`).join(' ')

export const generateMessage = (type: string, flowId: string, parameters: object = {}) =>
    `##teamcity[${type} flowId='${flowId}' ${generateParameters(parameters)}]`
