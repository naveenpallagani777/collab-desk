export type PlainObject = Record<string, unknown>;

export type QueryStringValue = string | number | boolean | undefined | null | QueryStringObject;

export interface QueryStringObject {
    [key: string]: QueryStringValue;
}

export interface QueryLike {
    find: (filter: PlainObject) => QueryLike;
    sort: (sortBy: string) => QueryLike;
    select: (fields: string) => QueryLike;
    skip: (value: number) => QueryLike;
    limit: (value: number) => QueryLike;
    then: PromiseLike<unknown[]>["then"];
}

export interface ApiFeaturesLike {
    query: QueryLike & PromiseLike<unknown[]>;
    queryString: QueryStringObject;
    totalDocs: number;
    filter: (excludedFields?: string[]) => ApiFeaturesLike;
    sort: () => ApiFeaturesLike;
    search: (searchFields?: string[]) => ApiFeaturesLike;
    limitFields: () => ApiFeaturesLike;
    paginate: () => ApiFeaturesLike;
}

export type CustomAppErrorConstructor = new (
    message: string,
    statusCode: number,
    details?: PlainObject
) => Error;

export interface UtilsService {
  CustomAppError: CustomAppErrorConstructor;
  ApiFeatures: (query: QueryLike, queryString?: QueryStringObject, totalDocs?: number) => ApiFeaturesLike;
}
