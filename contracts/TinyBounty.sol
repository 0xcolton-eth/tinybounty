// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TinyBounty
 * @notice Micro-task marketplace with instant escrow and auto-refunds
 * @dev Platform fee: 2.5% on successful bounties
 */
contract TinyBounty {
    // ============ Types ============
    
    enum BountyStatus {
        Open,           // 0: Available to claim
        Claimed,        // 1: Worker has claimed, not submitted yet
        Submitted,      // 2: Work submitted, awaiting approval
        Approved,       // 3: Work approved, payment sent
        Refunded,       // 4: Auto-refunded to worker (poster ghosted)
        Disputed        // 5: Under dispute resolution
    }
    
    struct Bounty {
        uint256 id;
        address poster;
        string title;
        string description;
        uint256 reward;             // Total reward in wei
        uint256 deadline;           // Unix timestamp when work must be submitted
        address worker;             // address(0) if unclaimed
        string submissionURI;       // IPFS/Vercel Blob URL of completed work
        BountyStatus status;
        uint256 createdAt;
        uint256 claimedAt;
        uint256 submittedAt;
    }
    
    struct UserStats {
        uint256 bountiesPosted;
        uint256 bountiesCompleted;  // As worker
        uint256 totalEarned;
        uint256 totalSpent;
        uint256 ghostCount;         // Times poster didn't respond
        uint256 approvalCount;      // Times poster approved work
    }
    
    // ============ State ============
    
    uint256 public nextBountyId = 1;
    uint256 public constant PLATFORM_FEE_BPS = 250;  // 2.5%
    uint256 public constant APPROVAL_WINDOW = 2 hours;
    uint256 public constant MIN_BOUNTY = 0.0001 ether;
    uint256 public constant MAX_BOUNTY = 1 ether;
    
    address public treasury;
    uint256 public totalFeesCollected;
    
    mapping(uint256 => Bounty) public bounties;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256) public activeClaimCount; // Prevent claim squatting
    
    // ============ Events ============
    
    event BountyCreated(
        uint256 indexed id,
        address indexed poster,
        uint256 reward,
        uint256 deadline,
        string title
    );
    
    event BountyClaimed(
        uint256 indexed id,
        address indexed worker,
        uint256 claimedAt
    );
    
    event WorkSubmitted(
        uint256 indexed id,
        address indexed worker,
        string submissionURI,
        uint256 submittedAt
    );
    
    event WorkApproved(
        uint256 indexed id,
        address indexed poster,
        address indexed worker,
        uint256 payout,
        uint256 fee
    );
    
    event BountyRefunded(
        uint256 indexed id,
        address indexed worker,
        uint256 amount
    );
    
    event BountyDisputed(
        uint256 indexed id,
        address indexed initiator
    );
    
    // ============ Errors ============
    
    error InvalidBountyAmount();
    error InvalidDeadline();
    error BountyNotFound();
    error NotBountyPoster();
    error NotBountyWorker();
    error InvalidBountyStatus();
    error WorkerHasActiveClaim();
    error DeadlinePassed();
    error ApprovalWindowNotExpired();
    error InsufficientBalance();
    
    // ============ Constructor ============
    
    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Create a new bounty with escrowed funds
     * @param title Short description of task
     * @param description Detailed requirements
     * @param deadline Unix timestamp when work must be submitted by
     */
    function createBounty(
        string calldata title,
        string calldata description,
        uint256 deadline
    ) external payable returns (uint256) {
        if (msg.value < MIN_BOUNTY || msg.value > MAX_BOUNTY) {
            revert InvalidBountyAmount();
        }
        if (deadline <= block.timestamp || deadline > block.timestamp + 7 days) {
            revert InvalidDeadline();
        }
        
        uint256 bountyId = nextBountyId++;
        
        bounties[bountyId] = Bounty({
            id: bountyId,
            poster: msg.sender,
            title: title,
            description: description,
            reward: msg.value,
            deadline: deadline,
            worker: address(0),
            submissionURI: "",
            status: BountyStatus.Open,
            createdAt: block.timestamp,
            claimedAt: 0,
            submittedAt: 0
        });
        
        userStats[msg.sender].bountiesPosted++;
        userStats[msg.sender].totalSpent += msg.value;
        
        emit BountyCreated(bountyId, msg.sender, msg.value, deadline, title);
        
        return bountyId;
    }
    
    /**
     * @notice Claim a bounty to work on it
     * @param bountyId ID of bounty to claim
     */
    function claimBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        if (bounty.id == 0) revert BountyNotFound();
        if (bounty.status != BountyStatus.Open) revert InvalidBountyStatus();
        if (activeClaimCount[msg.sender] >= 3) revert WorkerHasActiveClaim();
        
        bounty.worker = msg.sender;
        bounty.status = BountyStatus.Claimed;
        bounty.claimedAt = block.timestamp;
        
        activeClaimCount[msg.sender]++;
        
        emit BountyClaimed(bountyId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Submit completed work
     * @param bountyId ID of bounty
     * @param submissionURI URL to completed work (Vercel Blob or IPFS)
     */
    function submitWork(uint256 bountyId, string calldata submissionURI) external {
        Bounty storage bounty = bounties[bountyId];
        
        if (bounty.worker != msg.sender) revert NotBountyWorker();
        if (bounty.status != BountyStatus.Claimed) revert InvalidBountyStatus();
        if (block.timestamp > bounty.deadline) revert DeadlinePassed();
        
        bounty.submissionURI = submissionURI;
        bounty.status = BountyStatus.Submitted;
        bounty.submittedAt = block.timestamp;
        
        emit WorkSubmitted(bountyId, msg.sender, submissionURI, block.timestamp);
    }
    
    /**
     * @notice Approve submitted work and release payment
     * @param bountyId ID of bounty to approve
     */
    function approveWork(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        if (bounty.poster != msg.sender) revert NotBountyPoster();
        if (bounty.status != BountyStatus.Submitted) revert InvalidBountyStatus();
        
        bounty.status = BountyStatus.Approved;
        
        // Calculate fee and payout
        uint256 fee = (bounty.reward * PLATFORM_FEE_BPS) / 10000;
        uint256 payout = bounty.reward - fee;
        
        // Update stats
        userStats[bounty.worker].bountiesCompleted++;
        userStats[bounty.worker].totalEarned += payout;
        userStats[bounty.poster].approvalCount++;
        activeClaimCount[bounty.worker]--;
        
        totalFeesCollected += fee;
        
        // Transfer funds
        (bool success, ) = bounty.worker.call{value: payout}("");
        require(success, "Transfer failed");
        
        emit WorkApproved(bountyId, msg.sender, bounty.worker, payout, fee);
    }
    
    /**
     * @notice Request refund if poster doesn't respond within approval window
     * @param bountyId ID of bounty to refund
     */
    function requestRefund(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        if (bounty.worker != msg.sender) revert NotBountyWorker();
        if (bounty.status != BountyStatus.Submitted) revert InvalidBountyStatus();
        if (block.timestamp < bounty.submittedAt + APPROVAL_WINDOW) {
            revert ApprovalWindowNotExpired();
        }
        
        bounty.status = BountyStatus.Refunded;
        
        // Update stats
        userStats[bounty.poster].ghostCount++;
        activeClaimCount[bounty.worker]--;
        
        // Refund full amount to worker (poster loses funds for ghosting)
        (bool success, ) = bounty.worker.call{value: bounty.reward}("");
        require(success, "Refund failed");
        
        emit BountyRefunded(bountyId, msg.sender, bounty.reward);
    }
    
    /**
     * @notice Initiate dispute (future: DAO resolution)
     * @param bountyId ID of bounty to dispute
     */
    function disputeBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        if (bounty.poster != msg.sender && bounty.worker != msg.sender) {
            revert NotBountyPoster();
        }
        if (bounty.status != BountyStatus.Submitted) {
            revert InvalidBountyStatus();
        }
        
        bounty.status = BountyStatus.Disputed;
        
        emit BountyDisputed(bountyId, msg.sender);
    }
    
    /**
     * @notice Cancel unclaimed bounty and refund poster
     * @param bountyId ID of bounty to cancel
     */
    function cancelBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        if (bounty.poster != msg.sender) revert NotBountyPoster();
        if (bounty.status != BountyStatus.Open) revert InvalidBountyStatus();
        
        bounty.status = BountyStatus.Refunded;
        
        userStats[bounty.poster].totalSpent -= bounty.reward;
        
        (bool success, ) = bounty.poster.call{value: bounty.reward}("");
        require(success, "Refund failed");
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Withdraw collected platform fees
     */
    function withdrawFees() external {
        require(msg.sender == treasury, "Not treasury");
        
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        
        (bool success, ) = treasury.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @notice Update treasury address
     */
    function updateTreasury(address _newTreasury) external {
        require(msg.sender == treasury, "Not treasury");
        require(_newTreasury != address(0), "Invalid address");
        treasury = _newTreasury;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get bounty details
     */
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }
    
    /**
     * @notice Get user statistics
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
    
    /**
     * @notice Check if work can be auto-refunded
     */
    function canRefund(uint256 bountyId) external view returns (bool) {
        Bounty memory bounty = bounties[bountyId];
        return bounty.status == BountyStatus.Submitted &&
               block.timestamp >= bounty.submittedAt + APPROVAL_WINDOW;
    }
    
    /**
     * @notice Calculate payout after fees
     */
    function calculatePayout(uint256 reward) public pure returns (uint256 payout, uint256 fee) {
        fee = (reward * PLATFORM_FEE_BPS) / 10000;
        payout = reward - fee;
    }
}