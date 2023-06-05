/**
 * Union type for parameters extracted from a request path with
 * format '/../:param/../'.
 */
type ParameterizedRequestParams<Path extends string> =
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ParameterizedRequestParams<`/${Rest}`>
    : Path extends `${infer _Start}:${infer Param}`
    ? Param
    : never;

/**
 * Extension of an Express.Request object with type-safe params.
 */
export interface ParameterizedRequest<T extends string> extends Express.Request {
  params: { [key in ParameterizedRequestParams<T>]: string };
}
