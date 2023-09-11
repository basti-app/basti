import {
  AwsAccessDeniedError,
  AwsDependencyViolationError,
} from '#src/aws/common/aws-errors.js';
import { AwsTimeoutError } from '#src/aws/common/waiter-error.js';
import type { ResourceType } from '#src/common/resource-type.js';
import {
  ManagedResourceTypes,
  TargetTypes,
} from '#src/common/resource-type.js';
import {
  getErrorMessage,
  ResourceDamagedError,
  ResourceNotFoundError,
  RuntimeError,
  UnexpectedStateError,
} from '#src/common/runtime-errors.js';

type Constructor<T> = new (...args: any) => T;

export interface DetailProvider<T extends Error = any> {
  error: Constructor<T>;
  detail: (error: T) => string;
}

export function detailProvider<T extends Error>(
  error: Constructor<T>,
  detail: (error: T) => string
): DetailProvider<T> {
  return { error, detail };
}

const RESOURCE_TYPE_NAME: Record<ResourceType, string> = {
  [ManagedResourceTypes.BASTION_INSTANCE]: 'Bastion instance',
  [ManagedResourceTypes.BASTION_SECURITY_GROUP]: 'Bastion security group',
  [ManagedResourceTypes.BASTION_ROLE]: 'Bastion role',
  [ManagedResourceTypes.ACCESS_SECURITY_GROUP]: 'Access security group',
  [ManagedResourceTypes.BASTION_INSTANCE_PROFILE]: 'Bastion instance profile',
  [TargetTypes.RDS_INSTANCE]: 'RDS instance',
  [TargetTypes.RDS_CLUSTER]: 'RDS cluster',
  [TargetTypes.ELASTICACHE_REDIS_CLUSTER]: 'Elasticache Redis cluster',
  [TargetTypes.ELASTICACHE_REDIS_NODE]: 'Elasticache Redis node',
  [TargetTypes.ELASTICACHE_MEMCACHED_CLUSTER]: 'Elasticache Memcached cluster',
  [TargetTypes.ELASTICACHE_MEMCACHED_NODE]: 'Elasticache Memcached node',
  [TargetTypes.CUSTOM]: 'Custom target',
};

export const COMMON_DETAIL_PROVIDERS: DetailProvider[] = [
  detailProvider(AwsAccessDeniedError, () => 'Access denied by IAM'),
  detailProvider(
    AwsTimeoutError,
    () => 'Operation timed out. This looks like an AWS delay. Please try again'
  ),
  detailProvider(
    AwsDependencyViolationError,
    () => 'Resource has other resources dependent on it'
  ),
  detailProvider(
    UnexpectedStateError,
    () =>
      'Unexpected Basti setup state. Looks like some of the Basti-managed resources were changed outside of Basti. Please try again after cleaning up the Basti setup'
  ),
  detailProvider(
    ResourceNotFoundError,
    error =>
      `${RESOURCE_TYPE_NAME[error.resourceType]} ${
        error.resourceId !== undefined ? `"${error.resourceId}"` : ''
      } was not found`
  ),
  detailProvider(
    ResourceDamagedError,
    error =>
      `${error.resourceType} "${error.resourceId}" is in unexpected state: ${error.detail}`
  ),
];

export function getErrorDetail(
  error: unknown,
  detailProviders?: DetailProvider[]
): string {
  const allProviders = [...(detailProviders ?? []), ...COMMON_DETAIL_PROVIDERS];

  const detail = allProviders
    .find(provider => isMatchingProvider(provider, error))
    ?.detail(error);

  if (detail === undefined) {
    return `Unexpected error: ${getErrorMessage(error)}`;
  }

  const cause = error instanceof RuntimeError ? error.cause : undefined;

  return cause !== undefined
    ? `${detail}. ${getErrorDetail(cause, detailProviders)}`
    : detail;
}

function isMatchingProvider<T extends Error>(
  provider: DetailProvider<T>,
  error: unknown
): error is T {
  return error instanceof provider.error;
}
