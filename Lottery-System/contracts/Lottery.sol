fix the contract then:
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Lottery is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    VRFConsumerBaseV2Plus
{
    uint256 public subscriptionId;
    bytes32 public keyHash;

    uint32 public callbackGasLimit;
    uint16 public requestConfirmations;
    uint32 public numWords;

    uint256 public lastRequestId;
    uint256[] public lastRandomWords;

    struct RequestStatus {
        bool exists;
        bool fulfilled;
        uint256[] randomWords;
    }

    mapping(uint256 => RequestStatus) public requests;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() VRFConsumerBaseV2Plus(address(0)) {
        _disableInitializers();
    }

    function initialize(
        address vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        // VRF config
        // If your compiler complains here because of visibility,
        // change this line to: this.setCoordinator(vrfCoordinator);
        setCoordinator(vrfCoordinator);

        subscriptionId = _subscriptionId;
        keyHash = _keyHash;

        // safer default for testing than 250k
        callbackGasLimit = 700_000;
        requestConfirmations = 3;
        numWords = 7;
    }

    function requestRandomWords(bool enableNativePayment)
        external
        onlyOwner
        returns (uint256 requestId)
    {
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: enableNativePayment
                    })
                )
            })
        );

        requests[requestId] = RequestStatus({
            exists: true,
            fulfilled: false,
            randomWords: new uint256
        });

        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        require(requests[requestId].exists, "Request not found");

        requests[requestId].fulfilled = true;
        requests[requestId].randomWords = randomWords;
        lastRandomWords = randomWords;

        emit RequestFulfilled(requestId, randomWords);
    }

    function getRequestStatus(uint256 requestId)
        external
        view
        returns (bool fulfilled, uint256[] memory randomWords)
    {
        require(requests[requestId].exists, "Request not found");
        RequestStatus storage request = requests[requestId];
        return (request.fulfilled, request.randomWords);
    }

    function getLastRandomWords() external view returns (uint256[] memory) {
        return lastRandomWords;
    }

    function setCallbackGasLimit(uint32 _callbackGasLimit) external onlyOwner {
        callbackGasLimit = _callbackGasLimit;
    }

    function setRequestConfirmations(uint16 _requestConfirmations) external onlyOwner {
        requestConfirmations = _requestConfirmations;
    }

    function setNumWords(uint32 _numWords) external onlyOwner {
        require(_numWords > 0, "numWords must be > 0");
        numWords = _numWords;
    }

    function setSubscriptionId(uint256 _subscriptionId) external onlyOwner {
        subscriptionId = _subscriptionId;
    }

    function setKeyHash(bytes32 _keyHash) external onlyOwner {
        keyHash = _keyHash;
    }

    function updateCoordinator(address newCoordinator) external onlyOwner {
        setCoordinator(newCoordinator);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint256[50] private __gap;
}