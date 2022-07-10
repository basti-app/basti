export interface AwsTag {
  name: string;
  value: string;
}

export interface AwsTags {
  [key: string]: string | undefined;
}
