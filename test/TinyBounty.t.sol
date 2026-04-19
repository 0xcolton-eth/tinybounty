// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/TinyBounty.sol";

contract TinyBountyTest is Test {
    TinyBounty bounty;
    address treasury = address(0xBEEF);
    address poster = address(0xA11CE);
    address worker = address(0xB0B);
    address other = address(0xCAFE);

    function setUp() public {
        bounty = new TinyBounty(treasury);
        vm.deal(poster, 10 ether);
        vm.deal(worker, 1 ether);
        vm.deal(other, 1 ether);
    }

    function _post(uint256 reward, uint256 deadline) internal returns (uint256 id) {
        vm.prank(poster);
        id = bounty.createBounty{value: reward}("title", "desc", deadline);
    }

    // --- Validation ---

    function testCreateRevertsBelowMin() public {
        vm.prank(poster);
        vm.expectRevert(TinyBounty.InvalidBountyAmount.selector);
        bounty.createBounty{value: 0.00001 ether}("t", "d", block.timestamp + 1 hours);
    }

    function testCreateRevertsAboveMax() public {
        vm.deal(poster, 5 ether);
        vm.prank(poster);
        vm.expectRevert(TinyBounty.InvalidBountyAmount.selector);
        bounty.createBounty{value: 2 ether}("t", "d", block.timestamp + 1 hours);
    }

    function testCreateRevertsDeadlinePast() public {
        vm.warp(1000);
        vm.prank(poster);
        vm.expectRevert(TinyBounty.InvalidDeadline.selector);
        bounty.createBounty{value: 0.01 ether}("t", "d", 500);
    }

    function testCreateRevertsDeadlineTooFar() public {
        vm.prank(poster);
        vm.expectRevert(TinyBounty.InvalidDeadline.selector);
        bounty.createBounty{value: 0.01 ether}("t", "d", block.timestamp + 8 days);
    }

    // --- Happy path ---

    function testFullLifecycleApprove() public {
        uint256 reward = 0.1 ether;
        uint256 id = _post(reward, block.timestamp + 1 hours);

        vm.prank(worker);
        bounty.claimBounty(id);

        vm.prank(worker);
        bounty.submitWork(id, "https://blob.example/work.png");

        uint256 workerBefore = worker.balance;
        vm.prank(poster);
        bounty.approveWork(id);

        (uint256 payout, uint256 fee) = bounty.calculatePayout(reward);
        assertEq(worker.balance, workerBefore + payout, "worker payout");
        assertEq(bounty.totalFeesCollected(), fee, "fee accrual");

        TinyBounty.Bounty memory b = bounty.getBounty(id);
        assertEq(uint256(b.status), uint256(TinyBounty.BountyStatus.Approved));

        TinyBounty.UserStats memory ws = bounty.getUserStats(worker);
        assertEq(ws.bountiesCompleted, 1);
        assertEq(ws.totalEarned, payout);
    }

    // --- Refund ---

    function testRefundAfterApprovalWindow() public {
        uint256 reward = 0.05 ether;
        uint256 id = _post(reward, block.timestamp + 1 hours);

        vm.prank(worker);
        bounty.claimBounty(id);
        vm.prank(worker);
        bounty.submitWork(id, "uri");

        // Before window expires
        vm.prank(worker);
        vm.expectRevert(TinyBounty.ApprovalWindowNotExpired.selector);
        bounty.requestRefund(id);

        vm.warp(block.timestamp + 2 hours + 1);

        uint256 workerBefore = worker.balance;
        vm.prank(worker);
        bounty.requestRefund(id);

        assertEq(worker.balance, workerBefore + reward, "full refund to worker");
        assertEq(bounty.getUserStats(poster).ghostCount, 1, "ghost count");
    }

    // --- Active claim cap ---

    function testActiveClaimCapAtThree() public {
        uint256 id1 = _post(0.01 ether, block.timestamp + 1 hours);
        uint256 id2 = _post(0.01 ether, block.timestamp + 1 hours);
        uint256 id3 = _post(0.01 ether, block.timestamp + 1 hours);
        uint256 id4 = _post(0.01 ether, block.timestamp + 1 hours);

        vm.startPrank(worker);
        bounty.claimBounty(id1);
        bounty.claimBounty(id2);
        bounty.claimBounty(id3);
        vm.expectRevert(TinyBounty.WorkerHasActiveClaim.selector);
        bounty.claimBounty(id4);
        vm.stopPrank();
    }

    function testClaimCountDecrementsOnApprove() public {
        uint256 id = _post(0.01 ether, block.timestamp + 1 hours);
        vm.prank(worker);
        bounty.claimBounty(id);
        assertEq(bounty.activeClaimCount(worker), 1);

        vm.prank(worker);
        bounty.submitWork(id, "uri");
        vm.prank(poster);
        bounty.approveWork(id);

        assertEq(bounty.activeClaimCount(worker), 0);
    }

    // --- Cancel ---

    function testCancelOpenBountyRefundsPoster() public {
        uint256 reward = 0.01 ether;
        uint256 id = _post(reward, block.timestamp + 1 hours);

        uint256 posterBefore = poster.balance;
        vm.prank(poster);
        bounty.cancelBounty(id);

        assertEq(poster.balance, posterBefore + reward, "poster refunded");
    }

    function testCannotCancelClaimedBounty() public {
        uint256 id = _post(0.01 ether, block.timestamp + 1 hours);
        vm.prank(worker);
        bounty.claimBounty(id);

        vm.prank(poster);
        vm.expectRevert(TinyBounty.InvalidBountyStatus.selector);
        bounty.cancelBounty(id);
    }

    // --- Treasury ---

    function testOnlyTreasuryCanWithdraw() public {
        uint256 id = _post(0.1 ether, block.timestamp + 1 hours);
        vm.prank(worker);
        bounty.claimBounty(id);
        vm.prank(worker);
        bounty.submitWork(id, "uri");
        vm.prank(poster);
        bounty.approveWork(id);

        vm.prank(other);
        vm.expectRevert("Not treasury");
        bounty.withdrawFees();

        uint256 fees = bounty.totalFeesCollected();
        uint256 treasuryBefore = treasury.balance;
        vm.prank(treasury);
        bounty.withdrawFees();
        assertEq(treasury.balance, treasuryBefore + fees);
        assertEq(bounty.totalFeesCollected(), 0);
    }

    // --- Submit ---

    function testOnlyWorkerCanSubmit() public {
        uint256 id = _post(0.01 ether, block.timestamp + 1 hours);
        vm.prank(worker);
        bounty.claimBounty(id);

        vm.prank(other);
        vm.expectRevert(TinyBounty.NotBountyWorker.selector);
        bounty.submitWork(id, "uri");
    }

    function testSubmitRevertsAfterDeadline() public {
        uint256 id = _post(0.01 ether, block.timestamp + 1 hours);
        vm.prank(worker);
        bounty.claimBounty(id);

        vm.warp(block.timestamp + 2 hours);
        vm.prank(worker);
        vm.expectRevert(TinyBounty.DeadlinePassed.selector);
        bounty.submitWork(id, "uri");
    }
}
