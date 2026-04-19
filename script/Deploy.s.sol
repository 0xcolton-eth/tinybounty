// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/TinyBounty.sol";

contract Deploy is Script {
    function run() external {
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(pk);
        TinyBounty bounty = new TinyBounty(treasury);
        vm.stopBroadcast();

        console.log("TinyBounty deployed at:", address(bounty));
        console.log("Treasury:", treasury);
    }
}
