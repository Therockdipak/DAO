// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DAO is Ownable(msg.sender), ReentrancyGuard {
    struct Proposal {
        uint256 id;
        address creator;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    Proposal[] public proposals;
    mapping(address => bool) public members;
    mapping(address => uint256) public shares;

    event MemberAdded(address indexed member);
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool vote);
    event ProposalExecuted(uint256 indexed proposalId);
    event SharesTransferred(address indexed from, address indexed to, uint256 amount);

    modifier onlyMembers() {
        require(members[msg.sender], "You are not a member");
        _;
    }

    constructor() {
        _transferOwnership(msg.sender); // Set the initial owner to the contract deployer
    }

    function addMember(address member) external onlyOwner {
        require(member != address(0), "Invalid address");
        require(!members[member], "Already a member");

        members[member] = true;
        emit MemberAdded(member);
    }

    function createProposal(string memory _description) external onlyMembers {
        require(bytes(_description).length > 0, "Description cannot be empty");

        uint256 proposalId = proposals.length;
        Proposal storage newProposal = proposals.push();
        newProposal.id = proposalId;
        newProposal.creator = msg.sender;
        newProposal.description = _description;

        emit ProposalCreated(proposalId, msg.sender, _description);
    }

    function vote(uint256 _proposalIndex, bool _vote) external onlyMembers {
        Proposal storage proposal = proposals[_proposalIndex];
        require(!proposal.hasVoted[msg.sender], "You have already voted");
        require(!proposal.executed, "Proposal has been executed");

        if (_vote) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        proposal.hasVoted[msg.sender] = true;

        emit Voted(_proposalIndex, msg.sender, _vote);
    }

    function executeProposal(uint256 _proposalIndex) external onlyMembers nonReentrant {
        Proposal storage proposal = proposals[_proposalIndex];
        require(!proposal.executed, "Proposal has been executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not approved");

        proposal.executed = true;

        emit ProposalExecuted(_proposalIndex);
    }

    function transferShares(uint256 amount, address to) external onlyMembers nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(members[to], "Recipient is not a member");
        require(shares[msg.sender] >= amount, "Insufficient shares");

        shares[msg.sender] -= amount;
        shares[to] += amount;

        emit SharesTransferred(msg.sender, to, amount);
    }
}
