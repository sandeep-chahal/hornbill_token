// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HornBill is ERC20 {
    address public immutable daiAddress;

    constructor(address _daiAddress) ERC20("HornBill", "HB") {
        daiAddress = _daiAddress;
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
}
