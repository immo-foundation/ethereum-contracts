pragma solidity ^0.4.24;

import "../../contracts/common/BaseContract.sol";

contract StubV3BaseContract is BaseContract {
	
	uint public versionCode;
	
	function performStateUpgrade() internal {
			
		versionCode = 3;
	}
	
	function version() public view returns (string) {
		return "1.1.0";
	}
}