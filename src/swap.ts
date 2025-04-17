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
  const wh = new Wormhole("Mainnet", [EvmPlatform, SolanaPlatform]);

  const sendChain = wh.getChain("Base");
  const destChain = wh.getChain("Solana");

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
  const receiver = await getSigner(destChain);

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
    amount: "0.0001",
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
    receiver.address
  );
  console.log("Initiated transfer with receipt: ", receipt);

  await routes.checkAndCompleteTransfer(
    bestRoute,
    receipt,
    receiver.signer,
    15 * 60 * 1000
  );
})();