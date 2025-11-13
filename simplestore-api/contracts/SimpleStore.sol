// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SimpleStore {
    mapping(address => string) public nameOf;

    event NameStored(address indexed who, string name);

    function storeName(string calldata _name) external {
        nameOf[msg.sender] = _name;
        emit NameStored(msg.sender, _name);
    }

    function readName(address who) external view returns (string memory) {
        return nameOf[who];
    }
}   