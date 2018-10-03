pragma solidity ^0.4.24;

contract BaseContract {

	address public currentImplementation;
	address public admin;
	address public pendingAdmin;
    bool stateUpgraded;

	event AdminRightsTransferred(address oldAdmin, address newAdmin);
	event ContractUpgraded(address oldTarget, address newTarget);

	constructor() public {
		admin = msg.sender;
	}

	function upgrade(address _target) onlyAdmin public {

        emit ContractUpgraded(currentImplementation, _target);
        currentImplementation = _target;

		stateUpgraded = false;
        currentImplementation.delegatecall(bytes4(keccak256("upgradeState()")));
		require(stateUpgraded);
    }

	function upgradeState() external {

		require(!stateUpgraded);
		performStateUpgrade();
		stateUpgraded = true;
	}

	modifier onlyAdmin() {
		require(msg.sender == admin);
		_;
	}

	function transferAdminRights(address _newAdmin) public onlyAdmin {
		pendingAdmin = _newAdmin;
	}

	function claimAdminRights() public {

		require(msg.sender == pendingAdmin);

		emit AdminRightsTransferred(admin, pendingAdmin);

		admin = pendingAdmin;
		pendingAdmin = address(0);
	}

	function version() public view returns (string);
	function performStateUpgrade() internal;
}
