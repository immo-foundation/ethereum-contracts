pragma solidity ^0.4.24;

import "../common/BaseContract.sol";
import "../utils/Bytes32HashSet.sol";

contract High1000 is BaseContract {

	using Bytes32HashSet for Bytes32HashSet.Data;

    struct PropertySet {

        mapping (uint => uint) uints;
        mapping (uint => int) ints;
        mapping (uint => bool) booleans;
        mapping (uint => address) addresses;
        mapping (uint => string) strings;
        mapping (uint => bytes) byteArrays;
    }

	event ManagerChanged(address oldManager, address newManager);
	event MemberAdded(bytes32 memberId);
	event MemberRemoved(bytes32 memberId);

	uint constant PROPERTY_STRING_NAME = 1;
	uint constant PROPERTY_STRING_COUNTRY = 2;
	uint constant PROPERTY_STRING_LINKEDIN = 3;
	uint constant PROPERTY_UINT_REGISTRATION_TIME = 1;
	uint constant PROPERTY_UINT_GROUP_ID = 2;

	uint constant GROUP_ID_EVANGELIST = 1;
	uint constant GROUP_ID_1_100 = 2;
	uint constant GROUP_ID_101_300 = 3;
	uint constant GROUP_ID_301_1000 = 4;

	address public manager;
	Bytes32HashSet.Data memberSet;
	mapping(bytes32 => PropertySet) membersProperties;

	constructor() public {
		performStateUpgrade();
	}

	modifier onlyManager() {
		require(msg.sender == manager);
		_;
	}

	function performStateUpgrade() internal {
		admin = msg.sender;
		manager = msg.sender;
	}

	function version() public view returns (string) {
		return "1.0.0";
	}

	function setManager(address _newManager) public onlyAdmin {

		emit ManagerChanged(manager, _newManager);
		manager = _newManager;
	}

	// ====================================

	function addMember(string _name,
					   uint8 _groupId,
					   string _country,
					   string _linkedInProfile) public onlyManager returns (bytes32) {

		bytes32 memberId = keccak256(_name, _country, block.timestamp);

		require(!memberSet.contains(memberId));

		membersProperties[memberId].strings[PROPERTY_STRING_NAME] = _name;
		membersProperties[memberId].strings[PROPERTY_STRING_COUNTRY] = _country;
		membersProperties[memberId].strings[PROPERTY_STRING_LINKEDIN] = _linkedInProfile;
		membersProperties[memberId].uints[PROPERTY_UINT_REGISTRATION_TIME] = block.timestamp;
		membersProperties[memberId].uints[PROPERTY_UINT_GROUP_ID] = _groupId;

		memberSet.add(memberId);
		emit MemberAdded(memberId);
		return memberId;
	}

	function setMemberName(bytes32 _memberId, string _name) public onlyManager {

		require(memberSet.contains(_memberId));
		membersProperties[_memberId].strings[PROPERTY_STRING_NAME] = _name;
	}

	function setMemberCountry(bytes32 _memberId, string _country) public onlyManager {

		require(memberSet.contains(_memberId));
		membersProperties[_memberId].strings[PROPERTY_STRING_COUNTRY] = _country;
	}

	function setMemberLinkedInProfile(bytes32 _memberId, string _linkedInProfile) public onlyManager {

		require(memberSet.contains(_memberId));
		membersProperties[_memberId].strings[PROPERTY_STRING_LINKEDIN] = _linkedInProfile;
	}

	function setMemberGroup(bytes32 _memberId, uint8 _groupId) public onlyManager {

		require(memberSet.contains(_memberId));
		membersProperties[_memberId].uints[PROPERTY_UINT_GROUP_ID] = _groupId;
	}

	function deleteMember(bytes32 _memberId) public onlyManager {

		require(memberSet.contains(_memberId));

		for(uint i = PROPERTY_STRING_NAME; i <= PROPERTY_STRING_LINKEDIN; i++)
			delete membersProperties[_memberId].strings[i];

		for(i = PROPERTY_UINT_REGISTRATION_TIME; i <= PROPERTY_UINT_GROUP_ID; i++)
			delete membersProperties[_memberId].uints[i];

		memberSet.remove(_memberId);
		emit MemberRemoved(_memberId);
	}

	function memberIds() public view returns (bytes32[] numbers) {
		return memberSet.elements;
	}

	function memberGroupOf(bytes32 _memberId) public view returns (uint) {
		return membersProperties[_memberId].uints[PROPERTY_UINT_GROUP_ID];
	}

	function memberInfo(bytes32 _memberId) public view
			returns (
					string name,
					string country,
					string linkedInProfile,
					uint registrationTime,
					uint groupId)
	{
		name = membersProperties[_memberId].strings[PROPERTY_STRING_NAME];
		country = membersProperties[_memberId].strings[PROPERTY_STRING_COUNTRY];
		linkedInProfile = membersProperties[_memberId].strings[PROPERTY_STRING_LINKEDIN];
		registrationTime = membersProperties[_memberId].uints[PROPERTY_UINT_REGISTRATION_TIME];
		groupId = membersProperties[_memberId].uints[PROPERTY_UINT_GROUP_ID];
	}
}
