// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AadhaarVault {
    enum Status { Submitted, Verified, Rejected }

    struct Application {
        bytes32 recordId;
        bytes32 hash;
        string cid;
        address applicant;
        address verifier;
        Status status;
        uint256 timestamp;
    }

    mapping(bytes32 => Application) public applications;

    event ApplicationSubmitted(bytes32 indexed recordId, bytes32 hash, string cid, address indexed applicant);
    event ApplicationVerified(bytes32 indexed recordId, address indexed verifier);
    event ApplicationRejected(bytes32 indexed recordId, address indexed verifier);

    function submitApplication(bytes32 recordId, bytes32 hash, string calldata cid) external {
        Application storage a = applications[recordId];
        a.recordId = recordId;
        a.hash = hash;
        a.cid = cid;
        a.applicant = msg.sender;
        a.verifier = address(0);
        a.status = Status.Submitted;
        a.timestamp = block.timestamp;
        emit ApplicationSubmitted(recordId, hash, cid, msg.sender);
    }

    function getApplication(bytes32 recordId) external view returns (bytes32, bytes32, string memory, address, address, uint8, uint256) {
        Application storage a = applications[recordId];
        return (a.recordId, a.hash, a.cid, a.applicant, a.verifier, uint8(a.status), a.timestamp);
    }

    function verifyApplication(bytes32 recordId) external {
        Application storage a = applications[recordId];
        require(a.recordId != 0x0, "not found");
        a.status = Status.Verified;
        a.verifier = msg.sender;
        emit ApplicationVerified(recordId, msg.sender);
    }

    function rejectApplication(bytes32 recordId) external {
        Application storage a = applications[recordId];
        require(a.recordId != 0x0, "not found");
        a.status = Status.Rejected;
        a.verifier = msg.sender;
        emit ApplicationRejected(recordId, msg.sender);
    }
}
