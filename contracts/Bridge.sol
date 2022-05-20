// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./HornBill.sol";

contract Bridge is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    address public tokenAddress; // address of the token contract
    address public owner;

    // used when request is fulfilled
    struct JobData {
        address sender;
        uint256 nonce;
    }

    // to remember the which chain user wants to mint [amount] token after burning
    struct BurnedTokenData {
        uint256 toChainId;
        uint256 amount;
    }

    //      from                 nonce    true/false
    mapping(address => mapping(uint256 => bool)) public mintedTokens;
    //      from                 nonce    amount
    mapping(address => mapping(uint256 => BurnedTokenData)) public burnedTokens;
    mapping(bytes32 => JobData) internal reqIdToJobData;
    mapping(address => uint256) public nonces;

    string public apiUrl;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    constructor(
        address _tokenAddress,
        address _owner,
        string memory _apiUrl,
        address _oracle,
        bytes32 _jobId,
        uint256 _fee,
        address _linkTokenAddress
    ) {
        tokenAddress = _tokenAddress;
        owner = _owner;
        apiUrl = _apiUrl;

        setChainlinkToken(_linkTokenAddress);
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Bridge Error: Only owner can call this function"
        );
        _;
    }

    function setApiUrl(string memory _apiUrl) external onlyOwner {
        apiUrl = _apiUrl;
    }

    function setOracleArgs(
        address _oracle,
        bytes32 _jobId,
        uint256 _fee
    ) external onlyOwner {
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }

    function buildApiUrl(uint256 nonce, uint256 fromChainId)
        internal
        view
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    apiUrl,
                    "?nonce=",
                    Strings.toString(nonce),
                    "&address=",
                    Strings.toHexString(uint160(msg.sender), 20),
                    "&fromChainId=",
                    Strings.toString(fromChainId)
                )
            );
    }

    // uses chainlink to call the api which will return the amount of tokens burend on other chain
    function mint(uint256 nonce, uint256 fromChainId)
        external
        returns (bytes32)
    {
        require(
            mintedTokens[msg.sender][nonce] == false,
            "Bridge Error: Already minted"
        );

        // build the request
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        request.add("get", buildApiUrl(nonce, fromChainId));
        // {
        //    AMOUNT: XXXXX
        // }
        request.add("path", "AMOUNT");
        request.addInt("times", 10**18);

        // send the request
        bytes32 reqId = sendChainlinkRequestTo(oracle, request, fee);
        // store request id
        reqIdToJobData[reqId] = JobData(msg.sender, nonce);
        return reqId;
    }

    function fulfill(bytes32 _requestId, uint256 _amount)
        public
        recordChainlinkFulfillment(_requestId)
    {
        // get the job data(i.e. sender, nonce) using request id
        JobData memory jobData = reqIdToJobData[_requestId];

        // set the state to minted
        mintedTokens[jobData.sender][jobData.nonce] = true;

        // delete the job data
        delete reqIdToJobData[_requestId];

        // mint
        HornBill(tokenAddress).mint(jobData.sender, _amount);
    }

    function burn(uint256 amount, uint256 toChainId)
        external
        returns (uint256)
    {
        uint256 nonce = nonces[msg.sender];
        HornBill(tokenAddress).burn(msg.sender, amount);
        burnedTokens[msg.sender][nonce] = BurnedTokenData(toChainId, amount);
        nonces[msg.sender]++;
        return nonce;
    }
}
