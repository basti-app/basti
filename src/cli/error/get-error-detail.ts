import { AwsAccessDeniedError } from "../../aws/common/aws-error.js";
import { AwsTimeoutError } from "../../aws/common/waiter-error.js";
import { AwsInstanceProfileNotFoundError } from "../../aws/ec2/ec2-client.js";
import { getErrorMessage } from "../../common/get-error-message.js";
import {
  ResourceNotFoundError,
  RuntimeError,
} from "../../common/runtime-error.js";

type Constructor<T> = new (...args: any) => T;

export interface ErrorMessageProvider<T extends Error = any> {
  error: Constructor<T>;
  detail: (error: T) => string;
}

export function detailProvider<T extends Error>(
  error: Constructor<T>,
  detail: (error: T) => string
): ErrorMessageProvider<T> {
  return { error, detail };
}

export const COMMON_DETAIL_PROVIDERS: ErrorMessageProvider[] = [
  detailProvider(
    AwsAccessDeniedError,
    (error) =>
      "Access denied by IAM" + (error.iamMessage ? `: ${error.iamMessage}` : "")
  ),
  detailProvider(
    AwsInstanceProfileNotFoundError,
    (error) =>
      "Instance profile not found. This looks like an AWS delay. Please try again"
  ),
  detailProvider(
    AwsTimeoutError,
    (error) =>
      "Operation timed out. This looks like an AWS delay. Please try again"
  ),
  detailProvider(
    ResourceNotFoundError,
    (error) => `Resource "${error.resourceId}" not found`
  ),
];

export function getErrorDetail(
  error: unknown,
  detailProviders?: ErrorMessageProvider[]
): string {
  const allProviders = [...(detailProviders || []), ...COMMON_DETAIL_PROVIDERS];

  const detail = allProviders
    .find((provider) => isMatchingProvider(provider, error))
    ?.detail(error);

  if (!detail) {
    return `Unexpected error: ${getErrorMessage(error)}`;
  }

  const cause = error instanceof RuntimeError ? error.cause : undefined;

  return cause
    ? `${detail}. ${getErrorDetail(cause, detailProviders)}`
    : detail;
}

function isMatchingProvider<T extends Error>(
  provider: ErrorMessageProvider<T>,
  error: unknown
): error is T {
  return error instanceof provider.error;
}
