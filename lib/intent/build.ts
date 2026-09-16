/**
 * Intent builder — constructs a well-formed Intent from user inputs.
 *
 * Does NOT sign or hash the intent. Call hashIntent() then sign separately.
 */

import type { Intent, IntentPreferences, DeliveryHint } from '@/types';
import { USDC_ASSET } from '@/constants';
import { generateIntentNonce } from './nonce';

export interface BuildIntentParams {
  /** User's Stellar public key. */
  account: string;
  /** Corridor ID e.g. "usdc-ngn". */
  corridor: string;
  /** Amount of USDC to sell, as a decimal string e.g. "100.00". */
  sellAmount: string;
  /** Minimum fiat amount to accept (floor on delivery). */
  minReceive: string;
  /** Preferred fiat delivery method. */
  deliveryHint: DeliveryHint;
  /** Seconds from now until the intent expires. Default: 300 (5 minutes). */
  deadlineSeconds?: number;
  /** Optional routing preferences. */
  preferences?: IntentPreferences;
}

/**
 * Builds a canonical Intent object ready for hashing and signing.
 */
export function buildIntent(params: BuildIntentParams): Intent {
  const {
    account,
    corridor,
    sellAmount,
    minReceive,
    deliveryHint,
    deadlineSeconds = 300,
    preferences,
  } = params;

  const buyAssetCode = corridor.split('-')[1]?.toUpperCase() ?? 'NGN';
  const deadline = new Date(Date.now() + deadlineSeconds * 1_000).toISOString();

  return {
    version: 1,
    nonce: generateIntentNonce(),
    account,
    corridor,
    sellAsset: {
      code: USDC_ASSET.code,
      issuer: USDC_ASSET.issuer ?? '',
    },
    sellAmount,
    buyAsset: {
      code: buyAssetCode,
    },
    minReceive,
    deliveryHint,
    deadline,
    preferences: {
      allowSplit: preferences?.allowSplit ?? false,
      maxAnchors: preferences?.maxAnchors ?? 1,
      ...(preferences?.preferAnchorIds
        ? { preferAnchorIds: preferences.preferAnchorIds }
        : {}),
    },
  };
}
