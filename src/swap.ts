import {
  Wormhole,
  routes,
} from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";
import {
  MayanRouteSWIFT,
} from '@mayanfinance/wormhole-sdk-route';
import dotenv from "dotenv";
import { getSigner } from "./helpers";

// Initialize dotenv
dotenv.config();

(async function () {
  // Setup
  const wh = new Wormhole("Mainnet", [EvmPlatform, SolanaPlatform], {
    chains: {
      Ethereum: { rpc: process.env.ETHEREUM_MAINNET_RPC! }, // e.g. https://ethereum-rpc.publicnode.com
      Solana: {
        rpc: process.env.SOLANA_MAINNET_RPC ?? "https://api.mainnet-beta.solana.com",
      },
    },
  });

  const sendChain = wh.getChain("Base");
  const destChain = wh.getChain("Solana");
  const destAddress = Wormhole.chainAddress(destChain.chain, "<TODO>");

  // Doing transaction of native ETH on Ethereum to native SOL on Solana
  const source = Wormhole.tokenId(sendChain.chain, "native");
  const destination = Wormhole.tokenId(destChain.chain, "native");

  // Create a new Wormhole route resolver, adding the Mayan route to the default list
  // @ts-ignore
  const resolver = wh.resolver([MayanRouteSWIFT]);

  // Show supported tokens
  const dstTokens = await resolver.supportedDestinationTokens(
    source,
    sendChain,
    destChain
  );
  console.log(dstTokens.slice(0, 5));

  // Pull private keys from env for testing purposes
  const sender = await getSigner(sendChain);

  // Creating a transfer request fetches token details
  // since all routes will need to know about the tokens
  const tr = await routes.RouteTransferRequest.create(wh, {
    source,
    destination,
  });

  // resolve the transfer request to a set of routes that can perform it
  const foundRoutes = await resolver.findRoutes(tr);
  const bestRoute = foundRoutes[0]!;

  // Specify the amount as a decimal string
  const transferParams = {
    amount: "0.001",
    options: bestRoute.getDefaultOptions(),
  };

  // validate the queries route
  let validated = await bestRoute.validate(tr, transferParams);
  if (!validated.valid) {
    console.error(validated.error);
    return;
  }
  console.log("Validated: ", validated);

  const quote = await bestRoute.quote(tr, validated.params);
  if (!quote.success) {
    console.error(`Error fetching a quote: ${quote.error.message}`);
    return;
  }
  console.log("Quote: ", quote);

  // initiate the transfer
  const receipt = await bestRoute.initiate(
    tr,
    sender.signer,
    quote,
    destAddress
  );
  console.log("Initiated transfer with receipt: ", receipt);

  await routes.checkAndCompleteTransfer(
    bestRoute,
    receipt,
    undefined,
    15 * 60 * 1000
  );
})();