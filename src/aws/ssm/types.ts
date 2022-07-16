export type AwsSsmParameterType = "string" | "string-list";

export interface AwsSsmParameter {
  name: string;
  value: string;
  type: AwsSsmParameterType;
}
