// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract AadhaarApplications {
    enum Status { None, Submitted, Verified, Rejected, Revoked }

    struct Application {
        bytes32 recordId;
        bytes32 hash;   // keccak256 of encrypted payload
        string cid;     // ipfs cid
        address applicant;
        address verifier;
        Status status;
        uint256 timestamp;
    }

    address public admin;
    mapping(bytes32 => Application) public applications;

    event ApplicationSubmitted(bytes32 indexed recordId, bytes32 hash, string cid, address indexed applicant);
    event ApplicationVerified(bytes32 indexed recordId, address indexed verifier);
    event ApplicationRejected(bytes32 indexed recordId, address indexed verifier);
    event ApplicationRevoked(bytes32 indexed recordId, address indexed revoker);

    modifier onlyAdmin() {
        require(msg.sender == admin, "admin only");
        _;
    }

    constructor(address _admin) {
        admin = _admin;
    }

    function submitApplication(bytes32 recordId, bytes32 hash, string calldata cid) external {
        Application storage a = applications[recordId];
        // allow new submission or resubmit by same applicant
        if (a.status != Status.None && a.status != Status.Submitted) {
            require(a.applicant == msg.sender, "only applicant can resubmit");
        }
        a.recordId = recordId;
        a.hash = hash;
        a.cid = cid;
        a.applicant = msg.sender;
        a.status = Status.Submitted;
        a.timestamp = block.timestamp;
        emit ApplicationSubmitted(recordId, hash, cid, msg.sender);
    }

    function verifyApplication(bytes32 recordId) external onlyAdmin {
        Application storage a = applications[recordId];
        require(a.status == Status.Submitted, "not submitted");
        a.status = Status.Verified;
        a.verifier = msg.sender;
        emit ApplicationVerified(recordId, msg.sender);
    }

    function rejectApplication(bytes32 recordId) external onlyAdmin {
        Application storage a = applications[recordId];
        require(a.status == Status.Submitted, "not submitted");
        a.status = Status.Rejected;
        a.verifier = msg.sender;
        emit ApplicationRejected(recordId, msg.sender);
    }

    function revokeApplication(bytes32 recordId) external {
        Application storage a = applications[recordId];
        require(a.status != Status.None, "no application");
        require(msg.sender == a.applicant || msg.sender == admin, "not allowed");
        a.status = Status.Revoked;
        emit ApplicationRevoked(recordId, msg.sender);
    }

    function getApplication(bytes32 recordId) external view returns (bytes32, bytes32, string memory, address, address, Status, uint256) {
        Application memory a = applications[recordId];
        return (a.recordId, a.hash, a.cid, a.applicant, a.verifier, a.status, a.timestamp);
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
