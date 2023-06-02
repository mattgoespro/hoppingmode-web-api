type ParameterizedRequestParams<Path extends string> =
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ParameterizedRequestParams<`/${Rest}`>
    : Path extends `${infer _Start}:${infer Param}`
    ? Param
    : never;

export interface ParameterizedRequest<T extends string> extends Express.Request {
  params: { [key in ParameterizedRequestParams<T>]: string };
}
