import {
    Chain,
    ChainAddress,
    ChainContext,
    Network,
    Signer,
    Wormhole,
  } from "@wormhole-foundation/sdk-connect";
  import { getEvmSignerForKey } from "@wormhole-foundation/sdk-evm";
  import { getSolanaSigner } from "@wormhole-foundation/sdk-solana";

// Helper function to get environment variables
function getEnv(key: string): string {
  // If we're in the browser, return empty string
  if (typeof process === undefined) return "";

  // Otherwise, return the env var or error
  const val = process.env[key];
  if (!val)
    throw new Error(
      `Missing env var ${key}, did you forget to set values in '.env'?`
    );

  return val;
}

// Define TransferStuff interface
export interface SignerContext<N extends Network, C extends Chain> {
  signer: Signer<N, C>;
  address: ChainAddress<C>;
}

export async function getSigner<N extends Network, C extends Chain>(
  chain: ChainContext<N, C>
): Promise<SignerContext<N, C>> {
  let signer: Signer;
  const platform = chain.platform.utils()._platform;
  switch (platform) {
    case "Solana":
      signer = await getSolanaSigner(
        await chain.getRpc(),
        getEnv("MAINNET_SOL_PRIVATE_KEY")
      );
      break;
    case "Evm":
      signer = await getEvmSignerForKey(
        await chain.getRpc(),
        getEnv("MAINNET_ETH_PRIVATE_KEY")
      );
      break;
    default:
      throw new Error("Unrecognized platform: " + platform);
  }

  return {
    signer: signer as Signer<N, C>,
    address: Wormhole.chainAddress(chain.chain, signer.address()),
  };
}