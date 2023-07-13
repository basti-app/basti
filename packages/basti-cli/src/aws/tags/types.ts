export interface AwsTag {
  key: string;
  value: string;
}

export interface AwsTags {
  [key: string]: string | undefined;
}
