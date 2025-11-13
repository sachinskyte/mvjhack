// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DemoID {
    // Event just for indexing (optional)
    event IDRegistered(string name, string dob, uint256 timestamp);

    // Main function: encodes data in calldata
    function register(string memory name, string memory dob) external {
        emit IDRegistered(name, dob, block.timestamp);
    }
}