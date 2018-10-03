pragma solidity ^0.4.24;

import "../../contracts/common/BaseContract.sol";

contract StubV2BaseContract is BaseContract {
	
	uint public versionCode;
	
	function performStateUpgrade() internal {
			
		versionCode = 2;
	}
	
	function version() public view returns (string) {
		return "1.0.1";
	}
}