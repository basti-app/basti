import { AwsTags } from '../../tags/types.js';

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
