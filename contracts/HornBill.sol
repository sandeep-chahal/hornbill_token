// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HornBill is ERC20 {
    address public immutable daiAddress;
    address public bridgeAddress;
    address public owner;

    constructor(
        address _daiAddress,
        address _bridgeAddress,
        address _owner
    ) ERC20("HornBill", "HB") {
        daiAddress = _daiAddress;
        bridgeAddress = _bridgeAddress;
        owner = _owner;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "HornBill Error: Only owner can call this function"
        );
        _;
    }
    modifier onlyBridge() {
        require(
            msg.sender == bridgeAddress,
            "HornBill Error: Only bridge can call this function"
        );
        _;
    }

    function buy(uint256 amount) public returns (bool) {
        IERC20(daiAddress).transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, amount);
        return true;
    }

    function sell(uint256 amount) public returns (bool) {
        _burn(msg.sender, amount);
        IERC20(daiAddress).transfer(msg.sender, amount);
        return true;
    }

    // for bridge
    function mint(address to, uint256 amount)
        external
        onlyBridge
        returns (bool)
    {
        _mint(to, amount);
        return true;
    }

    function burn(address from, uint256 amount)
        external
        onlyBridge
        returns (bool)
    {
        _burn(from, amount);
        return true;
    }

    function setBridge(address _bridgeAddress)
        external
        onlyOwner
        returns (bool)
    {
        bridgeAddress = _bridgeAddress;
        return true;
    }

    function setOwner(address _owner) external onlyOwner returns (bool) {
        owner = _owner;
        return true;
    }
}
