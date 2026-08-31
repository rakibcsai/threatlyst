export interface ApiErrorBody {
  detail?:
    string | Array<{ loc: Array<string | number>; msg: string; type: string }>
}
