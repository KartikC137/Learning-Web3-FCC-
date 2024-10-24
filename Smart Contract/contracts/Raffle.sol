// raffle

// enter the lottery with some amount
// pick a random winner
// winner to selected every x minutes --> automatic

//Chainlink Oracle -> Randomness, Automated execution (Chainlink keeper)

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpKeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState
);

/**
 * @title A sample Raffle Contract
 * @author Kartik
 * @notice This contract is for creating untamperable smart contract
 * @dev This implements Chainlink VRFv2.5 and ChainkLink Keepers
 */

contract Raffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    /* Type Declarations*/
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    /* State Variables*/
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint256 private immutable i_entraceFee;
    address payable[] private s_players;
    bytes32 private immutable i_gasLane;
    uint256 private immutable i_subId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable i_gasLimit;
    uint32 private constant NUM_WORDS = 1;

    //Lottery variables
    address private s_recentWinner;
    RaffleState private s_raffleState; // to pending, open, closed, calculating
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    //Events
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    /*Functions*/
    constructor(
        address vrfCoordinatorV2, // contract (deploy mocks for local hosts)
        uint256 entraceFee,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callBackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2Plus(vrfCoordinatorV2) {
        i_entraceFee = entraceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subId = subscriptionId;
        i_gasLimit = callBackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    function enterRaffle() public payable {
        // require (msg.value > i_entranceFee,"Not enough ETH!")
        // or more gas eff. :

        if (msg.value < i_entraceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }

        s_players.push(payable(msg.sender));
        // emit an event when we update a dynamic array or mapping
        // Named events with the function name reversed
        emit RaffleEnter(msg.sender);
    }

    /**
     *
     * @dev This is function that the Chainlink Keeper nodes call
     * they look for the `upKeepNeeded` to return true
     * The following should be true in order to return  true:
     * 1. Our time interval should have passed
     * 2. The lottery should have at least 1 player, and have some ETH
     * 3. Our subscription is funded with LINK
     * 4. The lottery should be in an "open" state
     */

    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        override
        returns (
            //view
            bool upkeepNeeded,
            bytes memory /*performData*/
        )
    {
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval; //block.timestamp -  last block timestamp  > interval
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = (address(this).balance > 0);
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "");
    }

    function performUpkeep(bytes calldata /*performData*/) external override {
        //function to pick Random winner after a certain interval
        //request random number
        //2 transaction process
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpKeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_gasLane,
                subId: i_subId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_gasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /*requestId*/,
        uint256[] calldata randomWords
    ) internal override {
        // suppose s_players size is 10, and randomNumber is 69
        // so 69 % 10 = 9
        // uint256 indexOfWinner = randomWords[0] % s_players.length;
        // address payable recentWinner = s_players[indexOfWinner];
        address payable recentWinner = s_players[
            randomWords[0] % s_players.length
        ];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entraceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
