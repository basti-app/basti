import { AwsTags } from "../types.js";

export interface AwsEc2Instance {
  id: string;
}

export interface AwsVpc {
  id: string;
  name?: string;
  tags: AwsTags;
}

export interface AwsSubnet {
  id: string;
  name?: string;
  tags: AwsTags;
}

export interface AwsRouteTable {
  id: string;
}
